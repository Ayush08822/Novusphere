package com.AyushToCode.MyLearningService.controller;

import com.AyushToCode.MyLearningService.DTO.MyLearningCourseResponseDTO;
import com.AyushToCode.MyLearningService.service.MyLearningService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mylearning")
@AllArgsConstructor
public class MyLearningController {

    private final MyLearningService myLearningService;

    @PostMapping("/secure/add")
    public ResponseEntity<String> savePurchasedCourses(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        myLearningService.saveCourses(email);
        return ResponseEntity.ok("Courses saved to My Learning");
    }

    @GetMapping("/secure/check-enrollment/{courseId}")
    public ResponseEntity<?> getPurchasedCourses(@AuthenticationPrincipal Jwt jwt, @PathVariable String courseId) {
        String email = jwt.getClaim("email");
        // The Authorization Check
        if (!myLearningService.isUserEnrolled(email, courseId)) {
            // If not enrolled, return a "Forbidden" error.
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: You are not enrolled in this course.");
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }
    @GetMapping("/getCourses")
    public ResponseEntity<?> getPurchasedCoursesBasedOnEmail(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        return new ResponseEntity<>(myLearningService.getCoursesByEmail(email), HttpStatus.OK);
    }

    // Feign Client Mapping
    @GetMapping("/announce/getEmail")
    public ResponseEntity<List<String>> getAllEmailOnCourseId(@RequestParam String courseId){
        return new ResponseEntity<>(myLearningService.getAllEmailOnCourseId(courseId), HttpStatus.OK);
    }

    //Feign Client Mapping
    @GetMapping("/announce/getCourseIds")
    public ResponseEntity<List<String>> getAllCourseIdsOnEmail(@RequestParam String email){
        return new ResponseEntity<>(myLearningService.getCourseIds(email), HttpStatus.OK);
    }
}
