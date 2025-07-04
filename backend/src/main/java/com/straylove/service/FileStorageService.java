package com.straylove.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.file.base-url:http://localhost:8080/api/v1/images}")
    private String baseUrl;

    @Value("${app.file.storage-strategy:local}")
    private String storageStrategy;

    private CloudinaryService cloudinaryService;

    public FileStorageService() {
        // Default constructor
    }

    @Autowired(required = false)
    public void setCloudinaryService(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    public String storeFile(MultipartFile file) throws IOException {
        switch (storageStrategy.toLowerCase()) {
            case "cloudinary":
                if (cloudinaryService == null) {
                    log.warn("Cloudinary service not available, falling back to local storage");
                    return storeFileLocally(file);
                }
                return storeFileToCloudinary(file);
            case "local":
            default:
                return storeFileLocally(file);
        }
    }

    private String storeFileLocally(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return the URL - ensure baseUrl starts with slash and doesn't end with slash
        String cleanBaseUrl = baseUrl.startsWith("/") ? baseUrl : "/" + baseUrl;
        cleanBaseUrl = cleanBaseUrl.endsWith("/") ? cleanBaseUrl.substring(0, cleanBaseUrl.length() - 1) : cleanBaseUrl;
        String fileUrl = cleanBaseUrl + "/" + filename;
        log.info("File stored locally: {} at path: {}", fileUrl, filePath.toAbsolutePath());
        
        return fileUrl;
    }

    private String storeFileToCloudinary(MultipartFile file) throws IOException {
        try {
            String imageUrl = cloudinaryService.uploadImage(file);
            log.info("File stored to Cloudinary: {}", imageUrl);
            return imageUrl;
        } catch (Exception e) {
            log.error("Failed to store file to Cloudinary, falling back to local storage", e);
            return storeFileLocally(file);
        }
    }

    public void deleteFile(String imageUrl) {
        if (imageUrl == null) return;

        switch (storageStrategy.toLowerCase()) {
            case "cloudinary":
                if (cloudinaryService != null && imageUrl.contains("cloudinary.com")) {
                    cloudinaryService.deleteImage(imageUrl);
                } else {
                    log.warn("Cloudinary service not available, cannot delete cloudinary image: {}", imageUrl);
                }
                break;
            case "local":
            default:
                deleteFileLocally(imageUrl);
                break;
        }
    }

    private void deleteFileLocally(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.startsWith(baseUrl)) {
                String filename = imageUrl.substring(baseUrl.length() + 1);
                Path filePath = Paths.get(uploadDir, filename);
                Files.deleteIfExists(filePath);
                log.info("File deleted locally: {}", filename);
            }
        } catch (IOException e) {
            log.error("Failed to delete local file: {}", imageUrl, e);
        }
    }
} 