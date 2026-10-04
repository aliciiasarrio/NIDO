package com.nido.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record PurchaseEntryRequest(
        @NotNull(message = "La cantidad comprada es obligatoria")
        @Positive(message = "La cantidad debe ser mayor que cero")
        Integer quantityPurchased,

        @NotNull(message = "La ubicación de destino es obligatoria")
        Long destinationLocationId,

        Long createAsCategoryId,
        String batchNumber,
        LocalDate expirationDate
) {
}
