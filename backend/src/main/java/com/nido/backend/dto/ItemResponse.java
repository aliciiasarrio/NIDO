package com.nido.backend.dto;

import com.nido.backend.entity.Item;
import java.time.Instant;
import java.util.List;

public record ItemResponse(
        Long id,
        Long householdId,
        Long categoryId,
        String categoryName,
        String name,
        String description,
        Item.ItemType itemType,
        Integer minimumQuantity,
        String unit,
        String clothingSize,
        String clothingColor,
        Instant lastWornAt,
        Integer totalStock,
        boolean isLowStock,
        List<StockResponse> stocks,
        String imageData,
        String marketReference,
        java.math.BigDecimal marketPriceMin,
        java.math.BigDecimal marketPriceMax,
        Instant archivedAt,
        Instant createdAt
) {
}
