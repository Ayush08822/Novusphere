package com.AyushToCode.CourseService.repo;

import com.AyushToCode.CourseService.entity.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CourseRepo extends MongoRepository<Course , String> {
    List<Course> findTop5ByOrderByRatingDesc();

    List<Course> findByEmail(String email);

    @Query("SELECT c FROM Course c WHERE " +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Course> searchByTitleOrTags(String query);

    Optional<Course> findByTitleAndCreatedBy(String title, String createdBy);
}
