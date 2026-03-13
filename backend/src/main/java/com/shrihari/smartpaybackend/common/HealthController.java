package com.shrihari.smartpaybackend.common;


import org.springframework.web.bind.annotation.*;

@RestController
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "SmartPay Core Backend Running \nLast Updated on : 11th March at 20:24";
    }
}

