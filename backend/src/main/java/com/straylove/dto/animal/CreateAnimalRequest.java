package com.straylove.dto.animal;

import com.straylove.entity.Animal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnimalRequest {

    @NotNull(message = "Species is required")
    private Animal.AnimalSpecies species;

    private String breed;

    @NotNull(message = "Color is required")
    private String color;

    @NotNull(message = "Gender is required")
    private Animal.Gender gender;

    @NotNull(message = "Temperament is required")
    private Animal.Temperament temperament;

    @NotNull(message = "Health status is required")
    private Animal.HealthStatus healthStatus;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private String address;

    @NotNull(message = "Area is required")
    private String area;

    private String city;
} 