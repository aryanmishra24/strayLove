package com.straylove.dto.donation;

import com.straylove.entity.DonationCampaign;
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
public class CampaignResponse {

    private Long id;
    private String title;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal raisedAmount;
    private DonationCampaign.CampaignStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 