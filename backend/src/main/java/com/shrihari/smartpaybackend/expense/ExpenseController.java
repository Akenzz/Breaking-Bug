package com.shrihari.smartpaybackend.expense;

import com.shrihari.smartpaybackend.common.ApiResponse;
import com.shrihari.smartpaybackend.expense.dto.CreateExpenseRequest;
import com.shrihari.smartpaybackend.expense.dto.DirectSplitRequest;
import com.shrihari.smartpaybackend.expense.dto.EditExpenseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ApiResponse<?> createExpense(@RequestBody CreateExpenseRequest request) {

        return new ApiResponse<>(
                true,
                "Expense created successfully",
                expenseService.createExpense(request)
        );
    }
    @PostMapping("/direct-split")
    public ApiResponse<?> createDirectSplit(
            @RequestBody DirectSplitRequest request) {

        expenseService.createDirectSplit(request);

        return new ApiResponse<>(true, "Direct split created", null);
    }
    @DeleteMapping("/{expenseId}")
    public ApiResponse<?> cancelExpense(@PathVariable Long expenseId) {

        expenseService.cancelExpense(expenseId);

        return new ApiResponse<>(true, "Expense cancelled", null);
    }
    @PutMapping("/{expenseId}")
    public ApiResponse<?> editExpense(
            @PathVariable Long expenseId,
            @RequestBody EditExpenseRequest request) {

        expenseService.editExpense(expenseId, request);

        return new ApiResponse<>(true, "Expense edited", null);
    }
    @GetMapping("/group/{groupId}")
    public ApiResponse<?> getGroupExpenses(@PathVariable Long groupId) {
        return new ApiResponse<>(true, "Group expenses fetched",
                expenseService.getGroupExpenses(groupId));
    }

    @GetMapping("/group/{groupId}/my")
    public ApiResponse<?> getMyExpensesInGroup(@PathVariable Long groupId) {
        return new ApiResponse<>(true, "My group expenses fetched",
                expenseService.getMyExpensesInGroup(groupId));
    }

    @GetMapping("/my")
    public ApiResponse<?> getMyExpenses() {
        return new ApiResponse<>(true, "My expenses fetched",
                expenseService.getMyExpenses());
    }

}
