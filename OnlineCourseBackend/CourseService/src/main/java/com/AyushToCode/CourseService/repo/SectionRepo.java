package com.AyushToCode.CourseService.repo;

import com.AyushToCode.CourseService.DTO.SectionResponseDTO;
import com.AyushToCode.CourseService.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionRepo extends JpaRepository<Section , Long> {
    List<Section> findByCourseId(Long courseId);
}
