package com.shrihari.smartpaybackend.user;

import com.shrihari.smartpaybackend.exception.ApiException;
import com.shrihari.smartpaybackend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public String register(String email, String phone, String password, String fullName) {

        if ((email == null || email.isBlank()) &&
                (phone == null || phone.isBlank())) {
            throw new ApiException("Either email or phone must be provided");
        }

        if (email != null && userRepository.findByEmail(email).isPresent()) {
            throw new ApiException("Email already registered");
        }

        if (phone != null && userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new ApiException("Phone already registered");
        }

        User user = User.builder()
                .email(email)
                .phoneNumber(phone)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return jwtService.generateToken(
                email != null ? email : phone
        );
    }

    public String login(String identifier, String password) {

        User user = userRepository
                .findByEmailOrPhoneNumber(identifier, identifier)
                .orElseThrow(() -> new ApiException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ApiException("Invalid credentials");
        }

        return jwtService.generateToken(identifier);
    }
    public UserProfileResponse getCurrentUser() {

        String identifier = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmailOrPhoneNumber(identifier, identifier)
                .orElseThrow(() -> new ApiException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .upiId(user.getUpiId())
                .role(user.getRole().name())
                .build();
    }

}

