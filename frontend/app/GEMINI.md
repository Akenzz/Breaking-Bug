# SmartPay - Detailed Project Context & Engineering Standards

## Project Overview
SmartPay is a high-fidelity Flutter implementation of a group expense management platform. It integrates a Spring Boot backend with specialized AI engines for bill parsing, financial health analysis, and real-time fraud risk detection.

## Architecture & Tech Stack

### Core Frameworks
*   **Flutter (SDK ^3.10.0):** Targets Android, iOS, and Web.
*   **Riverpod (^3.3.1):** Centralized state management using `FutureProvider` for data fetching and `NotifierProvider` for auth state.
*   **go_router (^17.1.0):** Declarative routing with deep linking support and global auth guards.
*   **HTTP (^1.6.0):** Standard networking with a custom service layer for JWT management.

### AI & External Integrations
*   **Hugging Face Core:** AI services hosted at `akenzz-smartpay.hf.space`.
*   **Mobile Scanner (^7.2.0):** QR code detection for UPI payments.
*   **Image Picker (^1.2.1):** Bill capture for AI OCR.
*   **FL Chart (^1.1.1):** Complex financial data visualization.

---

## Directory Structure Detail

### `/lib/app/`
*   `app.dart`: The root `MaterialApp.router`. Defines the high-level `ThemeData` (Material 3, Space Grotesk font).
*   `router.dart`: Centralized `GoRouter` config. Includes a `MainShell` for persistent bottom navigation and a redirect logic that guards private routes against unauthenticated users.

### `/lib/features/` (Modular Domain Logic)
*   **`auth/`**: `LoginScreen` and `SignUpScreen`. Implements JWT-based flows.
*   **`dashboard/`**: The landing hub. Displays `NetBalanceCard`, `MoneyFlowChart` (LineChart), and `RecentActivityList`.
*   **`analysis/`**: AI financial dashboard. Displays `HealthScoreCard` (circular progress), `CategoryChartCard` (donut), and `TopRecipients`.
*   **`groups/`**: Complex group logic. `GroupDetailScreen` uses a 4-tab layout: Transactions, Expenses, Balances, and Members.
*   **`pay/`**: QR Scanner logic. Processes `upi://pay` URIs, performs AI risk evaluation, and triggers `url_launcher` for external UPI apps.
*   **`payments/`**: Hub for P2P transfers, pending confirmations, and transfer history.
*   **`settle/`**: Debt management UI. Split between "Owes Me" and "I Owe" categories.
*   **`split/`**: Two-step wizard for ad-hoc bill splitting (Equal vs. Exact).

### `/lib/shared/`
*   `models/app_models.dart`: Strict data structures including `FinanceAnalysis`, `FraudRiskResponse`, and `GroupDetail`.
*   `services/api_service.dart`: The primary HTTP client. Handles multipart uploads (`postMultipart`) and injects the `Authorization: Bearer` token from `flutter_secure_storage`.
*   `services/providers.dart`: The central repository of all Riverpod providers (`userProfileProvider`, `groupsProvider`, `analysisProvider`, etc.).
*   `utils/api_config.dart`: Single source of truth for all backend and AI URLs.

---

## Engineering Standards

### Networking & Security
1.  **JWT Handling:** All tokens must be stored in `FlutterSecureStorage`. Never use `SharedPreferences` for auth tokens.
2.  **Auth Guards:** Protected routes must be wrapped in the `GoRouter` redirect logic.
3.  **Multipart Uploads:** When scanning bills, use `ApiService.postMultipart` to ensure correct `MediaType` and `http.ByteStream` handling.

### UI & Styling
*   **Primary Accent:** `#00C896` (Green).
*   **Typography:** `Space Grotesk` (Google Fonts) for all headings and body text.
*   **Components:** Prefer `Card` widgets with elevation 0 and radius 16 for consistency.
*   **Icons:** Use `LucideIcons` exclusively.
*   **Color Logic:**
    *   Positive Balance/Income: `#00C896`
    *   Debt/Expense: `Colors.red` or `#FF5252`
    *   Neutrals: `#0A0A0A` (Black), `#F2F7F5` (Scaffold Background)

### State Management Patterns
*   **Data Fetching:** Use `FutureProvider` for any API GET requests. Invalidate these providers (e.g., `ref.invalidate(groupsProvider)`) after mutations.
*   **Refreshes:** Every list-based screen must implement `RefreshIndicator`.
*   **Loading/Error States:** Always handle `.when(data, loading, error)` for providers to prevent UI crashes.

---

## Data Model Reference

| Model | Purpose |
|-------|---------|
| `GroupDetail` | Aggregated group state: members, txns, balances, and expenses. |
| `Transaction` | General record of money flow (EXPENSE or SETTLEMENT). |
| `FinanceAnalysis` | AI-generated score, grade, breakdown, and prediction. |
| `FraudRiskResponse` | AI risk score (0-1), risk level (SAFE/LOW/MED/HIGH), and blocking status. |
| `ParsedBill` | AI-extracted merchant, date, total, and individual line items. |

---

## Key Business Workflows

### 1. The UPI Payment Flow
1. `MobileScanner` detects QR.
2. `PayScreen._processUpiUri` parses URI.
3. `_evaluateRisk` calls the Hugging Face AI with sender/receiver stats.
4. If `risk.isBlocked`, user is warned via a detailed analysis modal.
5. If safe (or user overrides), `url_launcher` invokes the native UPI intent.
6. User confirms payment in-app; `recordPayment` syncs with backend.

### 2. The Group Expense Flow
1. User clicks "Add Expense" in `GroupDetailScreen`.
2. Optional "Scan Bill" uses AI to pre-fill merchant and amount.
3. User selects members and split type (EQUAL/EXACT).
4. `POST /expenses` creates the ledger entries.
5. `ref.invalidate(groupDetailProvider)` triggers a reactive UI update.
