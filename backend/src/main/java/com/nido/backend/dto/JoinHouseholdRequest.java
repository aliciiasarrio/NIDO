package com.nido.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinHouseholdRequest(
        @NotBlank(message = "El código de invitación no puede estar vacío")
        String code
) {
}
