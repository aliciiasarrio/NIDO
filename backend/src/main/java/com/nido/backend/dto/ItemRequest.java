package com.nido.backend.dto;

import com.nido.backend.entity.Item;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ItemRequest(
        @NotNull(message = "La categoría es obligatoria")
        Long categoryId,

        @NotBlank(message = "El nombre del producto no puede estar vacío")
        @Size(max = 150, message = "El nombre no puede tener más de 150 caracteres")
        String name,

        String description,

        @NotNull(message = "El tipo de objeto es obligatorio (CONSUMABLE o DURABLE)")
        Item.ItemType itemType,

        @PositiveOrZero(message = "El stock mínimo no puede ser negativo")
        Integer minimumQuantity,

        String unit,
        String clothingSize,
        String clothingColor,
        String imageData,
        String marketReference,
        java.math.BigDecimal marketPriceMin,
        java.math.BigDecimal marketPriceMax
) {
    public ItemRequest(Long categoryId, String name, String description, Item.ItemType itemType,
                       Integer minimumQuantity, String unit, String clothingSize, String clothingColor) {
        this(categoryId, name, description, itemType, minimumQuantity, unit, clothingSize, clothingColor, null, null, null, null);
    }
}
