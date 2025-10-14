package com.AyushToCode.CourseService.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
public class Review {

    @Id
    private String id;

    private double rating;

    private String comment;

    // The user's email, extracted from the JWT token at creation time
    private String userEmail;

    private LocalDateTime date;

    @DocumentReference(lazy = true) // 'lazy = true' is the equivalent of FetchType.LAZY
    private Course course;

}