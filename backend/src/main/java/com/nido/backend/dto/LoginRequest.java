package com.nido.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "El correo no puede estar vacío")
        @Email(message = "El formato del correo es inválido")
        String email,

        @NotBlank(message = "La contraseña no puede estar vacía")
        @Size(max = 72, message = "La contraseña no puede tener más de 72 caracteres")
        String password
) {
}
