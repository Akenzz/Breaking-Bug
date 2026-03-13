package com.shrihari.smartpaybackend.ledger;

import com.shrihari.smartpaybackend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping("/group/{groupId}/user/{userId}")
    public ApiResponse<?> getBalance(
            @PathVariable Long groupId,
            @PathVariable Long userId) {

        return new ApiResponse<>(
                true,
                "Balance fetched",
                ledgerService.getUserBalance(groupId, userId)
        );
    }
    @GetMapping("/group/{groupId}/balances")
    public ApiResponse<?> getGroupBalances(@PathVariable Long groupId) {

        return new ApiResponse<>(
                true,
                "Group balances fetched",
                ledgerService.getGroupBalances(groupId)
        );
    }
    @GetMapping("/group/{groupId}/transactions")
    public ApiResponse<?> getGroupTransactions(@PathVariable Long groupId) {

        return new ApiResponse<>(
                true,
                "Transactions fetched",
                ledgerService.getGroupTransactions(groupId)
        );
    }
    @GetMapping("/group/{groupId}/simplified-debts")
    public ApiResponse<?> simplifiedDebts(@PathVariable Long groupId) {

        return new ApiResponse<>(
                true,
                "Simplified debts",
                ledgerService.getSimplifiedDebts(groupId)
        );
    }
    @GetMapping("/my-transactions")
    public ApiResponse<?> myTransactions() {

        return new ApiResponse<>(
                true,
                "My transactions fetched",
                ledgerService.getMyTransactions()
        );
    }
    @GetMapping("/who-owes-me")
    public ApiResponse<?> whoOwesMe() {

        return new ApiResponse<>(
                true,
                "People who owe me",
                ledgerService.getWhoOwesMe()
        );
    }
    @GetMapping("/whom-i-owe")
    public ApiResponse<?> whomIOwe() {

        return new ApiResponse<>(
                true,
                "People I owe",
                ledgerService.getWhomIOwe()
        );
    }


}
