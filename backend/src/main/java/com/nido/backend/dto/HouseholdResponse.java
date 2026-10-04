package com.nido.backend.dto;

import java.time.Instant;

public record HouseholdResponse(
        Long id,
        String name,
        String role,
        Instant joinedAt,
        Instant createdAt
) {
}
