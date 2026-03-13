"""
train_model.py — Train an XGBoost fraud-detection classifier.

1. Load transactions_data.csv
2. 80/20 stratified split
3. Train XGBClassifier
4. Print classification metrics + ROC AUC
5. Save model
6. SHAP explanation for a sample fraud transaction
"""

import sys
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, confusion_matrix,
    accuracy_score, roc_auc_score,
)
from pathlib import Path

FEATURES = [
    "amount", "hour_of_day", "is_weekend",
    "receiver_account_age_days", "receiver_report_count",
    "receiver_tx_count_24h", "receiver_unique_senders_24h",
    "previous_connections_count", "avg_transaction_amount_7d",
    "amount_deviation", "velocity_ratio", "is_first_interaction",
]

LABEL = "is_fraud"
MODEL_OUTPUT = Path(__file__).resolve().parent.parent / "xgboost_fraud_model.json"


def train() -> None:
    csv_path = Path(__file__).resolve().parent / "transactions_data.csv"
    if not csv_path.exists():
        print(f"ERROR: {csv_path} not found. Run generate_dataset.py first.")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    print(f"Dataset: {len(df)} rows | Fraud: {int(df[LABEL].sum())} | Normal: {int((df[LABEL] == 0).sum())}")

    X, y = df[FEATURES], df[LABEL]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y,
    )

    imbalance_weight = int((y_train == 0).sum()) / max(int((y_train == 1).sum()), 1)

    model = xgb.XGBClassifier(
        objective="binary:logistic",
        scale_pos_weight=imbalance_weight,
        n_estimators=500,
        max_depth=6,
        learning_rate=0.03,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42,
        verbosity=1,
    )
    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)
    print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
    print(f"\n{classification_report(y_test, y_pred, target_names=['Normal', 'Fraud'])}")
    print(f"Accuracy  : {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC AUC   : {roc_auc_score(y_test, y_proba):.4f}")

    # Feature importance
    print("\nFeature Importances:")
    for name, score in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {name:<35s} {score:.4f}  {'█' * int(score * 50)}")

    model.save_model(str(MODEL_OUTPUT))
    print(f"\nModel saved → {MODEL_OUTPUT}")

    _run_shap(model, X_test, y_test)


def _run_shap(model, X_test, y_test) -> None:
    try:
        import shap
    except ImportError:
        print("\n[SHAP] Not installed. Run: pip install shap")
        return

    print("\n" + "=" * 60)
    print("SHAP — SAMPLE FRAUD EXPLANATION")
    print("=" * 60)

    fraud_indices = y_test[y_test == 1].index.tolist()
    if not fraud_indices:
        print("  No fraud samples in test set.")
        return

    sample = X_test.loc[[fraud_indices[0]]]
    explainer = shap.Explainer(model)
    shap_values = explainer(sample)

    prob = model.predict_proba(sample)[0][1]
    print(f"\n  Fraud probability: {prob:.4f}")
    print(f"  Feature impacts:")

    for name, val in sorted(zip(FEATURES, shap_values.values.flatten()), key=lambda x: -abs(x[1])):
        sign = "+" if val > 0 else "-"
        print(f"    {sign} {name:<35s} SHAP = {val:+.4f}")


if __name__ == "__main__":
    train()
