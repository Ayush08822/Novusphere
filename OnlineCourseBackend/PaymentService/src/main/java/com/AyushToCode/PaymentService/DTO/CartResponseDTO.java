package com.AyushToCode.PaymentService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDTO {

    private Long id;
    private String title;
    private String createdBy;
    private byte[] imageData;
    private String imageType;
    private double rating;
    private BigDecimal price;
}
