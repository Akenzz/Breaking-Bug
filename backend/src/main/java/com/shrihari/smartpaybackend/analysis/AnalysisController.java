package com.shrihari.smartpaybackend.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shrihari.smartpaybackend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;
//    private final ObjectMapper objectMapper;

    @GetMapping("/me")
    public ApiResponse<?> getMyAnalysis() {

        try {
            String rawJson = analysisService.getLatestAnalysisForCurrentUser();
            ObjectMapper mapper = new ObjectMapper();
            Object parsed = mapper.readValue(rawJson, Object.class);
            return new ApiResponse<>(true, "Analysis fetched", parsed);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Failed to parse analysis", null);
        }
    }
}