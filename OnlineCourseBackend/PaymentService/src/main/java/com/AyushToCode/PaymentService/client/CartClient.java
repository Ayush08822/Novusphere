package com.AyushToCode.PaymentService.client;

import com.AyushToCode.PaymentService.DTO.CartResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "cartService")
public interface CartClient {

    @GetMapping("/api/cart/get/cart/payment")
    ResponseEntity<List<CartResponseDTO>> getAllItems(@RequestParam("email") String email);
}
