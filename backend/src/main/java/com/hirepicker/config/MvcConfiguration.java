package com.hirepicker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // /api/ 로 시작하는 모든 요청을 처리
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메소드
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(true); // 쿠키 등 자격 증명 허용
    }

    // The custom ResourceHandlerRegistry was interfering with springdoc's own resource handler.
    // Spring Boot's default resource handling is sufficient for serving static content
    // from src/main/resources/static and for springdoc-openapi-ui to work.
    //
    // @Override
    // public void addResourceHandlers(final ResourceHandlerRegistry registry) {
    //     registry.addResourceHandler("/**")
    //             .addResourceLocations("classpath:/templates/", "classpath:/static/")
    //             .setCacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES));
    // }
}
