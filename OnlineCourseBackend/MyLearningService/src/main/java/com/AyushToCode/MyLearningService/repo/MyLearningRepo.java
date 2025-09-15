package com.AyushToCode.MyLearningService.repo;

import com.AyushToCode.MyLearningService.entity.MyLearning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MyLearningRepo extends JpaRepository<MyLearning, Long> {
    List<MyLearning> findByEmail(String email);
}
