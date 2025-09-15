package com.AyushToCode.CourseService.service;

import com.AyushToCode.CourseService.DTO.ReviewDetailDto;
import com.AyushToCode.CourseService.DTO.ReviewDto;
import com.AyushToCode.CourseService.DTO.ReviewsResponseDto;
import com.AyushToCode.CourseService.entity.Course;
import com.AyushToCode.CourseService.entity.Review;
import com.AyushToCode.CourseService.repo.CourseRepo;
import com.AyushToCode.CourseService.repo.ReviewRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepo reviewRepository;
    private final CourseRepo courseRepository; // Make sure you have this repository

    public ReviewsResponseDto getReviewsForCourse(Long courseId) {
        // 1. Fetch all reviews
        List<Review> reviews = reviewRepository.findByCourseId(courseId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));


        // 2. Calculate the average rating
        double averageRating = reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);

        // 3. Map the Review entities to DTOs, including the stored userEmail
        List<ReviewDetailDto> reviewDetails = reviews.stream()
                .map(review -> new ReviewDetailDto(
                        review.getRating(),
                        review.getComment(),
                        review.getDate(),
                        review.getUserEmail() // Get the email directly from the entity
                ))
                .collect(Collectors.toList());

        course.setRating(averageRating);
        courseRepository.save(course);

        // 4. Return the final response object
        return new ReviewsResponseDto(averageRating, reviewDetails);
    }

    /**
     * This is the corresponding method for creating a review,
     * showing how the email from the JWT is saved.
     */
    public Review createReview(ReviewDto reviewDto, String userEmail) {
        Course course = courseRepository.findById(reviewDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + reviewDto.getCourseId()));

        Review review = new Review();
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        review.setCourse(course);
        review.setUserEmail(userEmail); // Set the email from the token

        return reviewRepository.save(review);
    }
}
