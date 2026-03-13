"""
models.py - SQLAlchemy ORM models for the scam reporting system.

Defines two tables:
  1. scam_reports  — stores individual user reports
  2. scammer_profiles — tracks aggregated report counts and scammer status
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship

from database import Base


class ScamReport(Base):
    """
    Represents a single scam report filed by one user against another.

    A unique constraint on (reporter_user_id, reported_user_id) prevents
    the same reporter from filing duplicate reports against the same user.
    """
    __tablename__ = "scam_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reporter_user_id = Column(Integer, nullable=False, index=True)
    reported_user_id = Column(
        Integer,
        ForeignKey("scammer_profiles.user_id"),
        nullable=False,
        index=True,
    )
    reason = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # one reporter can only report a given user once
    __table_args__ = (
        UniqueConstraint(
            "reporter_user_id", "reported_user_id", name="uq_reporter_reported"
        ),
    )

    # Relationship back to the scammer profile
    scammer_profile = relationship("ScammerProfile", back_populates="reports")

    def __repr__(self) -> str:
        return (
            f"<ScamReport(id={self.id}, reporter={self.reporter_user_id}, "
            f"reported={self.reported_user_id})>"
        )


class ScammerProfile(Base):
    """
    Tracks the cumulative report count for a user and whether they have
    crossed the scammer threshold (10+ reports -> is_scammer = True).
    """
    __tablename__ = "scammer_profiles"

    user_id = Column(Integer, primary_key=True, index=True)
    report_count = Column(Integer, default=0, nullable=False)
    is_scammer = Column(Boolean, default=False, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reports = relationship("ScamReport", back_populates="scammer_profile", lazy="dynamic")

    def __repr__(self) -> str:
        return (
            f"<ScammerProfile(user_id={self.user_id}, "
            f"report_count={self.report_count}, is_scammer={self.is_scammer})>"
        )
