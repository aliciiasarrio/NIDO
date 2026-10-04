package com.nido.backend.dto;

import com.nido.backend.entity.ShoppingListEntry;
import java.time.Instant;

public record ShoppingEntryResponse(
        Long id,
        Long householdId,
        Long itemId,
        String itemName,
        String name,
        Integer pendingQuantity,
        ShoppingListEntry.Status status,
        Instant createdAt
) {
}
