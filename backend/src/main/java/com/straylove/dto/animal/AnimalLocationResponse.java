package com.straylove.dto.animal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnimalLocationResponse {

    private Long id;
    private Double latitude;
    private Double longitude;
    private String address;
    private String area;
    private String city;
    private boolean isCurrent;
    private LocalDateTime createdAt;
} 