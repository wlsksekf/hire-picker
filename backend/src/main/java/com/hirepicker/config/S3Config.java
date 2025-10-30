package com.hirepicker.config;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration // 스프링 설정 클래스임을 나타냅니다.
public class S3Config {

    @Value("${S3_ACCESS_KEY}") // .env 파일에서 S3_ACCESS_KEY 값을 주입받습니다.
    private String accessKey;

    @Value("${S3_SECRET_KEY}") // .env 파일에서 S3_SECRET_KEY 값을 주입받습니다.
    private String secretKey;

    @Value("${S3_BUCKET_NAME}") // .env 파일에서 S3_BUCKET_NAME 값을 주입받습니다.
    private String bucketName;

    @Bean // AmazonS3 클라이언트를 스프링 빈으로 등록합니다.
    public AmazonS3 amazonS3Client() {
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        return AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion("ap-northeast-2") // S3 버킷이 위치한 리전을 설정합니다.
                .build();
    }

    public String getBucketName() {
        return bucketName;
    }
}
