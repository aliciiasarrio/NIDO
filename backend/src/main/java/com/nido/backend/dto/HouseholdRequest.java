package com.nido.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HouseholdRequest(
        @NotBlank(message = "El nombre del hogar no puede estar vacío")
        @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres")
        String name
) {
}
