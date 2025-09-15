package com.AyushToCode.PaymentService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StripeItemDTO {
    private String title;
    private Long price;
    private Long quantity;
    private String createdBy;
    private Double rating;
    private String imageData;
}
