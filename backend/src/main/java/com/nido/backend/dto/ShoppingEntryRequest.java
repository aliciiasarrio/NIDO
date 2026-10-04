package com.nido.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ShoppingEntryRequest(
        Long itemId,

        @NotBlank(message = "El nombre no puede estar vacío")
        @Size(max = 150, message = "El nombre no puede tener más de 150 caracteres")
        String name,

        @Positive(message = "La cantidad debe ser mayor que cero")
        Integer pendingQuantity
) {
}
