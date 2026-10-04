package com.nido.backend;

import com.nido.backend.dto.LoginRequest;
import com.nido.backend.dto.RegisterRequest;
import com.nido.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    void shouldRegisterAndAuthenticateUser() {
        String uniqueEmail = "testuser_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerRequest = new RegisterRequest("Test User", uniqueEmail, "SecretPass123");

        var userResponse = authService.register(registerRequest);
        assertNotNull(userResponse.id());
        assertEquals("Test User", userResponse.name());
        assertEquals(uniqueEmail, userResponse.email());

        var authenticatedUser = authService.authenticate(uniqueEmail, "SecretPass123");
        assertNotNull(authenticatedUser);
        assertEquals(userResponse.id(), authenticatedUser.getId());
    }
}
