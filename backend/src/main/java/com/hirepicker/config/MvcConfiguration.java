package com.hirepicker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {
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
