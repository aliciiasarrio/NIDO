package com.nido.backend.dto;

import com.nido.backend.entity.InventoryMovement;
import java.time.Instant;

public record MovementResponse(
        Long id,
        Long itemId,
        String itemName,
        InventoryMovement.MovementType movementType,
        Integer quantity,
        Long sourceLocationId,
        String sourceLocationName,
        Long destinationLocationId,
        String destinationLocationName,
        String reason,
        Instant createdAt
) {
}
