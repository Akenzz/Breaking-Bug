"""
generate_dataset.py — Synthetic transaction data generator for fraud detection.

Produces overlapping, noisy distributions between fraud and normal classes
including gray-zone transactions, legitimate high-activity receivers, and
realistic business-receiver scenarios (airlines, restaurants, hotels, etc.)
so the model learns probabilistic patterns rather than hard boundaries.

Key design choices:
- Fraud `previous_connections_count` overlaps with normal (0-6 vs 0-30)
  to prevent the model from using this feature as a perfect separator.
- Business receivers have high account age, zero reports, and many unique
  senders — teaching the model that first-time high-value payments can be
  perfectly legitimate.
- First-time stranger payments are explicitly included as normal cases.
"""

import random
import pandas as pd
from datetime import datetime, timedelta


def _make_row(hour: int, **kwargs) -> dict:
    days_ago = random.randint(0, 30)
    created_at = datetime.now() - timedelta(days=days_ago)
    created_at = created_at.replace(hour=hour, minute=random.randint(0, 59))
    kwargs["hour_of_day"] = hour
    kwargs["is_weekend"] = 1 if created_at.weekday() >= 5 else 0
    return kwargs


def _add_noise(row: dict) -> dict:
    """Add slight randomness to numeric features to break deterministic patterns."""
    row["amount"] = round(max(0.01, row["amount"] * random.uniform(0.9, 1.1)), 2)
    row["receiver_tx_count_24h"] = max(0, row["receiver_tx_count_24h"] + random.randint(-2, 2))
    row["receiver_unique_senders_24h"] = max(0, row["receiver_unique_senders_24h"] + random.randint(-2, 2))
    row["receiver_account_age_days"] = max(0, row["receiver_account_age_days"] + random.randint(-5, 5))
    row["avg_transaction_amount_7d"] = round(max(0.0, row["avg_transaction_amount_7d"] * random.uniform(0.9, 1.1)), 2)
    return row


# ── Normal transaction types ──────────────────────────────────────────────

def _normal_regular() -> dict:
    return _make_row(
        hour=random.randint(6, 23),
        amount=round(random.uniform(20.0, 5000.0), 2),
        receiver_account_age_days=random.randint(30, 700),
        receiver_report_count=random.randint(0, 2),
        receiver_tx_count_24h=random.randint(1, 12),
        receiver_unique_senders_24h=random.randint(1, 6),
        previous_connections_count=random.randint(0, 30),
        avg_transaction_amount_7d=round(random.uniform(50.0, 2000.0), 2),
        is_fraud=0,
    )


def _normal_group_settlement() -> dict:
    """Legitimate high-activity: group trip / rent split / event collection."""
    return _make_row(
        hour=random.randint(8, 22),
        amount=round(random.uniform(100.0, 3000.0), 2),
        receiver_account_age_days=random.randint(90, 600),
        receiver_report_count=0,
        receiver_tx_count_24h=random.randint(10, 25),
        receiver_unique_senders_24h=random.randint(5, 15),
        previous_connections_count=random.randint(5, 20),
        avg_transaction_amount_7d=round(random.uniform(200.0, 2000.0), 2),
        is_fraud=0,
    )


def _normal_popular_receiver() -> dict:
    """Bus ticket sellers, restaurants, shops — legitimately high velocity."""
    return _make_row(
        hour=random.randint(7, 22),
        amount=round(random.uniform(50.0, 2000.0), 2),
        receiver_account_age_days=random.randint(100, 600),
        receiver_report_count=0,
        receiver_tx_count_24h=random.randint(20, 40),
        receiver_unique_senders_24h=random.randint(10, 25),
        previous_connections_count=random.randint(0, 20),
        avg_transaction_amount_7d=round(random.uniform(100.0, 1500.0), 2),
        is_fraud=0,
    )


