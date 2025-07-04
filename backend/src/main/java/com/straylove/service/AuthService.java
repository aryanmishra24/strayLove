package com.straylove.service;

import com.straylove.dto.ApiResponse;
import com.straylove.dto.auth.AuthResponse;
import com.straylove.dto.auth.LoginRequest;
import com.straylove.dto.auth.RefreshTokenRequest;
import com.straylove.dto.auth.RegisterRequest;
import com.straylove.entity.User;
import com.straylove.repository.UserRepository;
import com.straylove.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public ApiResponse<AuthResponse> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error(400, "Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ApiResponse.error(400, "Username already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return ApiResponse.success("User registered successfully", null);
    }

    public ApiResponse<AuthResponse> login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            String token = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse authResponse = AuthResponse.fromUser(user, token, refreshToken);
            log.info("User logged in: {}", user.getEmail());

            return ApiResponse.success("Login successful", authResponse);
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            return ApiResponse.error(401, "Invalid email or password");
        }
    }

    public ApiResponse<AuthResponse> refreshToken(RefreshTokenRequest request) {
        try {
            if (tokenProvider.validateRefreshToken(request.getRefreshToken())) {
                String email = tokenProvider.getUsernameFromRefreshToken(request.getRefreshToken());
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                String newToken = tokenProvider.generateTokenFromUsername(email);
                String newRefreshToken = tokenProvider.generateRefreshTokenFromUsername(email);

                AuthResponse authResponse = AuthResponse.fromUser(user, newToken, newRefreshToken);
                log.info("Token refreshed for user: {}", user.getEmail());

                return ApiResponse.success("Token refreshed successfully", authResponse);
            } else {
                return ApiResponse.error(401, "Invalid refresh token");
            }
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ApiResponse.error(401, "Token refresh failed");
        }
    }

    public ApiResponse<AuthResponse.UserInfo> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ApiResponse.error(401, "User not authenticated");
            }

            Object principal = authentication.getPrincipal();
            String email;
            
            if (principal instanceof UserDetails) {
                // Legacy support for UserDetails
                email = ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                // New JWT authentication returns username as string
                email = (String) principal;
            } else {
                log.error("Principal is neither UserDetails nor String: {} (type: {})", principal, principal != null ? principal.getClass().getName() : "null");
                return ApiResponse.error(401, "User not authenticated");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();

            log.info("Current user retrieved: {}", user.getEmail());
            return ApiResponse.success("Current user retrieved successfully", userInfo);
        } catch (Exception e) {
            log.error("Failed to get current user", e);
            return ApiResponse.error(500, "Failed to get current user");
        }
    }

    public ApiResponse<String> logout() {
        try {
            // Clear the security context
            SecurityContextHolder.clearContext();
            log.info("User logged out successfully");
            return ApiResponse.success("Logout successful", "User logged out successfully");
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ApiResponse.error(500, "Logout failed");
        }
    }
} 