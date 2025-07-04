package com.straylove.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class ImageUploadService {

    private static final String UPLOAD_DIR = "uploads/";
    private static final String BASE_URL = "http://localhost:8080/api/v1/images/";

    public String uploadImage(MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Return the URL
            String imageUrl = BASE_URL + filename;
            log.info("Image uploaded successfully: {}", imageUrl);
            
            return imageUrl;
        } catch (IOException e) {
            log.error("Error uploading image", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.startsWith(BASE_URL)) {
                String filename = imageUrl.substring(BASE_URL.length());
                Path filePath = Paths.get(UPLOAD_DIR, filename);
                Files.deleteIfExists(filePath);
                log.info("Image deleted: {}", filename);
            }
        } catch (IOException e) {
            log.error("Error deleting image", e);
        }
    }
} 