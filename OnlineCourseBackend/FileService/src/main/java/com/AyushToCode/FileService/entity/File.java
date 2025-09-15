package com.AyushToCode.FileService.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String name;
    private String type;
    @Lob
    @Column(columnDefinition = "BLOB")
    private byte[] data;
    private Long sectionId;
}
