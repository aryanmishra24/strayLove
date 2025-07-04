package com.straylove.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
@ConditionalOnProperty(name = "app.file.storage-strategy", havingValue = "cloudinary")
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${app.cloudinary.cloud-name}") String cloudName,
            @Value("${app.cloudinary.api-key}") String apiKey,
            @Value("${app.cloudinary.api-secret}") String apiSecret) {
        
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadImage(MultipartFile file) throws IOException {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "straylove/animals",
                            "public_id", "animal_" + System.currentTimeMillis(),
                            "overwrite", true
                    )
            );
            
            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded to Cloudinary: {}", imageUrl);
            return imageUrl;
            
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new IOException("Failed to upload image to Cloudinary", e);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.contains("cloudinary.com")) {
                // Extract public_id from URL
                String publicId = extractPublicIdFromUrl(imageUrl);
                if (publicId != null) {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    log.info("Image deleted from Cloudinary: {}", publicId);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete image from Cloudinary: {}", imageUrl, e);
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // Extract public_id from Cloudinary URL
            // Example: https://res.cloudinary.com/cloudname/image/upload/v1234567890/straylove/animals/animal_1234567890.jpg
            String[] parts = imageUrl.split("/");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("upload")) {
                    // Skip version number if present
                    int startIndex = i + 2; // Skip "upload" and version
                    if (startIndex < parts.length && parts[startIndex].startsWith("v")) {
                        startIndex++;
                    }
                    // Join remaining parts
                    StringBuilder publicId = new StringBuilder();
                    for (int j = startIndex; j < parts.length; j++) {
                        if (j > startIndex) publicId.append("/");
                        publicId.append(parts[j]);
                    }
                    // Remove file extension
                    String result = publicId.toString();
                    int lastDot = result.lastIndexOf(".");
                    return lastDot > 0 ? result.substring(0, lastDot) : result;
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", imageUrl, e);
        }
        return null;
    }
} 