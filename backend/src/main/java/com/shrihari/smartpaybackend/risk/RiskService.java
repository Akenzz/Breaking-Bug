package com.shrihari.smartpaybackend.risk;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.shrihari.smartpaybackend.exception.ApiException;
import com.shrihari.smartpaybackend.ledger.LedgerRepository;
import com.shrihari.smartpaybackend.report.ScamReportRepository;
import com.shrihari.smartpaybackend.user.AuthorizationService;
import com.shrihari.smartpaybackend.user.User;
import com.shrihari.smartpaybackend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskService {

    private final LedgerRepository ledgerRepository;
    private final ScamReportRepository scamReportRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;

    @Value("https://Akenzz-SmartPay.hf.space/evaluate-risk")
    private String riskApiUrl;

    public RiskCheckResponse evaluateByUpiId(String receiverUpiId) {

        User sender = authorizationService.getCurrentUser();

        // --- HARDCODED TEST for fraud@upi — no DB user needed ---
        if ("fraud@upi".equals(receiverUpiId)) {
            return evaluateWithHardcodedData(sender);
        }

        User receiver = userRepository.findByUpiId(receiverUpiId)
                .orElseThrow(() -> new ApiException(
                        "No user found with UPI ID: " + receiverUpiId
                ));

        if (sender.getId().equals(receiver.getId())) {
            throw new ApiException("Cannot evaluate risk for yourself");
        }

        return evaluate(sender, receiver);
    }

    private RiskCheckResponse evaluateWithHardcodedData(User sender) {
        try {
            RiskCheckRequest request = RiskCheckRequest.builder()
                    .amount(BigDecimal.valueOf(600))
                    .hourOfDay(11)
                    .isWeekend(0)
                    .receiverAccountAgeDays(1)
                    .receiverReportCount(3)
                    .receiverTxCount24h(30)
                    .receiverUniqueSenders24h(25)
                    .previousConnectionsCount(0)
                    .avgTransactionAmount7d(BigDecimal.valueOf(20))
                    .build();

            return callApi(request);

        } catch (Exception e) {
            log.error("Risk API call failed for fraud@upi test", e);
            return safeFallback();
        }
    }

    private RiskCheckResponse evaluate(User sender, User receiver) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime last24h = now.minusHours(24);
            LocalDateTime last7d = now.minusDays(7);

            int hourOfDay = now.getHour();

            int isWeekend = (now.getDayOfWeek() == DayOfWeek.SATURDAY
                    || now.getDayOfWeek() == DayOfWeek.SUNDAY) ? 1 : 0;

            int receiverAccountAgeDays = receiver.getCreatedAt() != null
                    ? (int) ChronoUnit.DAYS.between(receiver.getCreatedAt(), now)
                    : 0;

            int receiverReportCount = scamReportRepository
                    .countByReported_Id(receiver.getId());

            int receiverTxCount24h = ledgerRepository
                    .countReceiverTransactions24h(receiver.getId(), last24h);

            int receiverUniqueSenders24h = ledgerRepository
                    .countUniqueSenders24h(receiver.getId(), last24h);

            int previousConnectionsCount = ledgerRepository
                    .countPreviousConnections(sender.getId(), receiver.getId());

            BigDecimal avgTransactionAmount7d = ledgerRepository
                    .avgTransactionAmount7d(sender.getId(), last7d);

            if (avgTransactionAmount7d == null) {
                avgTransactionAmount7d = BigDecimal.ZERO;
            }

            BigDecimal amount = avgTransactionAmount7d.compareTo(BigDecimal.ZERO) == 0
                    ? BigDecimal.valueOf(100)
                    : avgTransactionAmount7d;

            RiskCheckRequest request = RiskCheckRequest.builder()
                    .amount(amount)
                    .hourOfDay(hourOfDay)
                    .isWeekend(isWeekend)
                    .receiverAccountAgeDays(receiverAccountAgeDays)
                    .receiverReportCount(receiverReportCount)
                    .receiverTxCount24h(receiverTxCount24h)
                    .receiverUniqueSenders24h(receiverUniqueSenders24h)
                    .previousConnectionsCount(previousConnectionsCount)
                    .avgTransactionAmount7d(avgTransactionAmount7d)
                    .build();

            return callApi(request);

        } catch (Exception e) {
            log.error("Risk API call failed", e);
            return safeFallback();
        }
    }

    private RiskCheckResponse callApi(RiskCheckRequest request) throws Exception {

        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule());

        String requestBody = mapper.writeValueAsString(request);

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(riskApiUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(
                httpRequest,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() != 200) {
            log.warn("Risk API returned status: {}. Returning safe fallback.",
                    response.statusCode());
            return safeFallback();
        }

        return mapper.readValue(response.body(), RiskCheckResponse.class);
    }

    private RiskCheckResponse safeFallback() {
        RiskCheckResponse safe = new RiskCheckResponse();
        safe.setFraudRiskScore(0.0);
        safe.setRiskLevel("SAFE");
        safe.setBlocked(false);
        safe.setMessage("Risk check unavailable. Transaction allowed.");
        safe.setRiskReasons(List.of());
        return safe;
    }
}