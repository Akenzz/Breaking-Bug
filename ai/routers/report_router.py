"""
report_router.py - FastAPI router for scam reporting endpoints.

Endpoints:
  POST /report-user          - File a new scam report
  GET  /scammer-status/{id}  - Check if a user is flagged as a scammer
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas import ReportUserRequest, ReportUserResponse, ScammerStatusResponse
from services.report_service import file_report, get_scammer_status

router = APIRouter(tags=["Scam Reports"])


# ==================== POST /report-user ====================

@router.post(
    "/report-user",
    response_model=ReportUserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a suspicious user",
    description=(
        "Submit a scam report against another user. "
        "Duplicate reports from the same reporter are rejected. "
        "When a user accumulates 10+ reports they are flagged as a scammer."
    ),
)
def report_user(
    payload: ReportUserRequest,
    db: Session = Depends(get_db),
):
   
    try:
        result = file_report(
            db=db,
            reporter_user_id=payload.reporter_user_id,
            reported_user_id=payload.reported_user_id,
            reason=payload.reason,
        )
        return result
    except ValueError as e:
        
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


# ==================== GET /scammer-status/{user_id} ====================

@router.get(
    "/scammer-status/{user_id}",
    response_model=ScammerStatusResponse,
    summary="Get scammer status for a user",
    description="Returns the report count and scammer flag for the given user.",
)
def scammer_status(
    user_id: int,
    db: Session = Depends(get_db),
):
   
    result = get_scammer_status(db, user_id)

   
    if result is None:
        return ScammerStatusResponse(
            user_id=user_id,
            report_count=0,
            is_scammer=False,
        )

    return result
