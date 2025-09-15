package com.AyushToCode.PaymentService.controller;

import com.AyushToCode.PaymentService.DTO.StripeItemDTO;
import com.AyushToCode.PaymentService.service.PaymentService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payment")
@AllArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/verify")
    public Map<String, String> verifyPayment( @AuthenticationPrincipal Jwt jwt, @RequestParam("session_id") String sessionId) {
        String email = jwt.getClaim("email");
        return paymentService.verifyPayment(sessionId,  email);
    }


    @PostMapping("/create-checkout-session")
    public Map<String, String> createCheckoutSession(@RequestBody List<StripeItemDTO> items) {
        return paymentService.createCheckoutSession(items);
    }
}
