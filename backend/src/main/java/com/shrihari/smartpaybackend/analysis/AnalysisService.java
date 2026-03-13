package com.shrihari.smartpaybackend.analysis;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.shrihari.smartpaybackend.exception.ApiException;
import com.shrihari.smartpaybackend.expense.ExpenseRepository;
import com.shrihari.smartpaybackend.ledger.LedgerEntry;
import com.shrihari.smartpaybackend.ledger.LedgerRepository;
import com.shrihari.smartpaybackend.user.AuthorizationService;
import com.shrihari.smartpaybackend.user.User;
import com.shrihari.smartpaybackend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final FinancialAnalysisRepository analysisRepository;
    private final LedgerRepository ledgerRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final ExpenseRepository expenseRepository;

    @Value("https://Akenzz-SmartPay.hf.space/analyze-finance")
    private String analysisApiUrl;

    // Runs every day at 12pm
    @Scheduled(cron = "0 0 12 * * *")
    public void runDailyAnalysisForAllUsers() {
        log.info("Starting daily financial analysis job at {}", LocalDateTime.now());

        List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            try {
                analyzeAndSaveForUser(user);
            } catch (Exception e) {
                log.error("Failed to analyze user {}: {}", user.getId(), e.getMessage());
            }
        }

        log.info("Daily financial analysis job completed.");
    }

    public void analyzeAndSaveForUser(User user) throws Exception {

        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        LocalDateTime since = LocalDateTime.now().minusDays(7);

        List<LedgerEntry> entries = ledgerRepository
                .findByFromUser_IdOrToUser_Id(user.getId(), user.getId())
                .stream()
                .filter(e -> e.getCreatedAt() != null && e.getCreatedAt().isAfter(since))
                .toList();

        if (entries.isEmpty()) {
            log.info("No transactions in last 7 days for user {}. Skipping.", user.getId());
            return;
        }

        String username = user.getFullName() != null
                ? user.getFullName()
                : (user.getEmail() != null ? user.getEmail() : user.getPhoneNumber());

        List<AnalysisRequestDto.TransactionDto> txDtos = entries.stream()
                .map(e -> AnalysisRequestDto.TransactionDto.builder()
                        .amount(e.getAmount())
                        .createdAt(e.getCreatedAt())
                        .description(resolveDescription(e))
                        .fromUserName(e.getFromUser().getFullName())
                        .toUserName(e.getToUser().getFullName())
                        .build()
                )
                .toList();

        AnalysisRequestDto requestDto = AnalysisRequestDto.builder()
                .transactions(txDtos)
                .username(username)
                .build();

        String requestBody = mapper.writeValueAsString(requestDto); // ← fixed: use local mapper

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(analysisApiUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() != 200) {
            throw new RuntimeException("AI API returned status: " + response.statusCode());
        }

        String rawJson = response.body();

        analysisRepository.findTopByUser_IdOrderByAnalysedAtDesc(user.getId())
                .ifPresent(existing -> {
                    if (existing.getAnalysedAt().toLocalDate()
                            .equals(LocalDateTime.now().toLocalDate())) {
                        analysisRepository.delete(existing);
                    }
                });

        FinancialAnalysis analysis = FinancialAnalysis.builder()
                .user(user)
                .analysedAt(LocalDateTime.now())
                .rawResponse(rawJson)
                .build();

        analysisRepository.save(analysis);

        log.info("Analysis saved for user {}", user.getId());
    }

    @Cacheable(value = "analysis", key = "#root.target.getCurrentUserIdForCache()")
    public String getLatestAnalysisForCurrentUser() {

        User currentUser = authorizationService.getCurrentUser();

        FinancialAnalysis analysis = analysisRepository
                .findTopByUser_IdOrderByAnalysedAtDesc(currentUser.getId())
                .orElseThrow(() -> new ApiException("No analysis found. Please wait for the next scheduled run."));

        return analysis.getRawResponse();
    }

    private String resolveDescription(LedgerEntry entry) {

        if (entry.getReferenceType() == null) return "transaction";

        switch (entry.getReferenceType()) {
            case EXPENSE -> {
                return expenseRepository.findById(entry.getReferenceId())
                        .map(e -> e.getDescription())
                        .orElse("expense");
            }
            case PERSONAL_EXPENSE -> {
                return "personal expense";
            }
            case SETTLEMENT -> {
                return "settlement";
            }
            default -> {
                return "transaction";
            }
        }
    }

    public Long getCurrentUserIdForCache() {
        String identifier = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmailOrPhoneNumber(identifier, identifier)
                .map(u -> u.getId())
                .orElse(0L);
    }
}