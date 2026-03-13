"""
Top Recipients Analyzer
========================
Determines who the user paid the most to, with totals, counts, categories,
and a human-readable reason.
"""

from typing import Dict, Any, List


def analyze_top_recipients(
    transactions: List[Dict[str, Any]],
    username: str,
    categories: Dict[str, str],
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Find the top N recipients the user paid the most to.

    Only outgoing payments (fromUserName == username) are counted.

    Args:
        transactions: Raw transaction list.
        username:     Current user's username.
        categories:   Description → Category mapping from the LLM.
        top_n:        Number of top recipients to return.

    Returns:
        List of recipient dicts sorted by total amount descending.
    """
    recipient_data: Dict[str, Dict[str, Any]] = {}

    for tx in transactions:
        from_user = tx.get("fromUserName", "")
        to_user = tx.get("toUserName", "")
        amount = float(tx.get("amount", 0))
        desc = tx.get("description", "unknown")
        category = categories.get(desc, "Others")

        # Only count outgoing payments from the current user
        if from_user == username and to_user:
            if to_user not in recipient_data:
                recipient_data[to_user] = {
                    "recipient": to_user,
                    "total_amount": 0.0,
                    "transaction_count": 0,
                    "categories": {},
                    "descriptions": [],
                }

            entry = recipient_data[to_user]
            entry["total_amount"] += amount
            entry["transaction_count"] += 1
            entry["categories"][category] = entry["categories"].get(category, 0) + amount
            if desc not in entry["descriptions"]:
                entry["descriptions"].append(desc)

    # Sort by total amount descending and take top N
    sorted_recipients = sorted(
        recipient_data.values(),
        key=lambda r: r["total_amount"],
        reverse=True,
    )[:top_n]

    # Build final output with a human-readable "reason" for each
    result = []
    for r in sorted_recipients:
        primary_cat = (
            max(r["categories"], key=r["categories"].get) if r["categories"] else "Others"
        )
        reason = (
            f"Paid {r['total_amount']:.2f} across {r['transaction_count']} transaction(s). "
            f"Mostly for {primary_cat} ({', '.join(r['descriptions'][:3])})."
        )
        result.append({
            "recipient": r["recipient"],
            "total_amount": round(r["total_amount"], 2),
            "transaction_count": r["transaction_count"],
            "primary_category": primary_cat,
            "category_breakdown": {k: round(v, 2) for k, v in r["categories"].items()},
            "descriptions": r["descriptions"][:5],
            "reason": reason,
        })

    return result
