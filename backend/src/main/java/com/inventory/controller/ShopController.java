package com.inventory.controller;

import com.inventory.dto.ShopRequest;
import com.inventory.dto.ShopResponse;
import com.inventory.security.JwtUtil;
import com.inventory.service.ShopService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shops")
@Validated
public class ShopController extends BaseController {

    private final ShopService shopService;

    public ShopController(JwtUtil jwtUtil, ShopService shopService) {
        super(jwtUtil);
        this.shopService = shopService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<ShopResponse> registerShop(
            @Valid @RequestBody ShopRequest request,
            Authentication authentication) {

        Long userId = extractUserId(authentication);
        ShopResponse response = shopService.registerShop(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<List<ShopResponse>> getMyShops(Authentication authentication) {
        Long userId = extractUserId(authentication);
        List<ShopResponse> shops = shopService.getShopsByOwner(userId);
        return ResponseEntity.ok(shops);
    }

    /**
     * Endpoint to get ALL shops in the system (ADMIN only).
     * GET /api/v1/shops
     * 
     * @return ResponseEntity with list of all shops
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ShopResponse>> getAllShops() {
        List<ShopResponse> shops = shopService.getAllShops();
        return ResponseEntity.ok(shops);
    }

    /**
     * Endpoint to get a specific shop by its ID.
     * GET /api/v1/shops/{id}
     * 
     * @param id The shop ID from the URL path
     * @return ResponseEntity with shop data
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<ShopResponse> getShop(@PathVariable Long id) {
        ShopResponse shop = shopService.getShopById(id);
        return ResponseEntity.ok(shop);
    }

    /**
     * Endpoint to delete a single shop.
     * DELETE /api/v1/shops/{id}
     * 
     * @param id             The shop ID to delete from the URL path
     * @param authentication Spring Security authentication object
     * @return ResponseEntity with no content (HTTP 204) on success
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<Void> deleteShop(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = extractUserId(authentication);
        shopService.deleteShop(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint to delete multiple shops at once (bulk delete).
     * DELETE /api/v1/shops/bulk
     * 
     * @param shopIds        List of shop IDs to delete from the request body
     * @param authentication Spring Security authentication object
     * @return ResponseEntity with no content (HTTP 204) on success
     */
    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('SHOP')")
    public ResponseEntity<Void> deleteShops(
            @RequestBody @NotEmpty(message = "Shop IDs list cannot be empty") List<@NotNull(message = "Shop ID cannot be null") Long> shopIds,
            Authentication authentication) {

        Long userId = extractUserId(authentication);
        shopService.deleteShops(shopIds, userId);
        return ResponseEntity.noContent().build();
    }
}