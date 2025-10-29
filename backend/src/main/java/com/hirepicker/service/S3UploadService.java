package com.hirepicker.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.hirepicker.config.S3Config;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

// S3 파일 업로드를 담당하는 서비스
@Service
@RequiredArgsConstructor // final 필드를 주입받기 위한 Lombok 어노테이션
@Slf4j
public class S3UploadService {

    private final AmazonS3 amazonS3;
    private final S3Config s3Config;

    /**
     * 파일을 S3 버킷에 업로드합니다.
     * @param multipartFile 업로드할 파일
     * @param dirName S3 버킷 내의 디렉토리 이름 (예: "images", "resumes")
     * @return 업로드된 파일의 S3 URL
     * @throws IOException 파일 처리 중 발생할 수 있는 예외
     */
    public String uploadFile(MultipartFile multipartFile, String dirName) throws IOException {
        // 파일 이름 중복을 피하기 위해 UUID를 사용하여 고유한 파일 이름 생성
        String fileName = dirName + "/" + UUID.randomUUID() + "_" + multipartFile.getOriginalFilename();

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(multipartFile.getSize());
        metadata.setContentType(multipartFile.getContentType());

        try {
            amazonS3.putObject(s3Config.getBucketName(), fileName, multipartFile.getInputStream(), metadata);
        } catch (IOException e) {
            log.error("S3 파일 업로드 중 오류 발생: {}", e.getMessage());
            throw new IOException("S3 파일 업로드에 실패했습니다.", e);
        }
        return amazonS3.getUrl(s3Config.getBucketName(), fileName).toString();
    }
}
