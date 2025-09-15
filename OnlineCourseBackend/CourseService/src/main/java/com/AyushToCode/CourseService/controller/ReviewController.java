package com.AyushToCode.CourseService.controller;

import com.AyushToCode.CourseService.DTO.ReviewDto;
import com.AyushToCode.CourseService.DTO.ReviewsResponseDto;
import com.AyushToCode.CourseService.entity.Review;
import com.AyushToCode.CourseService.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;



@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/fetch-reviews/{courseId}")
    public ResponseEntity<ReviewsResponseDto> getCourseReviews(@PathVariable Long courseId) {
        ReviewsResponseDto response = reviewService.getReviewsForCourse(courseId);
        return ResponseEntity.ok(response);
    }

    // This corresponding POST endpoint shows how the email is handled.
    @PostMapping("/submit-review/{courseId}")
    public ResponseEntity<Review> addReview(@PathVariable Long courseId, @RequestBody ReviewDto reviewDto, @AuthenticationPrincipal Jwt jwt) {

        // Spring Security provides the user's details from the JWT.
        String userEmail = jwt.getClaimAsString("email");

        reviewDto.setCourseId(courseId);
        Review createdReview = reviewService.createReview(reviewDto, userEmail);
        return ResponseEntity.ok(createdReview);
    }
}

