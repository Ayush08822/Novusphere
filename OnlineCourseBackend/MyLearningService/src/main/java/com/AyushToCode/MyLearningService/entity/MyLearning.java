package com.AyushToCode.MyLearningService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "my_learning")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyLearning {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String email;

        private String title;

        private String createdBy;

        @Lob
        @Column(columnDefinition = "LONGBLOB")
        private byte[] imageData;

        private double rating;

        private LocalDateTime enrolledAt;

        private Long courseId;
}
