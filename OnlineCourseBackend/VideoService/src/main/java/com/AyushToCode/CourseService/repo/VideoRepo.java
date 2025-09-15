package com.AyushToCode.CourseService.repo;

import com.AyushToCode.CourseService.entity.VideoFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepo extends JpaRepository<VideoFile , Long> {
    Optional<VideoFile> findByName(String fileName);

    List<VideoFile> findBySectionId(Long sectionId);
}
