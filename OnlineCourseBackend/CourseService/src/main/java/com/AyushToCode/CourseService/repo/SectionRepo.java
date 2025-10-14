package com.AyushToCode.CourseService.repo;

import com.AyushToCode.CourseService.DTO.SectionResponseDTO;
import com.AyushToCode.CourseService.entity.Section;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SectionRepo extends MongoRepository<Section , String> {
    List<Section> findByCourseId(String courseId);
}
