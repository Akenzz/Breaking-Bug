package com.shrihari.smartpaybackend.user;

import com.shrihari.smartpaybackend.common.ApiResponse;
import com.shrihari.smartpaybackend.exception.ApiException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService userService;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;

    @GetMapping("/me")
    public ApiResponse<?> getProfile() {
        return new ApiResponse<>(
                true,
                "User profile fetched",
                userService.getCurrentUser()
        );
    }

    @PutMapping("/upi")
    public ApiResponse<?> updateUpiId(@RequestBody UpiRequest request) {

        if (request.getUpiId() == null || request.getUpiId().isBlank()) {
            throw new ApiException("UPI ID cannot be empty");
        }

        User currentUser = authorizationService.getCurrentUser();
        currentUser.setUpiId(request.getUpiId());
        userRepository.save(currentUser);

        return new ApiResponse<>(true, "UPI ID updated successfully", null);
    }

    @Data
    static class UpiRequest {
        private String upiId;
    }
}