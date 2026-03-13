# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

The repository root contains configuration/documentation. The Flutter app lives in `frontend/`:

```
smartpay/
├── frontend/          ← Flutter app (all flutter commands run here)
│   ├── lib/
│   ├── test/
│   └── pubspec.yaml
└── SMARTPAY_DOCUMENTATION.md   ← Full scrape of the reference web app
```

## Commands

All commands must be run from the `frontend/` directory:

```bash
cd frontend

flutter pub get          # install dependencies
flutter run              # run on connected device / emulator
flutter run -d chrome    # run as web app
flutter analyze          # static analysis (dart analyze also works)
flutter test             # run all tests
flutter test test/widget_test.dart   # run a single test file
flutter build apk        # Android release build
flutter build ios        # iOS release build
flutter build web        # Web release build
```

## What Is Being Built

A Flutter mobile/web app that replicates the SmartPay group expense management platform. Full reference documentation (every page, all data, screenshots) is in `SMARTPAY_DOCUMENTATION.md` at the repo root.

### Pages & Routes (from the reference app)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/phone + password auth |
| Dashboard | `/dashboard` | Financial snapshot, quick actions, money flow chart |
| Analysis | `/analysis` | AI financial health score, category breakdown, insights |
| Profile | `/profile` | User info, UPI ID, sign out |
| Pay | `/pay` | UPI QR scanner |
| Split Bill | `/split` | Multi-select friends to split with |
| Groups | `/groups` | Group listing, create/join groups |
| Settle Up | `/settle` | Tabbed owed-me / I-owe balances |
| Bills | `/bills` | Drag-and-drop bill image OCR |
| Friends | `/friends` | Friend list + add friend, requests tab |
| Transactions | `/transactions` | Full searchable transaction history |

### Design Tokens (from reference screenshots)
- **Primary accent:** ~`#00C896` (green)
- **Danger/expense:** red
- **Background:** white / light grey cards
- **Dark mode:** fully supported — dark backgrounds, same accents
- **Typography:** clean sans-serif with clear hierarchy
- **Mobile nav:** bottom navigation bar (Dashboard · Analysis tabs)
- **Desktop/tablet nav:** left icon sidebar

## Current State

`frontend/lib/main.dart` is still the default Flutter counter template. No architecture, packages, or screens have been added yet. The app is a blank slate ready for implementation.

## Architecture Guidance

When implementing, prefer:
- **go_router** for declarative routing (matches the URL-based route structure above)
- **Riverpod** or **BLoC** for state management
- Feature-based folder structure under `lib/`:
  ```
  lib/
  ├── main.dart
  ├── app/              # MaterialApp, router, theme
  ├── features/
  │   ├── auth/
  │   ├── dashboard/
  │   ├── analysis/
  │   └── ...
  └── shared/           # widgets, models, services, utils
  ```
- The reference web app uses JWT + httpOnly cookies; the Flutter app should use secure token storage (`flutter_secure_storage`)
