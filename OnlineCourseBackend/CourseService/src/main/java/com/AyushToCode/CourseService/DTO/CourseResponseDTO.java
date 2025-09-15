package com.AyushToCode.CourseService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponseDTO {
    private Long id;
    private String tags;
    private String title;
    private String description;
    private String aboutAuthor;
    private BigDecimal price;
    private Integer studentsEnrolled;
    private Double rating;
    private String createdBy;
    private byte[] imageData;
    private boolean isPublic;
    private String updatedAt;
}
