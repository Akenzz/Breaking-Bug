# Fraud Detection Implementation Details

This document outlines how the AI-powered Fraud Detection system is implemented within the SmartPay application during the UPI QR scanning process.

## 1. Flow Overview
When a user scans a UPI QR code or manually enters a UPI ID, the application intercepts the request before passing it to the device's native UPI apps (like GPay or PhonePe). It performs a pre-flight risk evaluation against the SmartPay AI engine to determine if the transaction is safe.

The general flow is:
1. **QR Scan / ID Entry:** Extract VPA (`pa`), Payee Name (`pn`), and Amount (`am`).
2. **Amount Check:** If no amount is provided in the QR, prompt the user.
3. **Risk Evaluation:** Gather local context and transaction history, then call the `/evaluate-risk` API.
4. **Intervention:** Display an Analysis Modal based on the risk score (Safe, Low, Medium, High).
5. **Execution:** If the user proceeds (or overrides a block), launch the native UPI app.
6. **Reconciliation:** Post-payment, prompt the user to confirm completion and sync the record to the backend.

## 2. Values Passed to the Endpoint
The `_evaluateRisk` method constructs a payload containing behavioral, temporal, and historical metrics to feed the fraud detection model. 

The exact values sent to the `api.evaluateRisk` endpoint are:

| Field | Source / Calculation | Description |
|-------|----------------------|-------------|
| `amount` | User input / QR | The transaction amount in INR. |
| `hour_of_day` | `DateTime.now().hour` | Current local hour (0-23) to detect unusual late-night transfers. |
| `is_weekend` | `DateTime.now().weekday` | `1` if Saturday/Sunday, `0` otherwise. |
| `previous_connections_count` | `transactions` list | Number of previous successful transactions with this exact payee (`pn`). |
| `avg_transaction_amount_7d` | `transactions` list | Average transaction amount sent by the user over the last 7 days. If no recent transactions exist, defaults to the current `amount`. |
| `receiver_account_age_days` | *Mocked via Payee Name* | Days since the receiver registered. (e.g., 500 for stores, 15 for individuals). |
| `receiver_report_count` | *Mocked via Payee Name* | Number of times the receiver was reported. Drops to 0 if the user has transacted with them before. |
| `receiver_tx_count_24h` | *Mocked via Payee Name* | Receiver's transaction volume in the last 24 hours. |
| `receiver_unique_senders_24h` | *Mocked via Payee Name* | Number of unique senders paying this receiver in the last 24 hours (flags sudden spikes). |

> *Note: In the current frontend implementation, receiver-side statistics (account age, report count, 24h volume) are mocked using simple string matching on the Payee Name (`pn`) for demonstration purposes. In a fully integrated production environment, the backend handles the hydration of these receiver metrics based on the UPI ID.*

## 3. How the Response is Handled
The endpoint returns a JSON payload mapped to the `FraudRiskResponse` model:
- `fraudRiskScore` (double, 0.0 to 1.0)
- `riskLevel` (String: SAFE, LOW, MEDIUM, HIGH)
- `isBlocked` (boolean)
- `message` (String summary)
- `riskReasons` (List of Strings)
- `explanation` (List of features and their impact scores)

### The Risk Analysis Modal
Based on the response, the app triggers `_showRiskAnalysisModal` (a Bottom Sheet):
1. **Visual Cues:** The modal is color-coded (Green for SAFE, Blue for LOW, Orange for MEDIUM, Red for HIGH/BLOCKED).
2. **Explanations:** Displays the `message`, bullet points for `riskReasons`, and a breakdown of which features impacted the score (from `explanation`).
3. **User Action (Non-Blocked):** If `isBlocked` is false, the user sees two buttons: **"Cancel Payment"** or **"Proceed to Pay"**.
4. **User Action (Blocked):** If `isBlocked` is true, the UI strongly discourages the payment. It presents a primary **"Back to Safety"** button. The user can still bypass this via a red outline button: **"Pay Anyway (I acknowledge the risk)"**.

## 4. Post-Evaluation Action
- If the modal returns `false` (user cancelled or backed out), the state resets and the camera continues scanning.
- If the modal returns `true` (user proceeded), the app uses `url_launcher` to fire the `upi://pay?...` intent, delegating the actual financial transaction to a compliant UPI app.
- Upon returning to SmartPay, a post-payment confirmation dialog appears to manually sync the transaction to the backend (`api.recordPayment`) since UPI intents do not guarantee a programmatic callback of success.