package com.AyushToCode.MyLearningService.client;

import com.AyushToCode.MyLearningService.DTO.RatingResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "courseService")
public interface CourseFeignClient {

    @GetMapping("/api/courses/average/{courseId}")
    public RatingResponseDTO getCourseRating(@PathVariable("courseId") String courseId);
}
