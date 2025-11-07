package com.hirepicker.service;

import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.Posts;
import com.hirepicker.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final int PAGE_SIZE = 10;

    @Value("${S3_ACCESS_KEY}")
    private String awsAccessKey;

    @Value("${S3_SECRET_KEY}")
    private String awsSecretKey;

    @Value("${S3_BUCKET_NAME}")
    private String s3BucketName;

    @Value("${S3_REGION:ap-northeast-2}")
    private String s3Region;

    // S3 Client 생성
    private AmazonS3 getS3Client() {
        BasicAWSCredentials creds = new BasicAWSCredentials(awsAccessKey, awsSecretKey);
        return AmazonS3ClientBuilder.standard()
                .withRegion(s3Region)
                .withCredentials(new AWSStaticCredentialsProvider(creds))
                .build();
    }

    // S3 파일 업로드
    private String uploadFileToS3(MultipartFile file, String dirName) throws IOException {
        AmazonS3 s3 = getS3Client();
        String originName = file.getOriginalFilename();
        String ext = originName.contains(".") ? originName.substring(originName.lastIndexOf(".")) : "";
        String saveName = UUID.randomUUID().toString() + ext;
        String key = dirName + "/" + saveName;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());
        if (!dirName.equalsIgnoreCase("images")) {
            metadata.setContentDisposition("attachment");
        }
        try (InputStream is = file.getInputStream()) {
            s3.putObject(s3BucketName, key, is, metadata);
        }
        return key;
    }

    // S3 파일 삭제
    private void deleteFromS3(String key) {
        if (key == null || key.isBlank()) return;
        AmazonS3 s3 = getS3Client();
        s3.deleteObject(s3BucketName, key);
    }

    // 게시글 작성
    @Transactional
    public Posts create(Long boardIdx, Long pUserIdx, String title, String content,
                        MultipartFile imageFile, MultipartFile attachmentFile) throws IOException {
        String imgKey = null;
        String fileKey = null;

        if (imageFile != null && !imageFile.isEmpty()) {
            imgKey = uploadFileToS3(imageFile, "images");
        }
        if (attachmentFile != null && !attachmentFile.isEmpty()) {
            fileKey = uploadFileToS3(attachmentFile, "attachments");
        }

        Posts post = new Posts();
        post.setBoardIdx(boardIdx);
        post.setPUserIdx(pUserIdx);
        post.setTitle(title);
        post.setContent(content);
        post.setImgName(imgKey);
        post.setFileName(fileKey);
        post.setViewCount(0);

        return postRepository.save(post);
    }

    // 게시글 전체 목록 조회
    public Page<PostListDto> getAllPostList(int cPage) {
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findAllPostList(pageable);
    }

    // 카테고리별 게시글 조회
    public Page<PostListDto> getByBoardIdx(String bname, int cPage, Long boardIdx) {
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findByBoardIdx(boardIdx, pageable);
    }

    // 게시글 상세, 조회수 증가 (회원/비회원 중복 방지, Redis TTL 24시간)
    @Transactional
    public PostListDto getPostDetailWithNickname(Long postIdx, String userKey) {
        String cacheKey = "viewed:" + userKey + ":" + postIdx;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cacheKey))) {
            return postRepository.findPostDetailWithNickname(postIdx)
                    .orElse(null);
        }
        // 조회수 DB 1 증가 + Redis 키 생성
        postRepository.increaseViewCount(postIdx); // Native 쿼리 필요
        redisTemplate.opsForValue().set(cacheKey, "1", 24, TimeUnit.HOURS);
        return postRepository.findPostDetailWithNickname(postIdx)
                .orElse(null);
    }

    // 게시글 수정 + S3 파일/이미지 변경
    @Transactional
    public boolean updatePost(Long postIdx, Long loginUserIdx, String title, String content,
                              MultipartFile imageFile, MultipartFile attachmentFile,
                              boolean deleteImg, boolean deleteFile) {
        Posts post = postRepository.findById(postIdx).orElse(null);
        if (post == null || !post.getPUserIdx().equals(loginUserIdx)) {
            return false;
        }
        post.setTitle(title);
        post.setContent(content);

        // 이미지 삭제/변경
        if (deleteImg && post.getImgName() != null) {
            deleteFromS3(post.getImgName());
            post.setImgName(null);
        } else if (imageFile != null && !imageFile.isEmpty()) {
            if (post.getImgName() != null) deleteFromS3(post.getImgName());
            try {
                post.setImgName(uploadFileToS3(imageFile, "images"));
            } catch (Exception e) {
                throw new RuntimeException("이미지 업로드 실패", e);
            }
        }

        // 첨부파일 삭제/변경
        if (deleteFile && post.getFileName() != null) {
            deleteFromS3(post.getFileName());
            post.setFileName(null);
        } else if (attachmentFile != null && !attachmentFile.isEmpty()) {
            if (post.getFileName() != null) deleteFromS3(post.getFileName());
            try {
                post.setFileName(uploadFileToS3(attachmentFile, "attachments"));
            } catch (Exception e) {
                throw new RuntimeException("첨부파일 업로드 실패", e);
            }
        }

        postRepository.save(post);
        return true;
    }

    // 게시글 삭제 + S3 동시 삭제
    @Transactional
    public boolean deletePostWithFiles(Long postIdx, Long loginUserIdx) {
        Posts post = postRepository.findById(postIdx).orElse(null);
        if (post == null || !post.getPUserIdx().equals(loginUserIdx)) return false;

        if (post.getImgName() != null) deleteFromS3(post.getImgName());
        if (post.getFileName() != null) deleteFromS3(post.getFileName());

        postRepository.delete(post);
        return true;
    }
}
