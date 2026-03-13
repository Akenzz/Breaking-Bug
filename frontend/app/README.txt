# SmartPay Flutter App

A Flutter implementation of the SmartPay group expense management platform.

## Features Implemented

- **Authentication:** Login screen with form validation (mock).
- **Dashboard:** Financial snapshot, stats cards, and quick actions.
- **Analysis:** AI financial health score and spending breakdown.
- **Profile:** User info and secure session indicators.
- **Transactions:** Searchable transaction history.
- **Navigation:** Bottom navigation bar and declarative routing with `go_router`.
- **State Management:** Set up with `Riverpod`.
- **Theming:** Modern design with `#00C896` primary accent and Google Fonts (Inter).

## Project Structure

```
lib/
├── app/              # Global app config, router, and theme
├── features/         # Feature-based screens and logic
│   ├── auth/         # Login
│   ├── dashboard/    # Main overview
│   ├── analysis/     # Financial insights
│   ├── profile/      # User account
│   └── transactions/ # History
└── shared/           # Reusable widgets and utilities
```

## Running the App

1. Ensure you have Flutter installed.
2. Install dependencies:
   ```bash
   flutter pub get
   ```
3. Run the app:
   ```bash
   flutter run
   ```

## Design Tokens
- **Primary:** `#00C896` (Green)
- **Background:** `#F8F9FA` (Light Grey)
- **Secondary:** Black
- **Typography:** Inter (Google Fonts)
