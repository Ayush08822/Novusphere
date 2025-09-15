package com.AyushToCode.CourseService.controller;

import com.AyushToCode.CourseService.DTO.SectionRequestDTO;
import com.AyushToCode.CourseService.DTO.SectionResponseDTO;
import com.AyushToCode.CourseService.entity.Section;
import com.AyushToCode.CourseService.service.SectionService;
import jakarta.annotation.security.PermitAll;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@AllArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @PostMapping("/add-sections")
    public ResponseEntity<SectionResponseDTO> addSections(@RequestBody SectionRequestDTO sectionDTO){
        return new ResponseEntity<>(sectionService.createSection(sectionDTO) , HttpStatus.OK);
    }

    @GetMapping("/{sectionId}")
    @PermitAll
    public Boolean getBooleanValue(@PathVariable Long sectionId) {
        return sectionService.getBooleanValueFromSectionId(sectionId);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<SectionResponseDTO>> getSectionsFromCourseId(@PathVariable Long courseId) {
        return new ResponseEntity<>(sectionService.getSectionFromCourseId(courseId), HttpStatus.OK);
    }

    @GetMapping("/")
    public ResponseEntity<List<SectionResponseDTO>> getBooleanValue() {
        return new ResponseEntity<>(sectionService.getAllSections(), HttpStatus.OK);
    }
}
