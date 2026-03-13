package com.shrihari.smartpaybackend.personalexpense;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PersonalExpenseRepository extends JpaRepository<PersonalExpense, Long> {

    List<PersonalExpense> findByUser_IdOrderByExpenseDateDesc(Long userId);

    List<PersonalExpense> findByUser_IdAndExpenseDateBetween(
            Long userId,
            LocalDateTime from,
            LocalDateTime to
    );
}