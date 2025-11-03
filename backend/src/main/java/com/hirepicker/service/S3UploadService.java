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
        log.info("S3 파일 업로드 시작. 파일명: {}, 디렉토리: {}", multipartFile.getOriginalFilename(), dirName);
        String fileName = dirName + "/" + UUID.randomUUID() + "_" + multipartFile.getOriginalFilename();
        log.info("S3에 저장될 최종 파일명: {}", fileName);

        try {
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(s3Config.getBucketName())
                    .key(fileName)
                    .contentType(multipartFile.getContentType())
                    .build();

            log.info("S3 버킷명: {}", s3Config.getBucketName());
            log.info("파일 Content-Type: {}", multipartFile.getContentType());

            s3Client.putObject(
                    putReq,
                    RequestBody.fromInputStream(multipartFile.getInputStream(), multipartFile.getSize())
            );
            log.info("S3 파일 업로드 성공. 파일명: {}", fileName);

        } catch (IOException e) {
            log.error("S3 파일 업로드 중 IO 오류 발생: {}", e.getMessage(), e);
            throw new IOException("S3 파일 업로드에 실패했습니다.", e);
        } catch (Exception e) { // 기타 예외 처리 추가
            log.error("S3 파일 업로드 중 알 수 없는 오류 발생: {}", e.getMessage(), e);
            throw new IOException("S3 파일 업로드 중 알 수 없는 오류가 발생했습니다.", e);
        }

        String url = s3Client.utilities()
                .getUrl(b -> b.bucket(s3Config.getBucketName()).key(fileName))
                .toExternalForm();
        log.info("업로드된 파일 URL: {}", url);
        return url;
    }
}

