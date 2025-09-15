package com.AyushToCode.PaymentService.repo;

import com.AyushToCode.PaymentService.entity.BillingDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillingRepo extends JpaRepository<BillingDetails, Long> {
}
