package com.AyushToCode.CourseService.repo;

import com.AyushToCode.CourseService.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepo extends JpaRepository<Course , Long> {
    List<Course> findTop5ByOrderByRatingDesc();

    List<Course> findByEmail(String email);

    @Query("SELECT c FROM Course c WHERE " +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Course> searchByTitleOrTags(String query);

    Optional<Course> findByTitleAndCreatedBy(String title, String createdBy);
}
