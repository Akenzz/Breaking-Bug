"""
fraud_router.py - FastAPI router for AI fraud detection endpoints.

Endpoints:
  POST /evaluate-risk  — Evaluate fraud risk for a transaction using XGBoost
"""

from fastapi import APIRouter, HTTPException, status

from schemas import TransactionStatsRequest, FraudRiskResponse
from services.fraud_service import evaluate_risk

router = APIRouter(tags=["Fraud Detection"])


@router.post(
    "/evaluate-risk",
    response_model=FraudRiskResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate transaction fraud risk",
    description=(
        "Accepts 9 raw transaction features, computes 3 engineered features "
        "internally (12 total), and returns a fraud-risk score (0-1), risk level, "
        "SHAP explanations, and block decision. Threshold: 0.80."
    ),
)
def evaluate_transaction_risk(payload: TransactionStatsRequest):
    """Evaluate fraud risk for a single transaction using XGBoost + SHAP."""
    try:
        result = evaluate_risk(payload.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fraud evaluation failed: {str(e)}",
        )