def _normal_business_receiver() -> dict:
    """Legitimate business that receives many payments from strangers.

    Simulates: airline ticket purchases, restaurant payments, hotel bookings,
    bus ticket sellers, local shops, travel agents.
    High account age, zero reports, many unique senders, low/zero previous
    connections — but NOT fraud.
    """
    return _make_row(
        hour=random.randint(6, 23),
        amount=round(random.uniform(2000.0, 15000.0), 2),
        receiver_account_age_days=random.randint(400, 1500),
        receiver_report_count=0,
        receiver_tx_count_24h=random.randint(10, 40),
        receiver_unique_senders_24h=random.randint(5, 25),
        previous_connections_count=random.randint(0, 3),
        avg_transaction_amount_7d=round(random.uniform(3000.0, 12000.0), 2),
        is_fraud=0,
    )


def _normal_first_time_stranger() -> dict:
    """Legitimate first-time payment to a stranger for services.

    Simulates: freelancer payment, second-hand purchase, local service,
    event ticket from an individual seller.
    previous_connections_count is always 0.
    """
    return _make_row(
        hour=random.randint(7, 22),
        amount=round(random.uniform(100.0, 5000.0), 2),
        receiver_account_age_days=random.randint(200, 1200),
        receiver_report_count=0,
        receiver_tx_count_24h=random.randint(3, 15),
        receiver_unique_senders_24h=random.randint(2, 10),
        previous_connections_count=0,
        avg_transaction_amount_7d=round(random.uniform(100.0, 5000.0), 2),
        is_fraud=0,
    )


# ── Gray-zone transactions ───────────────────────────────────────────────

def _gray_zone() -> dict:
    """Ambiguous transactions — half labeled fraud, half normal."""
    row = _make_row(
        hour=random.randint(0, 23),
        amount=round(random.uniform(300.0, 5000.0), 2),
        receiver_account_age_days=random.randint(30, 200),
        receiver_report_count=random.randint(0, 2),
        receiver_tx_count_24h=random.randint(5, 15),
        receiver_unique_senders_24h=random.randint(3, 10),
        previous_connections_count=random.randint(0, 6),
        avg_transaction_amount_7d=round(random.uniform(200.0, 2000.0), 2),
        is_fraud=random.choice([0, 1]),
    )
    return row


# ── Fraud transaction types ──────────────────────────────────────────────

def _fraud_burst() -> dict:
    """New account suddenly receives many payments from many senders."""
    return _make_row(
        hour=random.randint(0, 23),
        amount=round(random.uniform(100.0, 3000.0), 2),
        receiver_account_age_days=random.randint(0, 30),
        receiver_report_count=random.randint(0, 6),
        receiver_tx_count_24h=random.randint(12, 50),
        receiver_unique_senders_24h=random.randint(8, 35),
        previous_connections_count=random.randint(0, 6),
        avg_transaction_amount_7d=round(random.uniform(0.0, 1000.0), 2),
        is_fraud=1,
    )


def _fraud_ato() -> dict:
    """Account take-over — large transfers at odd hours."""
    return _make_row(
        hour=random.choice(list(range(0, 6)) + [23]),
        amount=round(random.uniform(3000.0, 50000.0), 2),
        receiver_account_age_days=random.randint(150, 800),
        receiver_report_count=random.randint(0, 5),
        receiver_tx_count_24h=random.randint(5, 20),
        receiver_unique_senders_24h=random.randint(3, 10),
        previous_connections_count=random.randint(0, 6),
        avg_transaction_amount_7d=round(random.uniform(0.0, 1000.0), 2),
        is_fraud=1,
    )


def _fraud_micro_test() -> dict:
    """Tiny transactions to verify stolen credentials."""
    return _make_row(
        hour=random.randint(0, 23),
        amount=round(random.uniform(1.0, 15.0), 2),
        receiver_account_age_days=random.randint(5, 60),
        receiver_report_count=random.randint(0, 4),
        receiver_tx_count_24h=random.randint(10, 30),
        receiver_unique_senders_24h=random.randint(4, 15),
        previous_connections_count=random.randint(0, 3),
        avg_transaction_amount_7d=round(random.uniform(0.0, 50.0), 2),
        is_fraud=1,
    )


