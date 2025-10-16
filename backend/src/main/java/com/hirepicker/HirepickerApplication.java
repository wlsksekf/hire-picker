package com.hirepicker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HirepickerApplication {

    public static void main(String[] args) {
        SpringApplication.run(HirepickerApplication.class, args);
    }

}
