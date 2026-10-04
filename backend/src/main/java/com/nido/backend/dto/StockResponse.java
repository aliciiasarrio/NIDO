package com.nido.backend.dto;

import java.time.Instant;
import java.time.LocalDate;

public record StockResponse(
        Long id,
        Long itemId,
        String itemName,
        Long locationId,
        String locationName,
        String locationFullPath,
        Integer quantity,
        String batchNumber,
        LocalDate expirationDate,
        Instant createdAt
) {
}
