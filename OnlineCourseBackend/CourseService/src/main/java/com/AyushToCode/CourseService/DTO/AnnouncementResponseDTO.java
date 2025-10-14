package com.AyushToCode.CourseService.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnnouncementResponseDTO {
    private String id;

    private String email;

    private String announcementTitle;

    private String announcementDescription;

    private LocalDate createdAt;
}
