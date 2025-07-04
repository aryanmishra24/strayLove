package com.straylove.controller;

import com.straylove.dto.ApiResponse;
import com.straylove.service.ImageUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
@Tag(name = "Image Upload", description = "Image upload and serving APIs")
@Slf4j
public class ImageController {

    private final ImageUploadService imageUploadService;

    @PostMapping("/upload")
    @Operation(summary = "Upload an image", description = "Upload an image file and get the URL")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "Please select a file to upload"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "Only image files are allowed"));
            }

            String imageUrl = imageUploadService.uploadImage(file);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", imageUrl));
        } catch (Exception e) {
            log.error("Error uploading image", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "Failed to upload image"));
        }
    }

    @GetMapping("/{filename:.+}")
    @Operation(summary = "Get image by filename", description = "Serve an uploaded image file")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            log.info("Attempting to serve image: {}", filename);
            
            // Get the upload directory from configuration
            String uploadDir = "uploads"; // This should match the configuration
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            
            log.info("Looking for file at path: {}", filePath.toAbsolutePath());
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                log.info("Image found and readable: {}", filename);
                
                // Determine content type based on file extension
                String contentType = "image/jpeg"; // default
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                log.warn("Image not found or not readable: {} at path: {}", filename, filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error serving image: {}", filename, e);
            return ResponseEntity.notFound().build();
        }
    }
} 