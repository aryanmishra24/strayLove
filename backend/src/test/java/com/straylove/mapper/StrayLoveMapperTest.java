package com.straylove.mapper;

import com.straylove.dto.animal.AnimalResponse;
import com.straylove.dto.animal.AnimalLocationResponse;
import com.straylove.dto.care.CareRecordResponse;
import com.straylove.dto.care.FeedingLogResponse;
import com.straylove.dto.community.CommunityLogResponse;
import com.straylove.dto.donation.CampaignResponse;
import com.straylove.dto.donation.DonationResponse;
import com.straylove.entity.*;
import com.straylove.entity.Animal.AnimalSpecies;
import com.straylove.entity.Animal.Gender;
import com.straylove.entity.Animal.Temperament;
import com.straylove.entity.Animal.HealthStatus;
import com.straylove.entity.Animal.ApprovalStatus;
import com.straylove.entity.CareRecord.CareType;
import com.straylove.entity.CommunityLog.LogType;
import com.straylove.entity.CommunityLog.UrgencyLevel;
import com.straylove.entity.DonationCampaign.CampaignStatus;
import com.straylove.entity.Donation.PaymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class StrayLoveMapperTest {

    private StrayLoveMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(StrayLoveMapper.class);
    }

    @Test
    void animalToAnimalResponse_WithValidAnimal_ShouldMapCorrectly() {
        // Arrange
        Animal animal = Animal.builder()
                .id(1L)
                .uniqueIdentifier("BUDDY001")
                .species(AnimalSpecies.DOG)
                .breed("Golden Retriever")
                .color("Golden")
                .gender(Gender.MALE)
                .temperament(Temperament.FRIENDLY)
                .healthStatus(HealthStatus.HEALTHY)
                .isVaccinated(true)
                .isSterilized(true)
                .approvalStatus(ApprovalStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Act
        AnimalResponse response = mapper.animalToAnimalResponse(animal);

        // Assert
        assertNotNull(response);
        assertEquals(animal.getId(), response.getId());
        assertEquals(animal.getUniqueIdentifier(), response.getUniqueIdentifier());
        assertEquals(animal.getSpecies(), response.getSpecies());
        assertEquals(animal.getBreed(), response.getBreed());
        assertEquals(animal.getColor(), response.getColor());
        assertEquals(animal.getGender(), response.getGender());
        assertEquals(animal.getTemperament(), response.getTemperament());
        assertEquals(animal.getHealthStatus(), response.getHealthStatus());
        assertEquals(animal.getApprovalStatus(), response.getApprovalStatus());
    }

    @Test
    void animalLocationToAnimalLocationResponse_WithValidLocation_ShouldMapCorrectly() {
        // Arrange
        AnimalLocation location = AnimalLocation.builder()
                .id(1L)
                .latitude(40.7128)
                .longitude(-74.0060)
                .address("Central Park, New York")
                .area("Manhattan")
                .city("New York")
                .isCurrent(true)
                .build();

        // Act
        AnimalLocationResponse response = mapper.animalLocationToAnimalLocationResponse(location);

        // Assert
        assertNotNull(response);
        assertEquals(location.getId(), response.getId());
        assertEquals(location.getLatitude(), response.getLatitude());
        assertEquals(location.getLongitude(), response.getLongitude());
        assertEquals(location.getAddress(), response.getAddress());
        assertEquals(location.getArea(), response.getArea());
        assertEquals(location.getCity(), response.getCity());
    }

    @Test
    void careRecordToCareRecordResponse_WithValidCareRecord_ShouldMapCorrectly() {
        // Arrange
        CareRecord careRecord = CareRecord.builder()
                .id(1L)
                .careType(CareType.FEEDING)
                .careDate(LocalDate.now())
                .description("Regular feeding")
                .build();

        // Act
        CareRecordResponse response = mapper.careRecordToCareRecordResponse(careRecord);

        // Assert
        assertNotNull(response);
        assertEquals(careRecord.getId(), response.getId());
        assertEquals(careRecord.getCareType(), response.getCareType());
        assertEquals(careRecord.getCareDate(), response.getCareDate());
        assertEquals(careRecord.getDescription(), response.getDescription());
    }

    @Test
    void feedingLogToFeedingLogResponse_WithValidFeedingLog_ShouldMapCorrectly() {
        // Arrange
        FeedingLog feedingLog = FeedingLog.builder()
                .id(1L)
                .foodType("Premium Dog Food")
                .quantity("2 cups")
                .feedingTime(LocalDateTime.now())
                .build();

        // Act
        FeedingLogResponse response = mapper.feedingLogToFeedingLogResponse(feedingLog);

        // Assert
        assertNotNull(response);
        assertEquals(feedingLog.getId(), response.getId());
        assertEquals(feedingLog.getFoodType(), response.getFoodType());
        assertEquals(feedingLog.getQuantity(), response.getQuantity());
        assertEquals(feedingLog.getFeedingTime(), response.getFeedingTime());
    }

    @Test
    void communityLogToCommunityLogResponse_WithValidCommunityLog_ShouldMapCorrectly() {
        // Arrange
        CommunityLog communityLog = CommunityLog.builder()
                .id(1L)
                .logType(LogType.SIGHTING)
                .description("Found a friendly dog near the park")
                .urgencyLevel(UrgencyLevel.LOW)
                .upvoteCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        // Act
        CommunityLogResponse response = mapper.communityLogToCommunityLogResponse(communityLog);

        // Assert
        assertNotNull(response);
        assertEquals(communityLog.getId(), response.getId());
        assertEquals(communityLog.getLogType(), response.getLogType());
        assertEquals(communityLog.getDescription(), response.getDescription());
        assertEquals(communityLog.getUrgencyLevel(), response.getUrgencyLevel());
        assertEquals(communityLog.getUpvoteCount(), response.getUpvoteCount());
        assertEquals(communityLog.getCreatedAt(), response.getCreatedAt());
    }

    @Test
    void donationCampaignToCampaignResponse_WithValidCampaign_ShouldMapCorrectly() {
        // Arrange
        DonationCampaign campaign = DonationCampaign.builder()
                .id(1L)
                .title("Help Stray Animals")
                .description("Campaign to help stray animals")
                .targetAmount(new BigDecimal("10000.00"))
                .raisedAmount(new BigDecimal("5000.00"))
                .status(CampaignStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Act
        CampaignResponse response = mapper.donationCampaignToCampaignResponse(campaign);

        // Assert
        assertNotNull(response);
        assertEquals(campaign.getId(), response.getId());
        assertEquals(campaign.getTitle(), response.getTitle());
        assertEquals(campaign.getDescription(), response.getDescription());
        assertEquals(campaign.getTargetAmount(), response.getTargetAmount());
        assertEquals(campaign.getRaisedAmount(), response.getRaisedAmount());
        assertEquals(campaign.getStatus(), response.getStatus());
        assertEquals(campaign.getCreatedAt(), response.getCreatedAt());
        assertEquals(campaign.getUpdatedAt(), response.getUpdatedAt());
    }

    @Test
    void donationToDonationResponse_WithValidDonation_ShouldMapCorrectly() {
        // Arrange
        Donation donation = Donation.builder()
                .id(1L)
                .amount(new BigDecimal("100.00"))
                .paymentStatus(PaymentStatus.COMPLETED)
                .message("Hope this helps!")
                .anonymous(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Act
        DonationResponse response = mapper.donationToDonationResponse(donation);

        // Assert
        assertNotNull(response);
        assertEquals(donation.getId(), response.getId());
        assertEquals(donation.getAmount(), response.getAmount());
        assertEquals(donation.getPaymentStatus(), response.getPaymentStatus());
        assertEquals(donation.getMessage(), response.getMessage());
        assertEquals(donation.isAnonymous(), response.isAnonymous());
        assertEquals(donation.getCreatedAt(), response.getCreatedAt());
    }

    @Test
    void animalToAnimalResponse_WithNullAnimal_ShouldReturnNull() {
        // Act
        AnimalResponse response = mapper.animalToAnimalResponse(null);

        // Assert
        assertNull(response);
    }

    @Test
    void animalToAnimalResponse_WithAnimalWithNullFields_ShouldHandleGracefully() {
        // Arrange
        Animal animal = Animal.builder()
                .id(1L)
                .uniqueIdentifier("BUDDY001")
                .species(AnimalSpecies.DOG)
                .build();

        // Act
        AnimalResponse response = mapper.animalToAnimalResponse(animal);

        // Assert
        assertNotNull(response);
        assertEquals(animal.getId(), response.getId());
        assertEquals(animal.getUniqueIdentifier(), response.getUniqueIdentifier());
        assertEquals(animal.getSpecies(), response.getSpecies());
        assertNull(response.getBreed());
        assertNull(response.getColor());
        assertNull(response.getGender());
    }
} 