package com.straylove.controller;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.auth.AuthResponse;
import com.straylove.dto.auth.LoginRequest;
import com.straylove.dto.auth.RefreshTokenRequest;
import com.straylove.dto.auth.RegisterRequest;
import com.straylove.entity.User;
import com.straylove.repository.UserRepository;
import com.straylove.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse<AuthResponse> response = authService.register(request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        ApiResponse<AuthResponse> response = authService.login(request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh JWT token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        ApiResponse<AuthResponse> response = authService.refreshToken(request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get information about the currently authenticated user")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getCurrentUser() {
        ApiResponse<AuthResponse.UserInfo> response = authService.getCurrentUser();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate token")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> logout() {
        ApiResponse<String> response = authService.logout();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Test endpoint to check if users exist")
    public ResponseEntity<ApiResponse<String>> test() {
        return ResponseEntity.ok(ApiResponse.success("Auth controller is working", "OK"));
    }

    @PutMapping("/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> promoteUser(@RequestBody PromoteUserRequest request) {
        User user = null;
        if (request.getEmail() != null) {
            user = userRepository.findByEmail(request.getEmail()).orElse(null);
        } else if (request.getUsername() != null) {
            user = userRepository.findByUsername(request.getUsername()).orElse(null);
        }
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "User not found"));
        }
        try {
            user.setRole(User.UserRole.valueOf(request.getRole()));
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success("User promoted successfully", "User promoted to " + request.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(400, "Invalid role or error: " + e.getMessage()));
        }
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserInfo(@RequestParam(value = "email", required = false) String email,
                                       @RequestParam(value = "username", required = false) String username) {
        User user = null;
        if (email != null) {
            user = userRepository.findByEmail(email).orElse(null);
        } else if (username != null) {
            user = userRepository.findByUsername(username).orElse(null);
        }
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "User not found"));
        }
        Map<String, Object> userInfo = Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "username", user.getUsername(),
            "name", user.getName(),
            "role", user.getRole().name()
        );
        return ResponseEntity.ok(ApiResponse.success("User found", userInfo));
    }

    public static class PromoteUserRequest {
        private String email;
        private String username;
        private String role;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
} 