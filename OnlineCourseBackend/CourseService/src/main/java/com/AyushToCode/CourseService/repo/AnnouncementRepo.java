package com.AyushToCode.CourseService.repo;

import com.AyushToCode.CourseService.DTO.AnnouncementResponseDTO;
import com.AyushToCode.CourseService.entity.Announcements;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepo extends MongoRepository<Announcements, String> {
    List<Announcements> findByCourseId(String id);

    List<Announcements> findByCourseIdIn(List<String> courseIds);
}
