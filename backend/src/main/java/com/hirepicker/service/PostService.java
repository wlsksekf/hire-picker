package com.hirepicker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;

import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.Posts;
import com.hirepicker.repository.PostRepository;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.UUID;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    private static final int PAGE_SIZE = 10;
    private static final Long DEFAULT_BOARD_ID = 1L;

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

    // S3 업로드 (메타데이터 강제 설정)
    private String uploadFileToS3(MultipartFile file, String dirName) throws IOException {
        AmazonS3 s3 = getS3Client();
        String originName = file.getOriginalFilename();
        String ext = originName.contains(".") ? originName.substring(originName.lastIndexOf(".")) : "";
        String saveName = UUID.randomUUID().toString() + ext;
        String key = dirName + "/" + saveName;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        // 첨부파일(이미지 제외)에만 Content-Disposition 추가
        if (!dirName.equalsIgnoreCase("images")) {
            metadata.setContentDisposition("attachment");
        }

        // S3에 putObject 할 때 반드시 metadata가 전달되도록!
        try (InputStream is = file.getInputStream()) {
            s3.putObject(s3BucketName, key, is, metadata);
        }
        return key; // key만 반환(DB 저장)
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

    // 게시글 목록 조회
    public Page<PostListDto> getPostListWithNickname(String bname, int cPage) {
        Long boardIdx = DEFAULT_BOARD_ID;
        Pageable pageable = PageRequest.of(cPage - 1, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "postIdx"));
        return postRepository.findPostListWithNickname(boardIdx, pageable);
    }

    // 게시글 상세 조회
    public PostListDto getPostDetailWithNickname(Long postIdx) {
        return postRepository.findPostDetailWithNickname(postIdx)
            .orElse(null);
    }
}
