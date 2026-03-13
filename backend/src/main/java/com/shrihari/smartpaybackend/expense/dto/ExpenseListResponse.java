package com.shrihari.smartpaybackend.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseListResponse {

    private Long id;
    private String description;
    private BigDecimal totalAmount;
    private String groupName;
    private String paidByName;
    private Long paidByUserId;
    private LocalDateTime createdAt;
    private Boolean isCancelled;
}