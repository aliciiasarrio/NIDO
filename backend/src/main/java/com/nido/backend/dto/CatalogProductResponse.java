package com.nido.backend.dto;

import java.math.BigDecimal;

public record CatalogProductResponse(
        String id,
        String name,
        String categoryName,
        String itemType,
        String defaultUnit,
        Integer defaultMinimumQuantity,
        BigDecimal typicalPriceMin,
        BigDecimal typicalPriceMax,
        String priceUnit,
        String marketReference,
        String imageUrl
) {}
