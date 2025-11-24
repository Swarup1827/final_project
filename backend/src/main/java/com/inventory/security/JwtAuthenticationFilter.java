package com.inventory.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.dev-mode:false}")
    private boolean devMode;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // Development mode: Accept mock token for testing ONLY in dev mode
            if (devMode && "mock-jwt-token".equals(token)) {
                // Set up mock authentication for development
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        "1", // Mock user ID
                        token,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_SHOP"))
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                // Production mode: Validate real JWT token
                try {
                    var claims = jwtUtil.extractClaims(token);
                    String userId = claims.get("userId", String.class);
                    String role = claims.get("role", String.class);
                    
                    if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userId,
                                token,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (Exception e) {
                    // Invalid token, continue without authentication
                    // Log the error in production
                    logger.warn("JWT validation failed: " + e.getMessage());
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
}