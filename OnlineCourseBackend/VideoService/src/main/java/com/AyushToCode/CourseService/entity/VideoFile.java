package com.AyushToCode.CourseService.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class VideoFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String name;
    private String type;
    private Long sectionId;

    @Lob
    @Column(length = 1000000000) // Allows large videos
    private byte[] data;

    // Getters and Setters
}
