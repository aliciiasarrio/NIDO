package com.nido.backend.dto;

import java.time.Instant;

public record InvitationResponse(
        Long id,
        Long householdId,
        String householdName,
        String code,
        Instant expiresAt,
        Instant createdAt
) {
}
