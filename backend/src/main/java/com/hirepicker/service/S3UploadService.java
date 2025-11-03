package com.hirepicker.service;

// S3 파일 업로드를 담당하는 서비스 (AWS SDK v2)

import com.hirepicker.config.S3Config;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3UploadService {

    private final S3Client s3Client; // S3 클라이언트 (v2)
    private final S3Config s3Config; // 버킷명 등의 설정 접근용

    /**
     * 파일을 S3 버킷에 업로드합니다.
     * @param multipartFile 업로드할 파일
     * @param dirName S3 버킷 내 디렉터리 이름 (예: "images", "resumes")
     * @return 업로드된 파일의 퍼블릭 URL
     * @throws IOException 파일 처리 중 발생 예외
     */
    public String uploadFile(MultipartFile multipartFile, String dirName) throws IOException {
        // 고유 파일명 생성 (한글 주석: 파일명 충돌 방지)
        String fileName = dirName + "/" + UUID.randomUUID() + "_" + multipartFile.getOriginalFilename();

        try {
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(s3Config.getBucketName())
                    .key(fileName)
                    .contentType(multipartFile.getContentType())
                    .build();

            s3Client.putObject(
                    putReq,
                    RequestBody.fromInputStream(multipartFile.getInputStream(), multipartFile.getSize())
            );
        } catch (IOException e) {
            log.error("S3 파일 업로드 중 오류 발생: {}", e.getMessage());
            throw new IOException("S3 파일 업로드에 실패했습니다.", e);
        }

        // 업로드된 객체의 URL 생성 (한글 주석: SDK 유틸리티 사용)
        String url = s3Client.utilities()
                .getUrl(b -> b.bucket(s3Config.getBucketName()).key(fileName))
                .toExternalForm();
        return url;
    }
}

