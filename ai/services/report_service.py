"""
report_service.py - Business logic for the community scam reporting system.

Handles:
  - Filing a new report (with duplicate prevention)
  - Incrementing report counts on the scammer_profiles table
  - Automatically flagging users as scammers when report_count >= 10
  - Querying scammer status for a given user
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models import ScamReport, ScammerProfile

SCAMMER_THRESHOLD = 10


def file_report(
    db: Session,
    reporter_user_id: int,
    reported_user_id: int,
    reason: str,
) -> dict:
    """
    File a scam report against a user.

    Steps:
      1. Check if the reporter has already reported this user (prevent duplicates).
      2. Upsert the scammer_profiles row for the reported user.
      3. Insert the new scam_reports row.
      4. Increment report_count and evaluate the scammer threshold.
      5. Commit the transaction and return the updated status.

    Returns:
        dict with message, reported_user_id, report_count, is_scammer

    Raises:
        ValueError - if the reporter already reported this user
        ValueError - if a user tries to report themselves
    """

    if reporter_user_id == reported_user_id:
        raise ValueError("A user cannot report themselves.")

    existing_report = (
        db.query(ScamReport)
        .filter(
            ScamReport.reporter_user_id == reporter_user_id,
            ScamReport.reported_user_id == reported_user_id,
        )
        .first()
    )
    if existing_report:
        raise ValueError(
            f"User {reporter_user_id} has already reported user {reported_user_id}."
        )

    profile = (
        db.query(ScammerProfile)
        .filter(ScammerProfile.user_id == reported_user_id)
        .with_for_update() 
        .first()
    )
    if not profile:
        profile = ScammerProfile(
            user_id=reported_user_id,
            report_count=0,
            is_scammer=False,
            updated_at=datetime.now(timezone.utc),
        )
        db.add(profile)
        db.flush()

    new_report = ScamReport(
        reporter_user_id=reporter_user_id,
        reported_user_id=reported_user_id,
        reason=reason,
    )
    db.add(new_report)

    profile.report_count += 1
    profile.updated_at = datetime.now(timezone.utc)

    if profile.report_count >= SCAMMER_THRESHOLD:
        profile.is_scammer = True

    try:
        db.commit()
        db.refresh(profile)
    except IntegrityError:
        db.rollback()
        raise ValueError(
            f"User {reporter_user_id} has already reported user {reported_user_id}."
        )

    return {
        "message": "Report submitted successfully",
        "reported_user_id": profile.user_id,
        "report_count": profile.report_count,
        "is_scammer": profile.is_scammer,
    }


def get_scammer_status(db: Session, user_id: int) -> dict | None:
    
    profile = (
        db.query(ScammerProfile)
        .filter(ScammerProfile.user_id == user_id)
        .first()
    )
    if not profile:
        return None

    return {
        "user_id": profile.user_id,
        "report_count": profile.report_count,
        "is_scammer": profile.is_scammer,
    }
