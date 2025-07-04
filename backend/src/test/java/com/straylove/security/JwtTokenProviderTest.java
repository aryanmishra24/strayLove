package com.straylove.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    private Authentication mockAuthentication;
    private UserDetails mockUserDetails;

    @BeforeEach
    void setUp() {
        // Set up test properties with a longer secret key for HS512
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "testSecretKeyForJwtTokenProviderTestingPurposesOnlyThisIsALongerKeyForHS512Algorithm");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpiration", 86400000L); // 24 hours

        // Set up mocks with lenient stubbing
        mockUserDetails = mock(UserDetails.class);
        lenient().when(mockUserDetails.getUsername()).thenReturn("test@example.com");

        mockAuthentication = mock(Authentication.class);
        lenient().when(mockAuthentication.getPrincipal()).thenReturn(mockUserDetails);
    }

    @Test
    void generateToken_WithValidAuthentication_ShouldReturnValidToken() {
        // Act
        String token = jwtTokenProvider.generateToken(mockAuthentication);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void generateTokenFromUsername_WithValidUsername_ShouldReturnValidToken() {
        // Act
        String token = jwtTokenProvider.generateTokenFromUsername("test@example.com");

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("test@example.com", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    void generateRefreshToken_WithValidAuthentication_ShouldReturnValidRefreshToken() {
        // Act
        String refreshToken = jwtTokenProvider.generateRefreshToken(mockAuthentication);

        // Assert
        assertNotNull(refreshToken);
        assertFalse(refreshToken.isEmpty());
        assertTrue(jwtTokenProvider.validateRefreshToken(refreshToken));
    }

    @Test
    void generateRefreshTokenFromUsername_WithValidUsername_ShouldReturnValidRefreshToken() {
        // Act
        String refreshToken = jwtTokenProvider.generateRefreshTokenFromUsername("test@example.com");

        // Assert
        assertNotNull(refreshToken);
        assertFalse(refreshToken.isEmpty());
        assertTrue(jwtTokenProvider.validateRefreshToken(refreshToken));
        assertEquals("test@example.com", jwtTokenProvider.getUsernameFromRefreshToken(refreshToken));
    }

    @Test
    void validateToken_WithValidToken_ShouldReturnTrue() {
        // Arrange
        String token = jwtTokenProvider.generateToken(mockAuthentication);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void validateToken_WithInvalidToken_ShouldReturnFalse() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken("invalid.token.here");

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateToken_WithNullToken_ShouldReturnFalse() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken(null);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateToken_WithEmptyToken_ShouldReturnFalse() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken("");

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateRefreshToken_WithValidRefreshToken_ShouldReturnTrue() {
        // Arrange
        String refreshToken = jwtTokenProvider.generateRefreshToken(mockAuthentication);

        // Act
        boolean isValid = jwtTokenProvider.validateRefreshToken(refreshToken);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void validateRefreshToken_WithRegularToken_ShouldReturnFalse() {
        // Arrange
        String regularToken = jwtTokenProvider.generateToken(mockAuthentication);

        // Act
        boolean isValid = jwtTokenProvider.validateRefreshToken(regularToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void validateRefreshToken_WithInvalidToken_ShouldReturnFalse() {
        // Act
        boolean isValid = jwtTokenProvider.validateRefreshToken("invalid.refresh.token");

        // Assert
        assertFalse(isValid);
    }

    @Test
    void getUsernameFromToken_WithValidToken_ShouldReturnUsername() {
        // Arrange
        String token = jwtTokenProvider.generateToken(mockAuthentication);

        // Act
        String username = jwtTokenProvider.getUsernameFromToken(token);

        // Assert
        assertEquals("test@example.com", username);
    }

    @Test
    void getUsernameFromRefreshToken_WithValidRefreshToken_ShouldReturnUsername() {
        // Arrange
        String refreshToken = jwtTokenProvider.generateRefreshToken(mockAuthentication);

        // Act
        String username = jwtTokenProvider.getUsernameFromRefreshToken(refreshToken);

        // Assert
        assertEquals("test@example.com", username);
    }

    @Test
    void getUsernameFromToken_WithInvalidToken_ShouldThrowException() {
        // Act & Assert
        assertThrows(Exception.class, () -> jwtTokenProvider.getUsernameFromToken("invalid.token"));
    }

    @Test
    void getUsernameFromRefreshToken_WithInvalidRefreshToken_ShouldThrowException() {
        // Act & Assert
        assertThrows(Exception.class, () -> jwtTokenProvider.getUsernameFromRefreshToken("invalid.refresh.token"));
    }

    @Test
    void tokenExpiration_ShouldWorkCorrectly() {
        // Arrange
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 1000L); // 1 second

        // Act
        String token = jwtTokenProvider.generateToken(mockAuthentication);

        // Assert
        assertTrue(jwtTokenProvider.validateToken(token));

        // Wait for token to expire
        try {
            Thread.sleep(1100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Token should be invalid after expiration
        assertFalse(jwtTokenProvider.validateToken(token));
    }

    @Test
    void refreshTokenExpiration_ShouldWorkCorrectly() {
        // Arrange
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpiration", 1000L); // 1 second

        // Act
        String refreshToken = jwtTokenProvider.generateRefreshToken(mockAuthentication);

        // Assert
        assertTrue(jwtTokenProvider.validateRefreshToken(refreshToken));

        // Wait for token to expire
        try {
            Thread.sleep(1100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Token should be invalid after expiration
        assertFalse(jwtTokenProvider.validateRefreshToken(refreshToken));
    }
} 