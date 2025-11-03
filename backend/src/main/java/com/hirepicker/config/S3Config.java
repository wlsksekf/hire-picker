package com.hirepicker.config;

// S3 클라이언트 빈 구성 (AWS SDK v2)

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${S3_ACCESS_KEY}")
    private String accessKey;

    @Value("${S3_SECRET_KEY}")
    private String secretKey;

    @Value("${S3_BUCKET_NAME}")
    private String bucketName;

    // S3 클라이언트 빈 등록 (서울 리전)
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.AP_NORTHEAST_2)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }

    // 버킷명 조회용
    public String getBucketName() {
        return bucketName;
    }
}

