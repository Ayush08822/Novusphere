package com.AyushToCode.MyLearningService.service;

import com.AyushToCode.MyLearningService.DTO.CartResponseDTO;
import com.AyushToCode.MyLearningService.DTO.MyLearningCourseResponseDTO;
import com.AyushToCode.MyLearningService.DTO.RatingResponseDTO;
import com.AyushToCode.MyLearningService.client.CartFeignClient;
import com.AyushToCode.MyLearningService.client.CourseFeignClient;
import com.AyushToCode.MyLearningService.entity.MyLearning;
import com.AyushToCode.MyLearningService.repo.MyLearningRepo;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class MyLearningService {

    private final MyLearningRepo repository;
    private final CartFeignClient client;
    private final CourseFeignClient courseFeignClient;

    public List<MyLearningCourseResponseDTO> getCoursesByEmail(String email) {
        List<MyLearning> mylearnings = repository.findByEmail(email);

        return mylearnings.stream().map(mylearning -> {
            MyLearningCourseResponseDTO courseResponseDTO = new MyLearningCourseResponseDTO();

            courseResponseDTO.setId(mylearning.getId());
            courseResponseDTO.setCourseId(mylearning.getCourseId());
            courseResponseDTO.setTitle(mylearning.getTitle());
            courseResponseDTO.setImageData(mylearning.getImageData());
            courseResponseDTO.setCreatedBy(mylearning.getCreatedBy());

            // --- FEIGN CLIENT LOGIC ---
            try {
                // 2. Call the review service to get the latest rating
                RatingResponseDTO ratingResponse = courseFeignClient.getCourseRating(mylearning.getCourseId());

                // 3. Set the fresh rating from the Feign client response
                courseResponseDTO.setRating(ratingResponse.getAverageRating());

            } catch (Exception e) {
                // If the review service is down or fails, log the error and use the stale rating as a fallback
                System.err.println("Could not fetch rating for course " + mylearning.getCourseId() + ". Falling back to stored rating. Error: " + e.getMessage());
                courseResponseDTO.setRating(mylearning.getRating());
            }
            // --- END OF FEIGN CLIENT LOGIC ---
            return courseResponseDTO;
        }).toList();
    }

    public void saveCourses(String email) {
        ResponseEntity<List<CartResponseDTO>> allItemsForMyLearningService = client.getAllItemsForMyLearningService(email);
        List<CartResponseDTO> carts = allItemsForMyLearningService.getBody();

        if (carts != null) {
            for (CartResponseDTO cart : carts) {
                MyLearning learning = new MyLearning();
                learning.setEmail(email);
                learning.setTitle(cart.getTitle());
                learning.setCreatedBy(cart.getCreatedBy());
                learning.setImageData(cart.getImageData());
                learning.setEnrolledAt(LocalDateTime.now());
                learning.setCourseId(cart.getCourseId());
                repository.save(learning);
            }

        }
    }

    public List<String> getAllEmailOnCourseId(String courseId) {
        List<MyLearning> myLearning = repository.findByCourseId(courseId);
        return myLearning.stream()
                .map(MyLearning::getEmail)
                .toList();
    }

    public List<String> getCourseIds(String email) {
        List<MyLearning> purchasedCourses = repository.findByEmail(email);
        // 2. If the list is empty, return an empty list immediately.
        if (purchasedCourses == null || purchasedCourses.isEmpty()) {
            return Collections.emptyList();
        }
        // 3. Use a stream to map each MyLearning object to its courseId and collect into a new list
        return purchasedCourses.stream()
                .map(MyLearning::getCourseId)
                .toList();
    }

    //This function is used to check whether the currently logged in user has the authority to access the course.
    public boolean isUserEnrolled(String email, String courseId) {
        return repository.existsByEmailAndCourseId(email, courseId);
    }
}

