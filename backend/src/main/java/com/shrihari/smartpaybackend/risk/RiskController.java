package com.shrihari.smartpaybackend.risk;

import com.shrihari.smartpaybackend.common.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;

    @PostMapping("/evaluate")
    public ApiResponse<?> evaluate(@RequestBody EvaluateRequest request) {

        if (request.getReceiverUpiId() == null || request.getReceiverUpiId().isBlank()) {
            throw new com.shrihari.smartpaybackend.exception.ApiException(
                    "Receiver UPI ID is required"
            );
        }

        RiskCheckResponse response = riskService.evaluateByUpiId(request.getReceiverUpiId());

        return new ApiResponse<>(true, "Risk evaluation complete", response);
    }

    @Data
    static class EvaluateRequest {
        private String receiverUpiId;
    }
}