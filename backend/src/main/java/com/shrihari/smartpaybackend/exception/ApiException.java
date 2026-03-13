package com.shrihari.smartpaybackend.exception;

public class ApiException extends RuntimeException {

    public ApiException(String message) {
        super(message);
    }
}