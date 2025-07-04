package com.straylove.dto.donation;

import com.straylove.entity.Donation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {

    private Long id;
    private Long campaignId;
    private String campaignTitle;
    private String donorName;
    private BigDecimal amount;
    private Donation.PaymentStatus paymentStatus;
    private String transactionId;
    private String message;
    private boolean anonymous;
    private LocalDateTime createdAt;
} 