package com.AyushToCode.gatewayserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.Duration;
import java.time.LocalDateTime;

@SpringBootApplication
	public class GatewayserverApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayserverApplication.class, args);
	}

	@Bean
	public RouteLocator RouteConfig(RouteLocatorBuilder routeLocatorBuilder) {
		return routeLocatorBuilder.routes()
				.route(p -> p
						.path("/app/courses/**")
						.filters(f -> f.rewritePath("/app/courses/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
						.uri("lb://COURSESERVICE"))
				.route(p -> p
						.path("/app/carts/**")
						.filters(f -> f.rewritePath("/app/carts/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
						.uri("lb://CARTSERVICE"))
				.route(p -> p
						.path("/app/files/**")
						.filters(f -> f.rewritePath("/app/files/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
						.uri("lb://FILESERVICE"))
				.route(p -> p
						.path("/app/videos/**")
						.filters(f -> f.rewritePath("/app/videos/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
						.uri("lb://VIDEOSERVICE"))
				.route(p -> p
						.path("/app/payments/**")
						.filters(f -> f.rewritePath("/app/payments/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
						.uri("lb://PAYMENTSERVICE"))
				.route(p -> p
						.path("/app/mylearning/**")
						.filters(f -> f.rewritePath("/app/mylearning/(?<segment>.*)", "/${segment}")
								.addResponseHeader("X-Response-Time", LocalDateTime.now().toString()))
						.uri("lb://MYLEARNINGSERVICE"))
				.build();
	}

}
