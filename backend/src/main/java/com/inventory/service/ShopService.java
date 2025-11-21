package com.inventory.service;

import com.inventory.dto.ShopRequest;
import com.inventory.dto.ShopResponse;
import com.inventory.entity.Shop;
import com.inventory.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;

    @Transactional
    public ShopResponse registerShop(ShopRequest request, Long ownerId) {
        Shop shop = new Shop();
        shop.setName(request.getName());
        shop.setAddress(request.getAddress());
        shop.setPhone(request.getPhone());
        shop.setOwnerId(ownerId);
        shop.setLatitude(request.getLatitude());
        shop.setLongitude(request.getLongitude());
        shop.setOpenHours(request.getOpenHours());
        shop.setDeliveryOption(request.getDeliveryOption());
        
        Shop savedShop = shopRepository.save(shop);
        return mapToResponse(savedShop);
    }

    public List<ShopResponse> getShopsByOwner(Long ownerId) {
        List<Shop> shops = shopRepository.findByOwnerId(ownerId);
        return shops.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ShopResponse getShopById(Long shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));
        return mapToResponse(shop);
    }

    /**
     * Checks if a user is the owner of a specific shop.
     * This is used for authorization checks before allowing operations on a shop.
     * 
     * @param shopId The ID of the shop to check
     * @param ownerId The ID of the user to verify ownership
     * @return true if the user owns the shop, false otherwise
     */
    public boolean isOwner(Long shopId, Long ownerId) {
        return shopRepository.existsByIdAndOwnerId(shopId, ownerId);
    }

    /**
     * Deletes a single shop by its ID.
     * This method also deletes all products associated with the shop (cascade delete).
     * 
     * @param shopId The ID of the shop to delete
     * @param ownerId The ID of the user attempting to delete (for authorization)
     * @throws RuntimeException if the shop is not found or user is not the owner
     */
    @Transactional
    public void deleteShop(Long shopId, Long ownerId) {
        // First, verify that the shop exists and the user owns it
        if (!isOwner(shopId, ownerId)) {
            throw new RuntimeException("You don't have permission to delete this shop");
        }
        
        // Find the shop entity
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));
        
        // Delete the shop (this will cascade delete all associated products due to orphanRemoval = true)
        shopRepository.delete(shop);
    }

    /**
     * Deletes multiple shops at once.
     * This is useful for bulk operations like removing multiple subscriptions.
     * 
     * @param shopIds List of shop IDs to delete
     * @param ownerId The ID of the user attempting to delete (for authorization)
     * @throws RuntimeException if any shop is not found or user is not the owner
     */
    @Transactional
    public void deleteShops(List<Long> shopIds, Long ownerId) {
        // Iterate through each shop ID and delete it
        // Each deletion is validated to ensure the user owns the shop
        for (Long shopId : shopIds) {
            deleteShop(shopId, ownerId);
        }
    }

    /**
     * Converts a Shop entity to a ShopResponse DTO.
     * This method extracts only the necessary information to send to the client.
     * 
     * @param shop The Shop entity to convert
     * @return ShopResponse DTO containing shop information
     */
    private ShopResponse mapToResponse(Shop shop) {
        return new ShopResponse(
                shop.getId(),           // Shop's unique identifier
                shop.getName(),         // Shop name
                shop.getAddress(),      // Shop address
                shop.getPhone(),        // Shop phone number
                shop.getOwnerId(),      // ID of the shop owner
                shop.getLatitude(),     // Latitude coordinate
                shop.getLongitude(),    // Longitude coordinate
                shop.getOpenHours(),    // Open hours text
                shop.getDeliveryOption()// Delivery option selected
        );
    }
}

