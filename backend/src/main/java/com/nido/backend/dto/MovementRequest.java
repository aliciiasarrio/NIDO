package com.nido.backend.dto;

import com.nido.backend.entity.InventoryMovement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record MovementRequest(
        @NotNull(message = "El tipo de movimiento es obligatorio")
        InventoryMovement.MovementType movementType,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor que cero")
        Integer quantity,

        Long sourceLocationId,
        Long destinationLocationId,
        String reason,
        String batchNumber,
        LocalDate expirationDate
) {
}
