package com.AyushToCode.CartController.service;

import com.AyushToCode.CartController.DTO.CartRequestDTO;
import com.AyushToCode.CartController.DTO.CartResponseDTO;
import com.AyushToCode.CartController.entity.Cart;
import com.AyushToCode.CartController.repo.CartRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class CartService {

    private final CartRepo cartRepo;

    public CartResponseDTO addToCart(String email, CartRequestDTO cartRequestDTO, MultipartFile imageFile) throws IOException {
        Cart cart = new Cart();
        cart.setTitle(cartRequestDTO.getTitle());
        cart.setRating(cartRequestDTO.getRating());
        cart.setCreatedBy(cartRequestDTO.getCreatedBy());
        cart.setImageData(imageFile.getBytes());
        cart.setImageType(imageFile.getContentType());
        cart.setPrice(cartRequestDTO.getPrice());
        cart.setEmail(email);
        cart.setCourseId(cartRequestDTO.getCourseId());

        Cart savedCart = cartRepo.save(cart);

        CartResponseDTO cartResponseDTO = new CartResponseDTO();
        cartResponseDTO.setTitle(savedCart.getTitle());
        cartResponseDTO.setRating(savedCart.getRating());
        cartResponseDTO.setCreatedBy(savedCart.getCreatedBy());
        cartResponseDTO.setImageData(savedCart.getImageData());
        cartResponseDTO.setImageType(savedCart.getImageType());
        cartResponseDTO.setPrice(savedCart.getPrice());
        cartResponseDTO.setId(savedCart.getId());
        cartResponseDTO.setCourseId(savedCart.getCourseId());

        return cartResponseDTO;
    }

    public List<CartResponseDTO> getAllItems(String email) {
        List<Cart> carts = cartRepo.findByEmail(email);

        return carts.stream().map(cart -> {
            CartResponseDTO cartResponseDTO = new CartResponseDTO();
            cartResponseDTO.setTitle(cart.getTitle());
            cartResponseDTO.setRating(cart.getRating());
            cartResponseDTO.setCreatedBy(cart.getCreatedBy());
            cartResponseDTO.setImageData(cart.getImageData());
            cartResponseDTO.setImageType(cart.getImageType());
            cartResponseDTO.setId(cart.getId());
            cartResponseDTO.setPrice(cart.getPrice());
            cartResponseDTO.setCourseId(cart.getCourseId());
            return cartResponseDTO;
        }).toList();
    }

    public void deleteItem(Long cartId) {
        cartRepo.deleteById(cartId);
    }

    public void clearCartByEmail(String email) {
        cartRepo.deleteByEmail(email);
    }
}
