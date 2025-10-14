package com.AyushToCode.CourseService.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    private String id;

    private String email;

    private String tags;

    private String title;

    private boolean isPublic;

    private String description;

    private BigDecimal price;

    private String aboutAuthor;

    private int studentsEnrolled;

    private double rating;

    private String createdBy;

    private byte[] imageData;

    private String imageType;

    @LastModifiedDate
    private LocalDate updatedAt;

    private List<Section> sections = new ArrayList<>();

}
