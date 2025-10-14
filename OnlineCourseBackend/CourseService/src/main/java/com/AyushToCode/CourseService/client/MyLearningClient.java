package com.AyushToCode.CourseService.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "MyLearningService")
public interface MyLearningClient {

    @GetMapping("/api/mylearning/announce/getEmail")
    public ResponseEntity<List<String>> getAllEmailOnCourseId(@RequestParam String courseId);

    @GetMapping("/api/mylearning/announce/getCourseIds")
    public ResponseEntity<List<String>> getAllCourseIdsOnEmail(@RequestParam String email);
}
