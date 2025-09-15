package com.AyushToCode.CartController.controller;

import com.AyushToCode.CartController.DTO.CartRequestDTO;
import com.AyushToCode.CartController.DTO.CartResponseDTO;
import com.AyushToCode.CartController.service.CartService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;


import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@AllArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<CartResponseDTO> addToCart(@AuthenticationPrincipal Jwt jwt, @RequestPart("added_course") String courseJson,
                                                     @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        CartRequestDTO cartDTO = mapper.readValue(courseJson, CartRequestDTO.class);
        String email = jwt.getClaim("email");
        return new ResponseEntity<>(cartService.addToCart(email, cartDTO, imageFile), HttpStatus.CREATED);
    }

    @GetMapping("/secure/getAll")
    public ResponseEntity<List<CartResponseDTO>> getAllItems(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        return new ResponseEntity<>(cartService.getAllItems(email), HttpStatus.OK);
    }

    @DeleteMapping("/remove/{cartId}")
    public void deleteItem(@PathVariable Long cartId) {
        cartService.deleteItem(cartId);
    }

    @DeleteMapping("/deleteAll")
    public ResponseEntity<String> clearCartByEmail(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        cartService.clearCartByEmail(email); // implement this method in service
        return ResponseEntity.ok("Cart cleared for " + email);
    }

    @GetMapping("/get/cart/payment")
    public ResponseEntity<List<CartResponseDTO>> getAllItems(@RequestParam String email) {
        return new ResponseEntity<>(cartService.getAllItems(email), HttpStatus.OK);
    }

    @GetMapping("/my_learning_service/getAll")
    public ResponseEntity<List<CartResponseDTO>> getAllItemsForMyLearningService(@RequestParam String email) {
        return new ResponseEntity<>(cartService.getAllItems(email), HttpStatus.OK);
    }
}
