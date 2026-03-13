package com.shrihari.smartpaybackend.dashboard;

import com.shrihari.smartpaybackend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<?> getSummary() {
        return new ApiResponse<>(
                true,
                "Dashboard summary fetched",
                dashboardService.getSummary()
        );
    }

    @GetMapping("/weekly-summary")
    public ApiResponse<?> weeklySummary() {
        return new ApiResponse<>(
                true,
                "Weekly summary fetched",
                dashboardService.getWeeklySummary()
        );
    }

    @GetMapping("/chart")
    public ApiResponse<?> getChart() {
        return new ApiResponse<>(
                true,
                "OK",
                dashboardService.getChart()
        );
    }

    @GetMapping("/summary-detail")
    public ApiResponse<?> getSummaryDetail() {
        return new ApiResponse<>(
                true,
                "OK",
                dashboardService.getSummaryDetail()
        );
    }
}