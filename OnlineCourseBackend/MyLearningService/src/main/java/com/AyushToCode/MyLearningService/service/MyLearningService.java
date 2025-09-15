package com.AyushToCode.MyLearningService.service;

import com.AyushToCode.MyLearningService.DTO.CartResponseDTO;
import com.AyushToCode.MyLearningService.DTO.MyLearningCourseResponseDTO;
import com.AyushToCode.MyLearningService.client.CartFeignClient;
import com.AyushToCode.MyLearningService.entity.MyLearning;
import com.AyushToCode.MyLearningService.repo.MyLearningRepo;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class MyLearningService {

    private final MyLearningRepo repository;
    private final CartFeignClient client;

    public List<MyLearningCourseResponseDTO> getCoursesByEmail(String email) {
        List<MyLearning> mylearnings = repository.findByEmail(email);

        return mylearnings.stream().map( mylearning -> {
            MyLearningCourseResponseDTO courseResponseDTO = new MyLearningCourseResponseDTO();

            courseResponseDTO.setId(mylearning.getId());
            courseResponseDTO.setCourseId(mylearning.getCourseId());
            courseResponseDTO.setTitle(mylearning.getTitle());
            courseResponseDTO.setImageData(mylearning.getImageData());
            courseResponseDTO.setCreatedBy(mylearning.getCreatedBy());
            courseResponseDTO.setRating(mylearning.getRating());
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
}
