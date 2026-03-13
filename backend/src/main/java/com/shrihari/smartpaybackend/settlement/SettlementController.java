package com.shrihari.smartpaybackend.settlement;

import com.shrihari.smartpaybackend.common.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping("/initiate")
    public ApiResponse<?> initiate(@RequestBody SettlementRequest request) {

        return new ApiResponse<>(
                true,
                "Settlement initiated",
                settlementService.initiateSettlement(
                        request.getGroupId(),
                        request.getFromUserId(),
                        request.getToUserId(),
                        request.getAmount()
                )
        );
    }

    @PostMapping("/{settlementId}/claim")
    public ApiResponse<?> claim(@PathVariable Long settlementId) {

        settlementService.claimPaid(settlementId);

        return new ApiResponse<>(true, "Settlement claimed as paid", null);
    }

    @PostMapping("/{settlementId}/confirm")
    public ApiResponse<?> confirm(@PathVariable Long settlementId) {

        settlementService.confirmSettlement(settlementId);

        return new ApiResponse<>(true, "Settlement completed", null);
    }

    @PostMapping("/{settlementId}/dispute")
    public ApiResponse<?> dispute(@PathVariable Long settlementId) {

        settlementService.disputeSettlement(settlementId);

        return new ApiResponse<>(true, "Settlement disputed", null);
    }

    @GetMapping("/pending-confirmations")
    public ApiResponse<?> pendingConfirmations() {

        return new ApiResponse<>(
                true,
                "Pending confirmations",
                settlementService.getPendingConfirmations()
        );
    }

    @Data
    static class SettlementRequest {
        private Long groupId;
        private Long fromUserId;
        private Long toUserId;
        private BigDecimal amount;
    }
}