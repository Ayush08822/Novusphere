package com.AyushToCode.FileService.repo;

import com.AyushToCode.FileService.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepo extends JpaRepository<File , Long> {
    Optional<File> findByName(String name);

    List<File> findBySectionId(Long videoId);

}
