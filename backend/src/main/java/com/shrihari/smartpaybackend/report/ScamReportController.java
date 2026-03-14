package com.shrihari.smartpaybackend.report;

import com.shrihari.smartpaybackend.common.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ScamReportController {

    private final ScamReportService scamReportService;

    @PostMapping
    public ApiResponse<?> reportUser(@RequestBody ReportRequest request) {

        scamReportService.reportUser(
                request.getReportedUserId(),
                request.getReason()
        );

        return new ApiResponse<>(true, "User reported successfully", null);
    }

    @Data
    static class ReportRequest {
        private Long reportedUserId;
        private String reason;
    }
}