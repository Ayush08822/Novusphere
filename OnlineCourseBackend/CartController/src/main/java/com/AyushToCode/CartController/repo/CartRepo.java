package com.AyushToCode.CartController.repo;

import com.AyushToCode.CartController.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepo extends JpaRepository<Cart , Long> {

    List<Cart> findByEmail(String email);

    @Modifying
    void deleteByEmail(String email);
}
