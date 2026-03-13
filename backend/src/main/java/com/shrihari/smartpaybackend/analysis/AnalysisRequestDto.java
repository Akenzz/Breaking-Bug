package com.shrihari.smartpaybackend.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequestDto {

    private List<TransactionDto> transactions;
    private String username;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionDto {
        private BigDecimal amount;
        private LocalDateTime createdAt;
        private String description;
        private String fromUserName;
        private String toUserName;
    }
}