package com.nido.backend.dto;

import java.time.Instant;

public record LocationResponse(
        Long id,
        Long householdId,
        Long parentId,
        String parentName,
        String name,
        String fullPath,
        Instant archivedAt,
        Instant createdAt
) {
}
