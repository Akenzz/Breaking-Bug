# SmartPay — Complete Application Documentation

**URL:** https://smartpay-now.vercel.app
**Account Used:** email1@test.com (username: beru, User ID: #8)
**Scraped:** 2026-03-13
**Screenshots:** 46 total, saved to `/tmp/smartpay-scrape/`

---

## Overview

SmartPay is an AI-powered group expense management web app built with Next.js. It supports shared expense tracking, bill splitting, UPI payments, group settlements, and AI-driven financial analysis.

**Tech Stack:** Next.js (App Router), JWT auth via httpOnly cookies, UPI payment integration

---

## Authentication

### Login Page — `/login`

- **Layout:** Two-column card — left panel is marketing copy, right panel is the form
- **Left panel:** "Group trips, made easy." tagline · "Track every penny, settle in one tap." · Security badges (Encrypted in transit · httpOnly cookies)
- **Form fields:**
  - `EMAIL / PHONE NUMBER` — accepts email or phone number
  - `PASSWORD` — masked field with toggle visibility button
- **CTA:** `Sign In →` button (black, full-width)
- **Footer link:** "Don't have an account? **Create one**" → `/signup`
- **Auth mechanism:** JWT tokens stored in httpOnly cookies

---

## Navigation

### Desktop Sidebar (collapsed icon rail)
| Icon | Label | Route |
|------|-------|-------|
| Grid | Dashboard | `/dashboard` |
| Bar chart | Analysis | `/analysis` |
| Person | Account | `/profile` |
| Moon | Dark Mode toggle | — |

### Quick Actions Bar (on Dashboard)
| Action | Route |
|--------|-------|
| Pay | `/pay` |
| Split Bill | `/split` |
| Groups | `/groups` |
| Settle Up | `/settle` |
| Bills | `/bills` |
| Friends | `/friends` |
| History | `/transactions` |

---

## Pages

### 1. Dashboard — `/dashboard`

**Heading:** "Dashboard Overview" — "Good afternoon, beru. Here's your financial snapshot."

#### Stats Cards (row of 4)
| Card | Value |
|------|-------|
| Friends | 4 |
| Groups | 1 |
| Total Owed To You | ₹91,745.50 |
| Total You Owe | ₹65,040.99 |

#### Net Balance Card
- **Net Balance:** ₹26,704.51 (green)
- Sub-rows: You owe ₹65,040.99 (red) · Owed to you ₹91,745.50 (green) · Monthly spent ₹65,040.99

#### Monthly Spending Card
- **₹65,040.99** — "Spending increased vs. last month" (red alert)

#### Money Flow Chart
- Line chart — last 7 days income vs expense
- Income: ₹4 | Expense: ₹62,374.32

#### Recent Activity (5 latest entries)
| Description | Parties | Amount | When |
|-------------|---------|--------|------|
| Bill: Navratna Veg Treat | beru → Akenzz | ₹78.57 | 2 days ago |
| Bill: Nwkrtc | beru → Akenzz | ₹47.75 | 2 days ago |
| 6 lolipops | beru → Akenzz | ₹8.57 | 2 days ago |
| food 45thj | beru → Gandu | ₹300 | 4 days ago |
| lunch sunday | beru → Gandu | ₹142.86 | 5 days ago |

#### Pending Requests (7 pending)
**Owed To You:**
| Person | Amount |
|--------|--------|
| Sudhanva Kulkarni | ₹30,580.50 |
| Akenzz | ₹30,584.50 |
| Tester | ₹30,580.50 |

**You Owe:**
| Person | Amount |
|--------|--------|
| Akenzz | ₹60,142.89 |
| Gandu | ₹969.53 |
| Berry | ₹1,428.57 |
| Tester | ₹2,500.00 |

---

### 2. Analysis — `/analysis`

**Heading:** "Financial Analysis" — "AI-powered insights into your spending behaviour"
**Action button:** Refresh

#### Financial Health Score
- **Score: 47 / 100** — Grade: "NEEDS IMPROVEMENT — FAIR"
- **Score Breakdown:**

| Metric | Score |
|--------|-------|
| Consistency (How regularly you transact) | 0/30 |
| Spike Control (Avoidance of sudden large spends) | 15/25 |
| Category Diversity (Spread across spending categories) | 12/25 |
| Anomaly Penalty (Deduction for anomalous transactions) | 20/20 |

#### Summary Stats (6-card row)
| Metric | Value |
|--------|-------|
| Total Spending | ₹64,906.1 |
| Total Income | ₹91,745.5 |
| Net Cash Flow | +₹26,839.4 |
| Avg Transaction | ₹6,490.61 (σ ₹17,852.8) |
| Transactions | 17 |
| In / Out | 7 / 10 |

#### Spending by Category (donut chart)
| Category | % | Amount |
|----------|---|--------|
| Others | 96.3% | ₹62,500 |
| Entertainment | 2.2% | ₹1,429 |
| Food | 1.5% | ₹978 |

#### Top Recipients
| Rank | Person | Category | Amount | Txns |
|------|--------|----------|--------|------|
| 1 | Akenzz | Others | ₹60,008 | 3 |
| 2 | Tester | Others | ₹2,500 | 1 |
| 3 | Berry | Entertainment | ₹1,429 | 1 |
| 4 | Gandu | Food | ₹970 | 5 |

#### Spending Prediction
- **Model:** linear_regression
- **Predicted Next:** ₹0 (decreasing trend)
- **Recent Avg:** ₹140 · Data Points: 10 · Confidence: 10.0% (Low R²)

#### Anomaly Detection
- Skipped — requires minimum 25 transactions (currently 17, needs 8 more)

#### AI Insights (5 observations)
1. "Others" category is 96.3% of total outgoing — recommends reclassifying
2. Strong positive net cash flow (+₹26,839.40) — recommends directing surplus to savings
3. Despite positive cash flow, score of 47/100 — review broader financial picture
4. Food (₹977.53) and Entertainment (₹1,428.57) are the only other tracked categories
5. Analysis covers only 3 days — recommends longer history for better insights

---

### 3. Profile / Account — `/profile`

| Field | Value |
|-------|-------|
| Display Name | beru |
| Role | User |
| Email | email1@test.com |
| Phone Number | 4494984494 |
| User ID | #8 |
| UPI ID | Not set (editable via pencil icon) |

- **UPI ID prompt:** "Thanks for providing your UPI ID it makes payments faster and easier for everyone!"
- **Sign Out button** (red bordered)
- Footer: "Secure session · httpOnly cookie · JWT token"

---

### 4. Pay — `/pay`

- Displays a **QR Code scanner** (camera-based)
- On headless/permission-denied: "Camera access denied or unavailable."
- UPI payment flow — scan to pay

---

### 5. Split Bill — `/split`

**Heading:** "Split Expense" — "Who are you splitting with?"

- **Search field:** "Search friends..."
- **Friends list** (checkboxes for multi-select):

| Name | Phone | Email |
|------|-------|-------|
| Gandu | 7619562239 | GanduGyaani@gmail.com |
| Akenzz | 8073561046 | kiniamogh91@gmail.com |
| Tester | 1234567890 | tester@mail.com |
| Berry | 0123456789 | shivayveer6@gmail.com |

---

### 6. Groups — `/groups`

**Heading:** "Groups" — "Manage your expense groups"
**Action buttons:** `Join Group` · `Create Group`
**Search field:** "Search by name, description, or creator..."

#### Current Groups (1)
| Group | Creator | Description |
|-------|---------|-------------|
| MassTI | Tester | GGW |

---

### 7. Settle Up — `/settle`

**Heading:** "Settle Up" — "Manage your balances & payments"

#### Summary
| | Amount |
|--|--------|
| Owed To You | ₹91,745.50 |
| You Owe | ₹65,040.99 |

#### Tabs
- **Owes Me (3)** — people who owe you money
- **I Owe (4)** — people you owe

#### "Owes Me" Tab
| Person | Amount |
|--------|--------|
| Sudhanva Kulkarni | +₹30,580.50 |
| Akenzz | +₹30,584.50 |
| Tester | +₹30,580.50 |

---

### 8. Bills — `/bills`

**Heading:** "Upload Bills" — "AI-powered expense organizer"

- **File upload area:** Drag-and-drop zone — "Drop your bills here or browse"
- **Accepted formats:** JPEG, PNG, BMP, WebP · up to 10MB each
- AI automatically extracts and categorizes expenses from bill images

---

### 9. Friends — `/friends`

**Heading:** "Friends" — "Manage your friends and requests"
**Action button:** `Add Friend` (green)
**Tabs:** Friends (4) · Requests (0)
**Search field:** "Search friends..."

#### Friends List
| Name | Email | Phone | Joined |
|------|-------|-------|--------|
| Gandu | GanduGyaani@gmail.com | 7619562239 | Invalid Date* |
| Akenzz | kiniamogh91@gmail.com | 8073561046 | Invalid Date* |
| Tester | tester@mail.com | 1234567890 | Invalid Date* |
| Berry | shivayveer6@gmail.com | 0123456789 | Invalid Date* |

> *Bug: "Joined Invalid Date" — date parsing issue in the frontend

---

### 10. Transactions — `/transactions`

**Heading:** "Transactions" — "All your expense activity in one place"
**Search field:** "Search by description, person, or type…"

#### Summary
| Metric | Value |
|--------|-------|
| Total Records | 14 |
| You Paid | ₹1,87,358.99 |
| You Received | ₹1,22,322.00 |

#### All 14 Transactions
| Description | To | Date | Amount | Type |
|-------------|-----|------|--------|------|
| Bill: Navratna Veg Treat | Akenzz | 10 Mar 2026, 9:00 pm | −₹78.57 | EXPENSE |
| Bill: Nwkrtc | Akenzz | 10 Mar 2026, 8:55 pm | −₹47.75 | EXPENSE |
| 6 lolipops | Akenzz | 10 Mar 2026, 8:52 pm | −₹8.57 | EXPENSE |
| food 45thj | Gandu | 08 Mar 2026, 12:40 pm | −₹300.00 | EXPENSE |
| lunch sunday | Gandu | 08 Mar 2026, 12:18 pm | −₹142.86 | EXPENSE |
| choki-choki | Akenzz | 08 Mar 2026, 10:04 am | −₹4.00 | EXPENSE |
| Dinner At Vikings | Gandu | 07 Mar 2026, 10:30 pm | −₹250.00 | EXPENSE |
| Old Monk | Gandu | 07 Mar 2026, 10:28 pm | −₹110.00 | EXPENSE |
| Hack-Nocturne 2.0 | Berry | 07 Mar 2026, 3:19 pm | −₹1,428.57 | EXPENSE |
| mera college fees | Akenzz | 07 Mar 2026, 3:10 pm | −₹60,000.00 | EXPENSE |
| Aaj raat ka dinner | Gandu | 06 Mar 2026, 9:07 pm | −₹166.67 | EXPENSE |
| testing for Main page | beru | 06 Mar 2026, 7:16 pm | −₹10,000.00 | EXPENSE |
| food on 23rd | beru | 06 Mar 2026, 6:39 pm | −₹1,12,322.00 | EXPENSE |
| I-ran-ian funds | Tester | 06 Mar 2026, 8:23 am | −₹2,500.00 | EXPENSE |

---

## UI/UX Observations

### Design System
- **Color scheme:** Clean white/light grey backgrounds · Green accents (#00C896 approx.) · Red for debts/expenses · Black CTAs
- **Typography:** Modern sans-serif, consistent hierarchy
- **Dark mode:** Full dark theme available via sidebar toggle (dark backgrounds, same green/red accents)
- **Icons:** Custom icon set used throughout quick actions

### Responsive Design
- **Desktop (1440px):** Collapsed icon sidebar + full content area
- **Dark mode desktop:** Full sidebar with labels expanded
- **Mobile (390px):** Bottom navigation bar (Dashboard · Analysis) + stacked cards layout

### Known Bugs / Issues
1. **"Joined Invalid Date"** on Friends cards — date parsing error
2. **Pay page** shows camera-only flow — no manual UPI ID input fallback visible
3. **Landing page** throws a client-side exception error (JS bundle issue)

### Routes Summary
| Route | Status | Description |
|-------|--------|-------------|
| `/` | Error | Landing page (JS exception) |
| `/login` | ✅ | Authentication |
| `/signup` | Not tested | Registration |
| `/dashboard` | ✅ | Main overview |
| `/analysis` | ✅ | AI financial analysis |
| `/profile` | ✅ | User account |
| `/pay` | ✅ | UPI QR scanner |
| `/split` | ✅ | Split expense with friends |
| `/groups` | ✅ | Group management |
| `/settle` | ✅ | Settlement tracking |
| `/bills` | ✅ | AI bill upload/OCR |
| `/friends` | ✅ | Friend management |
| `/transactions` | ✅ | Full transaction history |

---

## Screenshots Index

All screenshots saved to `/tmp/smartpay-scrape/`

| File | Description |
|------|-------------|
| `02-login.png` | Login page |
| `auth-login-filled.png` | Login form with credentials |
| `auth-success.png` | Post-login redirect |
| `page-dashboard.png` | Dashboard (full page) |
| `dashboard-dark-mode.png` | Dashboard in dark mode |
| `dashboard-top/mid/bottom.png` | Dashboard scroll sections |
| `page-analysis.png` | Analysis page |
| `page-profile.png` | Profile page |
| `page-pay.png` | Pay / QR scanner |
| `page-split.png` | Split bill page |
| `page-groups.png` | Groups listing |
| `page-settle.png` | Settle up page |
| `page-bills.png` | Bills upload page |
| `page-friends.png` | Friends page |
| `page-transactions.png` | Transaction history |
| `mobile-*.png` | Mobile (390px) views |
| `*-viewport.png` | Viewport-only screenshots |
