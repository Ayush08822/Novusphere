package com.AyushToCode.PaymentService.service;

import com.AyushToCode.PaymentService.DTO.CartResponseDTO;
import com.AyushToCode.PaymentService.DTO.IncrementOfStudentEnrollmentDTO;
import com.AyushToCode.PaymentService.DTO.StripeItemDTO;
import com.AyushToCode.PaymentService.client.CartClient;
import com.AyushToCode.PaymentService.entity.BillingDetails;
import com.AyushToCode.PaymentService.repo.BillingRepo;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class PaymentService {

    private final BillingRepo billingRepo;
    private final CartClient client;
    private final StreamBridge streamBridge;

    public Map<String, String> verifyPayment(String sessionId, String email) {
        try {
            Session session = Session.retrieve(sessionId);
            if ("complete".equals(session.getStatus()) && "paid".equals(session.getPaymentStatus())) {
                storeBillingDetails(session, email);

                System.out.println("Calling the cart client");

                ResponseEntity<List<CartResponseDTO>> cartItems = client.getAllItems(email);

                System.out.println(Objects.requireNonNull(cartItems.getBody()).toString());

                for (CartResponseDTO item : Objects.requireNonNull(cartItems.getBody())) {
                    IncrementOfStudentEnrollmentDTO event = new IncrementOfStudentEnrollmentDTO(item.getTitle(), item.getCreatedBy());
                    sendCommunication(event);
                }

                return Map.of("status", "paid");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Map.of("status", "unpaid");
    }

    private void sendCommunication(IncrementOfStudentEnrollmentDTO event) {
        log.info("Sending Communication request for the details:");
        var result = streamBridge.send("sendCommunication-out-0", event);
        log.info("Is the Communication request successfully triggered ? : {}", result);
    }

    public Map<String, String> createCheckoutSession(List<StripeItemDTO> items) {
        List<SessionCreateParams.LineItem> lineItems = items.stream().map(item -> SessionCreateParams.LineItem.builder().setQuantity(item.getQuantity()).setPriceData(SessionCreateParams.LineItem.PriceData.builder().setCurrency("inr").setUnitAmount(item.getPrice()) // price in paise (₹499 = 49900)
                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder().setName(item.getTitle()).build()).build()).build()).collect(Collectors.toList());

        SessionCreateParams params = SessionCreateParams.builder().addAllLineItem(lineItems).setMode(SessionCreateParams.Mode.PAYMENT).setSuccessUrl("http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}").setCancelUrl("http://localhost:5173/cancel").build();

        try {
            Session session = Session.create(params);
            return Map.of("checkoutUrl", session.getUrl());
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Failed to create Stripe session");
        }
    }

    public void storeBillingDetails(Session session, String email) {
        BillingDetails info = BillingDetails.builder()
                .email(email)
                .StripeSessionId(session.getId())
                .totalAmount(session.getAmountTotal() / 100.0)
                .build();

        billingRepo.save(info);
    }
}
