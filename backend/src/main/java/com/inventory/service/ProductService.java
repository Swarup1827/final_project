package com.inventory.service;

import com.inventory.dto.ProductRequest;
import com.inventory.dto.ProductResponse;
import com.inventory.entity.Product;
import com.inventory.entity.Shop;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final ShopService shopService;

    @Transactional
    public ProductResponse addProduct(Long shopId, ProductRequest request, Long ownerId) {
        // Validate that the shop belongs to the owner
        if (!shopService.isOwner(shopId, ownerId)) {
            throw new RuntimeException("You don't have permission to add products to this shop");
        }

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));

        Product product = new Product();
        product.setShop(shop);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    public List<ProductResponse> getProductsByShop(Long shopId) {
        List<Product> products = productRepository.findByShopId(shopId);
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, ProductRequest request, Long ownerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // Validate that the product belongs to a shop owned by the user
        if (!productRepository.existsByIdAndShopOwnerId(productId, ownerId)) {
            throw new RuntimeException("You don't have permission to update this product");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long productId, Long ownerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // Validate that the product belongs to a shop owned by the user
        if (!productRepository.existsByIdAndShopOwnerId(productId, ownerId)) {
            throw new RuntimeException("You don't have permission to delete this product");
        }

        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getShop().getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getCategory()
        );
    }
}