def _fraud_social_engineering() -> dict:
    """Manipulated victims send to semi-established accounts."""
    return _make_row(
        hour=random.randint(8, 22),
        amount=round(random.uniform(500.0, 10000.0), 2),
        receiver_account_age_days=random.randint(60, 400),
        receiver_report_count=random.randint(0, 4),
        receiver_tx_count_24h=random.randint(5, 20),
        receiver_unique_senders_24h=random.randint(4, 12),
        previous_connections_count=random.randint(0, 6),
        avg_transaction_amount_7d=round(random.uniform(50.0, 1000.0), 2),
        is_fraud=1,
    )


def _fraud_slow_scam() -> dict:
    """Low-and-slow siphoning that mimics normal activity."""
    return _make_row(
        hour=random.randint(8, 20),
        amount=round(random.uniform(100.0, 2000.0), 2),
        receiver_account_age_days=random.randint(40, 400),
        receiver_report_count=random.randint(0, 3),
        receiver_tx_count_24h=random.randint(3, 15),
        receiver_unique_senders_24h=random.randint(2, 10),
        previous_connections_count=random.randint(0, 6),
        avg_transaction_amount_7d=round(random.uniform(100.0, 1000.0), 2),
        is_fraud=1,
    )


# ── Generator weights ────────────────────────────────────────────────────

_NORMAL_GENERATORS = [
    (_normal_regular, 0.40),
    (_normal_group_settlement, 0.10),
    (_normal_popular_receiver, 0.10),
    (_normal_business_receiver, 0.18),
    (_normal_first_time_stranger, 0.12),
    (_gray_zone, 0.10),
]
_NORMAL_FUNCS, _NORMAL_WEIGHTS = zip(*_NORMAL_GENERATORS)

_FRAUD_GENERATORS = [
    (_fraud_burst, 0.20),
    (_fraud_ato, 0.15),
    (_fraud_micro_test, 0.10),
    (_fraud_social_engineering, 0.15),
    (_fraud_slow_scam, 0.15),
    (_gray_zone, 0.25),
]
_FRAUD_FUNCS, _FRAUD_WEIGHTS = zip(*_FRAUD_GENERATORS)


# ── Dataset generation ────────────────────────────────────────────────────

def generate_dataset(num_rows: int = 15000, fraud_ratio: float = 0.20) -> pd.DataFrame:
    rows: list[dict] = []

    for _ in range(num_rows):
        if random.random() < fraud_ratio:
            gen = random.choices(_FRAUD_FUNCS, weights=_FRAUD_WEIGHTS, k=1)[0]
            row = gen()
            if gen != _gray_zone:
                row["is_fraud"] = 1
        else:
            gen = random.choices(_NORMAL_FUNCS, weights=_NORMAL_WEIGHTS, k=1)[0]
            row = gen()
            if gen != _gray_zone:
                row["is_fraud"] = 0

        row = _add_noise(row)
        rows.append(row)

    df = pd.DataFrame(rows)

    # Engineered features
    df["amount_deviation"] = round(df["amount"] / (df["avg_transaction_amount_7d"] + 1), 4)
    df["velocity_ratio"] = round(
        df["receiver_unique_senders_24h"] / (df["receiver_tx_count_24h"] + 1), 4
    )
    df["is_first_interaction"] = (df["previous_connections_count"] == 0).astype(int)

    column_order = [
        "amount", "hour_of_day", "is_weekend",
        "receiver_account_age_days", "receiver_report_count",
        "receiver_tx_count_24h", "receiver_unique_senders_24h",
        "previous_connections_count", "avg_transaction_amount_7d",
        "amount_deviation", "velocity_ratio", "is_first_interaction",
        "is_fraud",
    ]
    return df[column_order]


if __name__ == "__main__":
    dataset = generate_dataset()
    output_path = "transactions_data.csv"
    dataset.to_csv(output_path, index=False)

    fraud_count = int(dataset["is_fraud"].sum())
    normal_count = len(dataset) - fraud_count
    print(f"Generated {len(dataset)} transactions ({normal_count} normal, {fraud_count} fraud)")
    print(f"Saved to '{output_path}'")
    print(f"Columns: {list(dataset.columns)}")
