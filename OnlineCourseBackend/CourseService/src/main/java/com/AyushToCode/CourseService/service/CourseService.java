package com.AyushToCode.CourseService.service;

import com.AyushToCode.CourseService.DTO.CourseDTO;
import com.AyushToCode.CourseService.DTO.CourseResponseDTO;
import com.AyushToCode.CourseService.DTO.IncrementOfStudentEnrollmentDTO;
import com.AyushToCode.CourseService.DTO.ReviewDto;
import com.AyushToCode.CourseService.entity.Course;
import com.AyushToCode.CourseService.repo.CourseRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
@AllArgsConstructor
public class CourseService {

    private final CourseRepo courseRepo;

    public CourseResponseDTO createCourse(String email, CourseDTO courseDTO, MultipartFile imageFile) throws IOException {
        Course course = mapToEntity(email, courseDTO, imageFile);
        Course savedCourse = courseRepo.save(course);
        return mapToDTO(course);
    }

    private CourseResponseDTO mapToDTO(Course course) {
        CourseResponseDTO courseResponseDTO = new CourseResponseDTO();
        courseResponseDTO.setTags(course.getTags());
        courseResponseDTO.setTitle(course.getTitle());
        courseResponseDTO.setDescription(course.getDescription());
        courseResponseDTO.setAboutAuthor(course.getAboutAuthor());
        courseResponseDTO.setPrice(course.getPrice());
        courseResponseDTO.setStudentsEnrolled(course.getStudentsEnrolled());
        courseResponseDTO.setRating(course.getRating());
        courseResponseDTO.setCreatedBy(course.getCreatedBy());
        courseResponseDTO.setImageData(course.getImageData());
        LocalDate updatedAt = course.getUpdatedAt();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH);

        String formatted = updatedAt.format(formatter);
        courseResponseDTO.setUpdatedAt(formatted);
        return courseResponseDTO;
    }

    private Course mapToEntity(String email, CourseDTO dto, MultipartFile imageFile) throws IOException {
        Course course = new Course();
        course.setTags(dto.getTags());
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setAboutAuthor(dto.getAboutAuthor());
        course.setPrice(dto.getPrice());
        course.setStudentsEnrolled(dto.getStudentsEnrolled());
        course.setRating(dto.getRating());
        course.setCreatedBy(dto.getCreatedBy());
        if (imageFile != null && !imageFile.isEmpty()) {
            course.setImageData(imageFile.getBytes());
            course.setImageType(imageFile.getContentType());
        }
        course.setSections(new ArrayList<>()); // optional but good practice
        course.setUpdatedAt(LocalDate.now());
        course.setEmail(email);
        return course;
    }

    public CourseResponseDTO getCourseById(Long courseId) {
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));
        return mapToDTO(course);
    }

    public void DeleteById(Long courseId) {
        courseRepo.deleteById(courseId);
    }

    public List<CourseResponseDTO> getAllCourse(String email) {
        List<Course> courses = courseRepo.findByEmail(email);

        return courses.stream().map(course -> {
            CourseResponseDTO courseResponseDTO = new CourseResponseDTO();
            courseResponseDTO.setId(course.getId());
            courseResponseDTO.setTags(course.getTags());
            courseResponseDTO.setPrice(course.getPrice());
            courseResponseDTO.setDescription(course.getDescription());
            courseResponseDTO.setTitle(course.getTitle());
            courseResponseDTO.setPublic(course.isPublic());
            courseResponseDTO.setAboutAuthor(course.getAboutAuthor());
            courseResponseDTO.setCreatedBy(course.getCreatedBy());
            courseResponseDTO.setStudentsEnrolled(course.getStudentsEnrolled());
            courseResponseDTO.setImageData(course.getImageData());
            courseResponseDTO.setRating(course.getRating());
            LocalDate updatedAt = course.getUpdatedAt();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH);

            String formatted = updatedAt.format(formatter);
            courseResponseDTO.setUpdatedAt(formatted);
            return courseResponseDTO;
        }).toList();
    }

    public Boolean makeCoursePublic(Long id, boolean isPublic) throws Exception {
        Optional<Course> optionalCourse = courseRepo.findById(id);

        if (optionalCourse.isPresent()) {
            Course course = optionalCourse.get();
            course.setPublic(isPublic);
            courseRepo.save(course);
            return true;
        } else {
            throw new Exception("No available course.");
        }
    }

    public List<CourseResponseDTO> getCoursesBasedOnRating() {
        List<Course> courses = courseRepo.findTop5ByOrderByRatingDesc();
        return courses.stream().map(course -> {
            CourseResponseDTO courseResponseDTO = new CourseResponseDTO();
            courseResponseDTO.setId(course.getId());
            courseResponseDTO.setPrice(course.getPrice());
            courseResponseDTO.setTitle(course.getTitle());
            courseResponseDTO.setPublic(course.isPublic());
            courseResponseDTO.setCreatedBy(course.getCreatedBy());
            courseResponseDTO.setStudentsEnrolled(course.getStudentsEnrolled());
            courseResponseDTO.setImageData(course.getImageData());
            courseResponseDTO.setRating(course.getRating());
            LocalDate updatedAt = course.getUpdatedAt();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH);

            String formatted = updatedAt.format(formatter);
            courseResponseDTO.setUpdatedAt(formatted);
            return courseResponseDTO;
        }).toList();
    }

    public List<CourseResponseDTO> searchCourses(String query) {
        List<Course> courses = courseRepo.searchByTitleOrTags(query);

        return courses.stream().map(course -> {
            CourseResponseDTO courseResponseDTO = new CourseResponseDTO();
            courseResponseDTO.setId(course.getId());
            courseResponseDTO.setTags(course.getTags());
            courseResponseDTO.setPrice(course.getPrice());
            courseResponseDTO.setTitle(course.getTitle());
            courseResponseDTO.setPublic(course.isPublic());
            courseResponseDTO.setCreatedBy(course.getCreatedBy());
            courseResponseDTO.setStudentsEnrolled(course.getStudentsEnrolled());
            courseResponseDTO.setImageData(course.getImageData());
            courseResponseDTO.setRating(course.getRating());
            LocalDate updatedAt = course.getUpdatedAt();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH);

            String formatted = updatedAt.format(formatter);
            courseResponseDTO.setUpdatedAt(formatted);
            return courseResponseDTO;
        }).toList();

    }

    public void incrementStudentEnrollment(IncrementOfStudentEnrollmentDTO incrementOfStudentEnrollmentDTO) {
        Course byTitleAndCreatedBy = courseRepo.findByTitleAndCreatedBy(incrementOfStudentEnrollmentDTO.getTitle(), incrementOfStudentEnrollmentDTO.getCreatedBy()).orElseThrow(() -> new RuntimeException("Such Course Not found"));
        byTitleAndCreatedBy.setStudentsEnrolled(byTitleAndCreatedBy.getStudentsEnrolled() + 1);
        courseRepo.save(byTitleAndCreatedBy);
    }

    public void submitReview(Long courseId, ReviewDto reviewDto) throws Exception {
        Optional<Course> course = courseRepo.findById(courseId);
        if(course.isPresent()) {
            Course get_course = course.get();
            get_course.setRating(reviewDto.getRating());
            get_course.setComment(reviewDto.getComment());

            courseRepo.save(get_course);
        } else {
            throw new Exception("No available course.");
        }
    }
}
