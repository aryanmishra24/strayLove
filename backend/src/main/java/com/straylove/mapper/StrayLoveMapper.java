package com.straylove.mapper;

import com.straylove.entity.*;
import com.straylove.dto.animal.AnimalResponse;
import com.straylove.dto.animal.AnimalLocationResponse;
import com.straylove.dto.care.CareRecordResponse;
import com.straylove.dto.care.FeedingLogResponse;
import com.straylove.dto.community.CommunityLogResponse;
import com.straylove.dto.donation.CampaignResponse;
import com.straylove.dto.donation.DonationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface StrayLoveMapper {
    StrayLoveMapper INSTANCE = Mappers.getMapper(StrayLoveMapper.class);

    AnimalResponse animalToAnimalResponse(Animal animal);
    AnimalLocationResponse animalLocationToAnimalLocationResponse(AnimalLocation location);
    
    @Mapping(target = "animalId", source = "animal.id")
    @Mapping(target = "animalName", source = "animal.uniqueIdentifier")
    @Mapping(target = "animalSpecies", source = "animal.species")
    @Mapping(target = "performedById", source = "performedBy.id")
    @Mapping(target = "performedByName", source = "performedBy.username")
    @Mapping(target = "performedByEmail", source = "performedBy.email")
    @Mapping(target = "updatedAt", source = "createdAt")
    CareRecordResponse careRecordToCareRecordResponse(CareRecord careRecord);
    
    @Mapping(target = "animalId", source = "animal.id")
    @Mapping(target = "animalName", source = "animal.uniqueIdentifier")
    @Mapping(target = "animalSpecies", source = "animal.species")
    @Mapping(target = "fedById", source = "fedBy.id")
    @Mapping(target = "fedByName", source = "fedBy.username")
    @Mapping(target = "fedByEmail", source = "fedBy.email")
    @Mapping(target = "updatedAt", source = "createdAt")
    FeedingLogResponse feedingLogToFeedingLogResponse(FeedingLog feedingLog);
    
    CommunityLogResponse communityLogToCommunityLogResponse(CommunityLog communityLog);
    CampaignResponse donationCampaignToCampaignResponse(DonationCampaign campaign);
    DonationResponse donationToDonationResponse(Donation donation);

    // MapStruct helper for mapping User to String (username)
    default String map(User user) {
        return user == null ? null : user.getUsername();
    }
} 