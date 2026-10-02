package com.nido.backend.service;

import com.nido.backend.dto.RegisterRequest;
import com.nido.backend.dto.UserResponse;
import com.nido.backend.entity.User;
import com.nido.backend.exception.EmailAlreadyExistsException;
import com.nido.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String name = request.name().trim();
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("El correo ya está registrado");
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User user = new User(name, normalizedEmail, passwordHash);

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage() != null && e.getMessage().contains("users_email_key")) {
                throw new EmailAlreadyExistsException("El correo ya está registrado");
            }
            throw e;
        }

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
