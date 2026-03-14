package com.shrihari.smartpaybackend.risk;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RiskCheckResponse {

    @JsonProperty("fraud_risk_score")
    private double fraudRiskScore;

    @JsonProperty("risk_level")
    private String riskLevel;

    @JsonProperty("is_blocked")
    private boolean isBlocked;

    private String message;

    @JsonProperty("risk_reasons")
    private List<String> riskReasons;
}