package com.hirepicker;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HirepickerApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().directory("../").ignoreIfMissing().load();

		// .env 파일에서 읽어온 값이 null이 아닐 경우에만 시스템 속성으로 설정합니다.
		String dbUrl = dotenv.get("DB_URL");
		if (dbUrl != null) {
			System.setProperty("DB_URL", dbUrl);
		}

		String dbUsername = dotenv.get("DB_USERNAME");
		if (dbUsername != null) {
			System.setProperty("DB_USERNAME", dbUsername);
		}

		String dbPassword = dotenv.get("DB_PASSWORD");
		if (dbPassword != null) {
			System.setProperty("DB_PASSWORD", dbPassword);
		}

		SpringApplication.run(HirepickerApplication.class, args);
	}

}