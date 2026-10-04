package com.nido.backend.exception;

public class AccessDeniedDomainException extends RuntimeException {
    public AccessDeniedDomainException(String message) {
        super(message);
    }
}
