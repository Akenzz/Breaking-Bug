package com.shrihari.smartpaybackend.expense;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroup_Id(Long groupId);

    List<Expense> findByGroup_IdAndPaidBy_Id(Long groupId, Long userId);

    List<Expense> findByPaidBy_Id(Long userId);
    List<Expense> findByPaidBy_IdAndIsCancelledFalse(Long userId);
    List<Expense> findByGroup_IdAndIsCancelledFalse(Long groupId);
}
