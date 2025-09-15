package com.AyushToCode.CourseService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseDTO {
    private String tags;
    private String title;
    private String description;
    private String aboutAuthor;
    private BigDecimal price;
    private Integer studentsEnrolled;
    private Double rating;
    private String createdBy;
    private boolean isPublic;
}
