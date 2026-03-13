# SmartPay Flutter App — Design Spec

**Date:** 2026-03-13
**Platform:** Android (mobile-first Flutter)
**Backend:** https://smartpay-ivwr.onrender.com/
**AI Endpoints:** TBD (provided later)

---

## Overview

Full-featured Flutter Android app replicating the SmartPay group expense management platform. All screens wired to the real Spring Boot REST API. AI-powered screens (Analysis, Bills) stubbed until AI endpoints are provided.

---

## Architecture

### State Management
**Riverpod** — `AsyncNotifierProvider` per feature for data fetching and mutation.

### Routing
**go_router** with a top-level redirect guard:
- Unauthenticated → `/login`
- Authenticated + on `/login` or `/signup` → `/dashboard`

### Auth
- `POST /auth/login` and `POST /auth/register` return JWT
- JWT stored in `flutter_secure_storage`
- Dio interceptor attaches `Authorization: Bearer <token>` on all requests
- 403 response → clear token → redirect to `/login`

### HTTP
**Dio** client with base URL `https://smartpay-ivwr.onrender.com/`, auth interceptor, error handling.

---

## Folder Structure

```
lib/
├── main.dart
├── app/
│   ├── router.dart
│   └── theme.dart
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── friends/
│   ├── groups/
│   ├── split/
│   ├── settle/
│   ├── transactions/
│   ├── analysis/        # stubbed
│   ├── bills/           # upload UI stubbed
│   ├── pay/
│   └── profile/
└── shared/
    ├── models/
    ├── services/
    │   ├── api_client.dart
    │   └── auth_service.dart
    └── widgets/
```

---

## Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `go_router` | ^14.x | Routing |
| `flutter_riverpod` | ^2.x | State management |
| `riverpod_annotation` | ^2.x | Code gen for providers |
| `dio` | ^5.x | HTTP client |
| `flutter_secure_storage` | ^9.x | JWT storage |
| `fl_chart` | ^0.69.x | Line/donut charts |
| `mobile_scanner` | ^5.x | QR scanner |
| `image_picker` | ^1.x | Bill image upload |

---

## Routes

| Route | Screen | Auth Required |
|-------|--------|---------------|
| `/` | Redirect → `/login` or `/dashboard` | — |
| `/login` | Login | No |
| `/signup` | Sign Up | No |
| `/dashboard` | Dashboard | Yes |
| `/friends` | Friends | Yes |
| `/groups` | Groups | Yes |
| `/groups/:id` | Group Detail | Yes |
| `/split` | Split Expense | Yes |
| `/settle` | Settle Up | Yes |
| `/transactions` | Transactions | Yes |
| `/analysis` | Analysis (stub) | Yes |
| `/bills` | Bills (stub) | Yes |
| `/pay` | Pay / QR | Yes |
| `/profile` | Profile | Yes |

---

## API Endpoints Used

### Auth
- `POST /auth/login` — `{ emailOrPhone, password }` → JWT
- `POST /auth/register` — `{ fullName, email, phone, password }` → JWT

### Dashboard
- `GET /users/me`
- `GET /dashboard/chart`
- `GET /dashboard/summary-detail`

### Friends
- `GET /friends`
- `GET /friends/pending`
- `POST /friends/request` — `{ emailOrPhone }`
- `POST /friends/{id}/accept`
- `POST /friends/{id}/reject`

### Groups
- `GET /groups/my`
- `POST /groups` — `{ name, description }`
- `POST /groups/join?code=`
- `GET /groups/{groupId}/detail`

### Split
- `POST /expenses/direct-split`

### Settle
- `GET /ledger/who-owes-me`
- `GET /ledger/whom-i-owe`
- `POST /settlements/initiate`
- `POST /settlements/confirm`

### Transactions
- `GET /ledger/my-transactions`

### Profile
- `GET /users/me`

### Analysis (TBD)
- `GET /analysis/me`

### Bills (TBD)
- `POST /parse-bills` (AI service)

---

## Design Tokens

- **Primary accent:** `#00C896` (green)
- **Danger/expense:** `Colors.red`
- **Background:** white / `#F5F5F5` cards
- **Dark mode:** full support
- **Bottom nav:** Dashboard · Analysis · Profile
- **Typography:** clean sans-serif, Material 3

---

## Navigation

Bottom navigation bar with 3 persistent tabs:
- Dashboard
- Analysis
- Profile

Other screens (Friends, Groups, Split, Settle, Transactions, Pay, Bills) are pushed as full routes from Dashboard quick actions.

---

## Screens In Scope

| Screen | Full / Stub |
|--------|-------------|
| Login | Full |
| Signup | Full |
| Dashboard | Full |
| Friends | Full |
| Groups | Full |
| Group Detail | Full |
| Split Expense | Full |
| Settle Up | Full |
| Transactions | Full |
| Profile | Full |
| Pay (QR) | Full |
| Analysis | Stub — "AI insights coming soon" |
| Bills | Stub — upload UI, no processing |
