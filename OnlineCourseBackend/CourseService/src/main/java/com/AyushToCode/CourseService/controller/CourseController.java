package com.AyushToCode.CourseService.controller;

import com.AyushToCode.CourseService.DTO.CourseDTO;
import com.AyushToCode.CourseService.DTO.CourseResponseDTO;
import com.AyushToCode.CourseService.service.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@AllArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseResponseDTO> createCourse(@AuthenticationPrincipal Jwt jwt, @RequestPart("course") String courseJson,
                                                          @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        CourseDTO courseDTO = mapper.readValue(courseJson, CourseDTO.class);
        courseDTO.setStudentsEnrolled(0);
        courseDTO.setRating(0.0);
        courseDTO.setPublic(false);
        String email = jwt.getClaim("email");
        return new ResponseEntity<>(courseService.createCourse(email, courseDTO, imageFile), HttpStatus.CREATED);
    }

    @PutMapping("/public/{courseId}")
    public ResponseEntity<Boolean> makeCoursePublic(
            @PathVariable Long courseId,
            @RequestBody boolean isPublic
    ) throws Exception {
        return new ResponseEntity<>(courseService.makeCoursePublic(courseId, isPublic), HttpStatus.OK);
    }


    @GetMapping("/top-rated")
    public ResponseEntity<List<CourseResponseDTO>> getCoursesBasedOnRating() {
        return new ResponseEntity<>(courseService.getCoursesBasedOnRating(), HttpStatus.OK);
    }

    @GetMapping("/")
    public ResponseEntity<List<CourseResponseDTO>> getAllCourses(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        return new ResponseEntity<>(courseService.getAllCourse(email), HttpStatus.OK);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponseDTO> getCourseById(@PathVariable Long courseId) {
        return new ResponseEntity<>(courseService.getCourseById(courseId), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourseResponseDTO>> searchCourses(@RequestParam("query") String query){
        return new ResponseEntity<>(courseService.searchCourses(query), HttpStatus.OK);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<String> DeleteById(@PathVariable Long courseId) {
        courseService.DeleteById(courseId);
        return new ResponseEntity<>("Deleted SuccesFully", HttpStatus.OK);
    }
}
