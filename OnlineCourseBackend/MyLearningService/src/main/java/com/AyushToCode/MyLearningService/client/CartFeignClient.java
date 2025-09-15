package com.AyushToCode.MyLearningService.client;

import com.AyushToCode.MyLearningService.DTO.CartResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "cartService")
public interface CartFeignClient {

    @GetMapping("/api/cart/my_learning_service/getAll")
    public ResponseEntity<List<CartResponseDTO>> getAllItemsForMyLearningService(@RequestParam("email")  String email);
}
