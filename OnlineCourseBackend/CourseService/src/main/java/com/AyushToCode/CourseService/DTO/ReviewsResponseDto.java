package com.AyushToCode.CourseService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ReviewsResponseDto {
    private double averageRating;
    private List<ReviewDetailDto> reviews; // This will hold the detailed list
}
