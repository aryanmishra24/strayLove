package com.straylove.mapper;

import com.straylove.dto.animal.AnimalResponse;
import com.straylove.dto.animal.AnimalLocationResponse;
import com.straylove.dto.animal.CreateAnimalRequest;
import com.straylove.entity.Animal;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AnimalMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uniqueIdentifier", ignore = true)
    @Mapping(target = "isVaccinated", constant = "false")
    @Mapping(target = "isSterilized", constant = "false")
    @Mapping(target = "approvalStatus", constant = "PENDING")
    @Mapping(target = "reportedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "locations", ignore = true)
    @Mapping(target = "careRecords", ignore = true)
    @Mapping(target = "feedingLogs", ignore = true)
    @Mapping(target = "communityLogs", ignore = true)
    @Mapping(target = "images", ignore = true)
    Animal toEntity(CreateAnimalRequest request);

    @Mapping(target = "reportedBy", source = "reportedBy.name")
    @Mapping(target = "lastSeenAt", source = "updatedAt")
    @Mapping(target = "locations", ignore = true)
    @Mapping(target = "imageUrls", ignore = true)
    AnimalResponse toResponse(Animal animal);
} 