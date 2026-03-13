package com.shrihari.smartpaybackend.analysis;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FinancialAnalysisRepository extends JpaRepository<FinancialAnalysis, Long> {

    Optional<FinancialAnalysis> findTopByUser_IdOrderByAnalysedAtDesc(Long userId);
}