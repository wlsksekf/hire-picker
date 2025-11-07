package com.hirepicker.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Posts;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PersonalUserRepository personalUserRepository;

    private static final int PAGE_SIZE = 10;

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

    // S3 업로드 (첨부파일 = attachments, 이미지 = images)
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

    // S3 실제 삭제 로직
    private void deleteFromS3(String key) {
        if (key == null || key.isBlank())
            return;
        AmazonS3 s3 = getS3Client();
        s3.deleteObject(s3BucketName, key);
    }

    // 게시글 작성 (CREATE)
    @Transactional
    public Posts create(Long boardIdx, PersonalUser personalUser, String title, String content,
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
        post.setPersonalUser(personalUser);
        post.setTitle(title);
        post.setContent(content);
        post.setImgName(imgKey); // S3 key만 저장
        post.setFileName(fileKey); // S3 key만 저장
        post.setViewCount(0);

        return postRepository.save(post);
    }

    // 게시글 전체목록 조회
    public Page<PostListDto> getAllPostList(int cPage) {
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findAllPostList(pageable);
    }

        // 카테고리별 게시글 조회
    public Page<PostListDto> getByBoardIdx(String bname, int cPage, Long boardIdx) {
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findByBoardIdx(boardIdx, pageable);
    }

    // 게시글 상세 조회
    public PostListDto getPostDetailWithNickname(Long postIdx) {
        return postRepository.findPostDetailWithNickname(postIdx)
                .orElse(null);
    }

    // 게시글 수정 + S3 파일/이미지 삭제/변경까지 종합!
    @Transactional
    public boolean updatePost(Long postIdx, Long loginUserIdx, String title, String content,
            MultipartFile imageFile, MultipartFile attachmentFile,
            boolean deleteImg, boolean deleteFile) {
        Posts post = postRepository.findById(postIdx).orElse(null);
        if (post == null || !post.getPersonalUser().getId().equals(loginUserIdx)) {
            return false;
        }
        post.setTitle(title);
        post.setContent(content);

        // 이미지 삭제/변경
        if (deleteImg && post.getImgName() != null) {
            deleteFromS3(post.getImgName());
            post.setImgName(null); // DB도 null로
        } else if (imageFile != null && !imageFile.isEmpty()) {
            if (post.getImgName() != null)
                deleteFromS3(post.getImgName());
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
            if (post.getFileName() != null)
                deleteFromS3(post.getFileName());
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

    // --- 게시글 삭제 (글, S3 파일/이미지 동시 삭제) ---
    @Transactional
    public boolean deletePostWithFiles(Long postIdx, Long loginUserIdx) {
        Posts post = postRepository.findById(postIdx).orElse(null);
        if (post == null || !post.getPersonalUser().getId().equals(loginUserIdx))
            return false;

        // S3 이미지/파일 삭제
        if (post.getImgName() != null)
            deleteFromS3(post.getImgName());
        if (post.getFileName() != null)
            deleteFromS3(post.getFileName());

        postRepository.delete(post);
        return true;
    }

}
