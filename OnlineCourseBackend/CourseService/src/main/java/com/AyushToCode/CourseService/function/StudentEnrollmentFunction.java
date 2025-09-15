package com.AyushToCode.CourseService.function;

import com.AyushToCode.CourseService.DTO.IncrementOfStudentEnrollmentDTO;
import com.AyushToCode.CourseService.service.CourseService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.function.Consumer;
import java.util.function.Function;

@Configuration
@Slf4j
@AllArgsConstructor
public class StudentEnrollmentFunction {
    private final CourseService courseService;

    @Bean
    public Consumer<IncrementOfStudentEnrollmentDTO> updateStudentEnrollment() {
        return incrementOfStudentEnrollmentDTO -> {
            log.info("Calling service class");
            courseService.incrementStudentEnrollment(incrementOfStudentEnrollmentDTO);
            log.info("Returning from service class");
        };
    }

}
