package com.straylove.util;

import com.straylove.entity.User;
import com.straylove.entity.Animal;
import com.straylove.entity.AnimalLocation;
import com.straylove.entity.CareRecord;
import com.straylove.entity.FeedingLog;
import com.straylove.entity.CommunityLog;
import com.straylove.entity.AnimalImage;
import com.straylove.entity.DonationCampaign;
import com.straylove.entity.Donation;
import com.straylove.entity.Animal.AnimalSpecies;
import com.straylove.entity.Animal.Gender;
import com.straylove.entity.Animal.Temperament;
import com.straylove.entity.Animal.HealthStatus;
import com.straylove.entity.Animal.ApprovalStatus;
import com.straylove.entity.User.UserRole;
import com.straylove.entity.CareRecord.CareType;
import com.straylove.entity.CommunityLog.LogType;
import com.straylove.entity.CommunityLog.UrgencyLevel;
import com.straylove.entity.DonationCampaign.CampaignStatus;
import com.straylove.entity.Donation.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class TestDataBuilder {

    public static User createTestUser() {
        return User.builder()
                .username("testuser")
                .name("Test User")
                .email("test@example.com")
                .passwordHash("password123")
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();
    }

    public static User createTestUser(String username, String email) {
        return User.builder()
                .username(username)
                .name("Test User")
                .email(email)
                .passwordHash("password123")
                .role(UserRole.PUBLIC_USER)
                .isActive(true)
                .build();
    }

    public static Animal createTestAnimal() {
        return Animal.builder()
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
                .build();
    }

    public static AnimalLocation createTestLocation() {
        return AnimalLocation.builder()
                .latitude(40.7128)
                .longitude(-74.0060)
                .address("Central Park, New York")
                .area("Manhattan")
                .city("New York")
                .isCurrent(true)
                .build();
    }

    public static CareRecord createTestCareRecord() {
        return CareRecord.builder()
                .careType(CareType.FEEDING)
                .careDate(LocalDate.now())
                .description("Regular feeding")
                .build();
    }

    public static FeedingLog createTestFeedingLog() {
        return FeedingLog.builder()
                .foodType("Premium Dog Food")
                .quantity("2 cups")
                .feedingTime(LocalDateTime.now())
                .build();
    }

    public static CommunityLog createTestCommunityLog() {
        return CommunityLog.builder()
                .logType(LogType.SIGHTING)
                .description("Found a friendly dog near the park")
                .urgencyLevel(UrgencyLevel.LOW)
                .upvoteCount(0)
                .build();
    }

    public static AnimalImage createTestAnimalImage() {
        return AnimalImage.builder()
                .imageUrl("https://example.com/image.jpg")
                .caption("Front view of the animal")
                .isPrimary(true)
                .build();
    }

    public static DonationCampaign createTestCampaign() {
        return DonationCampaign.builder()
                .title("Help Stray Animals")
                .description("Campaign to help stray animals in the city")
                .targetAmount(new BigDecimal("10000.00"))
                .raisedAmount(new BigDecimal("5000.00"))
                .status(CampaignStatus.ACTIVE)
                .build();
    }

    public static Donation createTestDonation() {
        return Donation.builder()
                .amount(new BigDecimal("100.00"))
                .paymentStatus(PaymentStatus.COMPLETED)
                .message("Hope this helps!")
                .anonymous(false)
                .build();
    }

    public static Set<AnimalImage> createTestImageSet() {
        Set<AnimalImage> images = new HashSet<>();
        images.add(createTestAnimalImage());
        return images;
    }
} 