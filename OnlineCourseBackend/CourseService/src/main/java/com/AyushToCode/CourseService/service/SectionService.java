package com.AyushToCode.CourseService.service;

import com.AyushToCode.CourseService.DTO.SectionRequestDTO;
import com.AyushToCode.CourseService.DTO.SectionResponseDTO;
import com.AyushToCode.CourseService.entity.Course;
import com.AyushToCode.CourseService.entity.Section;
import com.AyushToCode.CourseService.repo.CourseRepo;
import com.AyushToCode.CourseService.repo.SectionRepo;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class SectionService {
    private final SectionRepo sectionRepo;
    private final CourseRepo courseRepo;

    public SectionResponseDTO createSection(SectionRequestDTO sectionDTO) {
        Course course = courseRepo.findById(sectionDTO.getCourseId()).orElseThrow(() -> new RuntimeException("Course not found with ID: " + sectionDTO.getCourseId()));

        Section section = new Section();
        section.setName(sectionDTO.getName());
        section.setCourse(course);

        Section savedSection = sectionRepo.save(section);

        SectionResponseDTO sectionResponseDTO = new SectionResponseDTO();
        sectionResponseDTO.setId(section.getId());
        sectionResponseDTO.setName(savedSection.getName());
        return sectionResponseDTO;
    }

    public Boolean getBooleanValueFromSectionId(Long sectionId) {
        Optional<Section> section = sectionRepo.findById(sectionId);
        return section.isPresent();
    }

    public List<SectionResponseDTO> getAllSections() {
        List<Section> sections = sectionRepo.findAll();
        return sections.stream().map(section -> {
            SectionResponseDTO dto = new SectionResponseDTO();
            dto.setName(section.getName());
            dto.setId(section.getId());
            return dto;
        }).toList();
    }

    public List<SectionResponseDTO> getSectionFromCourseId(Long courseId) {
        List<Section> sections = sectionRepo.findByCourseId(courseId);
        return sections.stream().map(section -> {
            SectionResponseDTO sectionResponseDTO = new SectionResponseDTO();
            sectionResponseDTO.setId(section.getId());
            sectionResponseDTO.setName(section.getName());
            return sectionResponseDTO;
        }).toList();
    }
}
