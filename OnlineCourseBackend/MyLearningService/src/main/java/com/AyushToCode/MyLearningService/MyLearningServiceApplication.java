package com.AyushToCode.MyLearningService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MyLearningServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyLearningServiceApplication.class, args);
	}

}
