package com.AyushToCode.CartController.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartRequestDTO {
    private String title;
    private String createdBy;
    private double rating;
    private BigDecimal price;
    private Long courseId;
}
