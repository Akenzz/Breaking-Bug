package com.shrihari.smartpaybackend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private String upiId;
}
