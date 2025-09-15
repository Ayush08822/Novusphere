package com.AyushToCode.MyLearningService.controller;

import com.AyushToCode.MyLearningService.DTO.MyLearningCourseResponseDTO;
import com.AyushToCode.MyLearningService.service.MyLearningService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mylearning")
@AllArgsConstructor
public class MyLearningController {

    private final MyLearningService myLearningService;

    @PostMapping("/secure/add")
    public ResponseEntity<String> savePurchasedCourses(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        System.out.println(email);
        myLearningService.saveCourses(email);
        return ResponseEntity.ok("Courses saved to My Learning");
    }

    @GetMapping("/secure/get")
    public ResponseEntity<List<MyLearningCourseResponseDTO>> getPurchasedCourses(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        return new ResponseEntity<>(myLearningService.getCoursesByEmail(email), HttpStatus.OK);

    }
}
