package com.shrihari.smartpaybackend.report;

import com.shrihari.smartpaybackend.exception.ApiException;
import com.shrihari.smartpaybackend.user.AuthorizationService;
import com.shrihari.smartpaybackend.user.User;
import com.shrihari.smartpaybackend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ScamReportService {

    private final ScamReportRepository scamReportRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;

    public void reportUser(Long reportedUserId, String reason) {

        User reporter = authorizationService.getCurrentUser();

        if (reporter.getId().equals(reportedUserId)) {
            throw new ApiException("Cannot report yourself");
        }

        User reported = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new ApiException("User not found"));

        if (scamReportRepository.existsByReporter_IdAndReported_Id(
                reporter.getId(), reportedUserId)) {
            throw new ApiException("You have already reported this user");
        }

        ScamReport report = ScamReport.builder()
                .reporter(reporter)
                .reported(reported)
                .reason(reason)
                .createdAt(LocalDateTime.now())
                .build();

        scamReportRepository.save(report);
    }
}