package com.inventory.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        
        // Development mode: Handle mock token
        if (authentication.getCredentials() instanceof String) {
            String token = (String) authentication.getCredentials();
            if ("mock-jwt-token".equals(token)) {
                // For mock token, user ID is stored in authentication name
                try {
                    return Long.parseLong(authentication.getName());
                } catch (NumberFormatException e) {
                    return 1L; // Default mock user ID
                }
            }
        }
        
        // Assuming JWT contains userId in claims
        // Adjust based on your JWT structure
        if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            // If using UserDetails, extract from there
            String username = ((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal()).getUsername();
            // You may need to load user from database to get ID
            // For now, assuming username is the user ID or you have a custom UserDetails implementation
        }
        
        // If JWT token is in the authentication, extract from there
        if (authentication.getCredentials() instanceof String) {
            String token = (String) authentication.getCredentials();
            try {
                Claims claims = extractClaims(token);
                return claims.get("userId", Long.class);
            } catch (Exception e) {
                // Invalid token, try fallback
            }
        }
        
        // Fallback: try to get from authentication name/principal
        // This is a simplified version - adjust based on your auth setup
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public String extractRole(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        
        // Extract role from authorities
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .orElse(null);
    }
}

