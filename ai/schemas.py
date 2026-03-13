"""
schemas.py - Pydantic schemas for request validation and response serialization.
"""

from datetime import datetime
from pydantic import BaseModel, Field


# ==================== REQUEST SCHEMAS ====================

class ReportUserRequest(BaseModel):
    """Payload for POST /report-user."""
    reporter_user_id: int = Field(..., description="ID of the user filing the report")
    reported_user_id: int = Field(..., description="ID of the user being reported")
    reason: str = Field(
        ..., min_length=1, max_length=500,
        description="Reason for reporting this user"
    )


# ==================== RESPONSE SCHEMAS ====================

class ReportUserResponse(BaseModel):
    """Response after successfully submitting a report."""
    message: str = Field(..., description="Status message")
    reported_user_id: int = Field(..., description="ID of the reported user")
    report_count: int = Field(..., description="Total reports against this user")
    is_scammer: bool = Field(..., description="Whether user is now flagged as scammer")


class ScammerStatusResponse(BaseModel):
    """Response for GET /scammer-status/{user_id}."""
    user_id: int = Field(..., description="User ID")
    report_count: int = Field(..., description="Total reports against this user")
    is_scammer: bool = Field(..., description="Whether user is flagged as a scammer")


class ErrorResponseSchema(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str = Field(..., description="Human-readable error message")
    error_code: str = Field(..., description="Machine-readable error code")


# ==================== FRAUD DETECTION SCHEMAS ====================

class TransactionStatsRequest(BaseModel):
    """Payload for POST /evaluate-risk — 9 features required by the XGBoost model."""
    amount: float = Field(..., description="Transaction amount")
    hour_of_day: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    is_weekend: int = Field(..., ge=0, le=1, description="1 if weekend, 0 otherwise")
    receiver_account_age_days: int = Field(..., ge=0, description="Age of the receiver's account in days")
    receiver_report_count: int = Field(..., ge=0, description="Number of scam reports against the receiver")
    receiver_tx_count_24h: int = Field(..., ge=0, description="Receiver's transaction count in the last 24 hours")
    receiver_unique_senders_24h: int = Field(..., ge=0, description="Unique senders to receiver in the last 24 hours")
    previous_connections_count: int = Field(..., ge=0, description="Number of previous transactions between the two users")
    avg_transaction_amount_7d: float = Field(..., ge=0, description="Sender's average transaction amount over the last 7 days")


class FeatureImpact(BaseModel):
    """Single SHAP feature impact."""
    feature: str
    value: float | int | None = None
    impact: float


class FraudRiskResponse(BaseModel):
    """Response from POST /evaluate-risk."""
    fraud_risk_score: float = Field(..., ge=0, le=1, description="Fraud probability (0.0 = safe, 1.0 = certain fraud)")
    risk_level: str = Field(..., description="Risk level: HIGH, MEDIUM, LOW, or SAFE")
    is_blocked: bool = Field(..., description="Whether the transaction was blocked")
    message: str = Field(..., description="Human-readable decision summary")
    explanation: list[FeatureImpact] = Field(default_factory=list, description="SHAP feature impacts sorted by absolute value")
    risk_reasons: list[str] = Field(default_factory=list, description="Top human-readable risk reasons")
