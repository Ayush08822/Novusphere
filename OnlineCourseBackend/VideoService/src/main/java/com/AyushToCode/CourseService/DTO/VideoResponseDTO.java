package com.AyushToCode.CourseService.DTO;

import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoResponseDTO {
    private Long id;
    private String title;
    private String type;
    private byte[] data;
}
