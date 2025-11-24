package com.inventory.controller;

import com.inventory.dto.ProductRequest;
import com.inventory.dto.ProductResponse;
import com.inventory.exception.UnauthorizedException;
import com.inventory.security.JwtUtil;
import com.inventory.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final JwtUtil jwtUtil;

    @PostMapping("/shops/{shopId}/products")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<ProductResponse> addProduct(
            @PathVariable Long shopId,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        ProductResponse response = productService.addProduct(shopId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/shops/{shopId}/products")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<List<ProductResponse>> getProductsByShop(@PathVariable Long shopId) {
        List<ProductResponse> products = productService.getProductsByShop(shopId);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        ProductResponse response = productService.updateProduct(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        productService.deleteProduct(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Helper method to extract user ID from authentication.
     * Throws UnauthorizedException if user ID cannot be extracted.
     */
    private Long extractUserId(Authentication authentication) {
        Long userId = jwtUtil.extractUserId(authentication);
        if (userId == null) {
            throw new UnauthorizedException("Unable to extract user ID from authentication token");
        }
        return userId;
    }
}
