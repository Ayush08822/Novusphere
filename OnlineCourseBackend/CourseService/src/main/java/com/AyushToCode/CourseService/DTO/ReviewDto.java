package com.AyushToCode.CourseService.DTO;

import lombok.Data;

@Data
public class ReviewDto {
    private double rating;
    private String comment;
    private Long courseId;
}