package com.AyushToCode.MyLearningService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MyLearningCourseResponseDTO {
    private Long id;
    private String title;
    private String createdBy;
    private byte[] imageData;
    private double rating;
    private Long courseId;
}
