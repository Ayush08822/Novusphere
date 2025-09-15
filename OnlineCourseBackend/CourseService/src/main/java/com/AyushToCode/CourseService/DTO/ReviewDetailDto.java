package com.AyushToCode.CourseService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReviewDetailDto {
    private double rating;
    private String comment;
    private LocalDateTime date;
    private String reviewerName; // The user's email
}
