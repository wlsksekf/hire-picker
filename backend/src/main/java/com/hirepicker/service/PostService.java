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
@RequiredArgsConstructor // final 필드 자동 생성자 주입 (@Autowired 불필요)
public class PostService {

    private final PostRepository postRepository;            // DB 액세스 레이어
    private final RedisTemplate<String, Object> redisTemplate; // Redis 캐시

    private static final int PAGE_SIZE = 10;

    // S3 환경변수 주입
    @Value("${S3_ACCESS_KEY}")
    private String awsAccessKey;
    @Value("${S3_SECRET_KEY}")
    private String awsSecretKey;
    @Value("${S3_BUCKET_NAME}")
    private String s3BucketName;
    @Value("${S3_REGION:ap-northeast-2}")
    private String s3Region;

    // AWS S3 Client 생성
    private AmazonS3 getS3Client() {
        BasicAWSCredentials creds = new BasicAWSCredentials(awsAccessKey, awsSecretKey);
        return AmazonS3ClientBuilder.standard()
                .withRegion(s3Region)
                .withCredentials(new AWSStaticCredentialsProvider(creds))
                .build();
    }

    // S3 업로드 (첨부파일/이미지 구분, S3 key 반환)
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

    // S3 실제 삭제
    private void deleteFromS3(String key) {
        if (key == null || key.isBlank()) return;
        AmazonS3 s3 = getS3Client();
        s3.deleteObject(s3BucketName, key);
    }

    // 게시글 작성 (CREATE)
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
        post.setImgName(imgKey);   // S3 key만 저장
        post.setFileName(fileKey); // S3 key만 저장
        post.setViewCount(0);

        return postRepository.save(post);
    }

    // 전체 게시글 조회 (pagination)
    public Page<PostListDto> getAllPostList(int cPage) {
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findAllPostList(pageable);
    }

    // 카테고리별 게시글 조회
    public Page<PostListDto> getByBoardIdx(String bname, int cPage, Long boardIdx) {
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findByBoardIdx(boardIdx, pageable);
    }

    // 게시글 상세 조회 + 조회수 증가(중복방지, Redis 24시간 TTL)
    @Transactional
    public PostListDto getPostDetailWithNickname(Long postIdx, String userKey) {
        String cacheKey = "viewed:" + userKey + ":" + postIdx;
        // 1. Redis에서 키가 이미 있으면 - 중복 조회 (조회수 증가X)
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cacheKey))) {
            return postRepository.findPostDetailWithNickname(postIdx)
                .orElse(null);
        }
        // 2. 조회수 DB 1 증가 + Redis에 24시간 키 기록
        postRepository.increaseViewCount(postIdx); // 동시성 안전 Native 쿼리 필요
        redisTemplate.opsForValue().set(cacheKey, "1", 24, TimeUnit.HOURS);
        return postRepository.findPostDetailWithNickname(postIdx)
            .orElse(null);
    }

    // 게시글 수정 + S3 파일/이미지 삭제/변경
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
                String newImgKey = uploadFileToS3(imageFile, "images");
                post.setImgName(newImgKey);
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
                String newFileKey = uploadFileToS3(attachmentFile, "attachments");
                post.setFileName(newFileKey);
            } catch (Exception e) {
                throw new RuntimeException("첨부파일 업로드 실패", e);
            }
        }

        postRepository.save(post);
        return true;
    }

    // 게시글 삭제 (S3 파일/이미지 동시 삭제)
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
