package com.AyushToCode.CourseService.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcements {

    @Id
    private String id;

    private String email;

    private String courseId;

    private String announcementTitle;

    private String announcementDescription;

    @CreatedDate
    private LocalDate createdAt;

}
