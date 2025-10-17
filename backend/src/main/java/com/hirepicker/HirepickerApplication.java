package com.hirepicker;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HirepickerApplication {

    public static void main(String[] args) {
        // Load .env file from the parent directory
        Dotenv dotenv = Dotenv.configure().directory("../").ignoreIfMissing().load();

        // Set environment variables as system properties
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

        SpringApplication.run(HirepickerApplication.class, args);
    }

}
