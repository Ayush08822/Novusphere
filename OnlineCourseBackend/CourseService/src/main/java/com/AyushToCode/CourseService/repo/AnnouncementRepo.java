package com.AyushToCode.CourseService.repo;

import com.AyushToCode.CourseService.DTO.AnnouncementResponseDTO;
import com.AyushToCode.CourseService.entity.Announcements;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepo extends JpaRepository<Announcements, Long> {
    List<Announcements> findByJobId(Long id);
}
