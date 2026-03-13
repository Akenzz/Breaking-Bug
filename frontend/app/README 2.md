# SmartPay Backend

A Spring Boot REST API for managing shared expenses, group settlements, and financial analysis. SmartPay helps users split bills, track debts, and settle payments efficiently.

## Overview

SmartPay Backend is built with:
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Spring Data JPA / Hibernate

## Prerequisites

- Java 21+
- PostgreSQL 12+
- Maven 3.6+
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/SmartPay-Backend.git
cd SmartPay-Backend
```

### 2. Configure Environment Variables

Create a `application.properties` file in `src/main/resources` or configure system environment variables:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/your_db
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password

# Server Port
server.port=8000

# Analysis API
analysis.api.url=https://Akenzz-SmartPay.hf.space/analyze-finance
```

### 3. Build and Run

**Using Maven:**

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

**Using Docker:**

```bash
docker build -t smartpay-backend .
docker run -p 8000:8000 -e SPRING_DATASOURCE_URL=... smartpay-backend
```

### 4. Verify Installation

```bash
curl http://localhost:8000/health
```

---

## API Documentation

### Base URL

```
http://localhost:8000
```

### Authentication

All endpoints except `/auth/register`, `/auth/login` and `/health` require JWT authentication.

**Header:** `Authorization: Bearer {token}`

---

## Endpoints

### Authentication

#### Register User
**POST** `/auth/register`

Create a new user account.

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "+919876543210",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Login User
**POST** `/auth/login`

Authenticate and obtain JWT token.

**Authentication:** None

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### User Management

#### Get Current User Profile
**GET** `/users/me`

Fetch authenticated user profile information.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile fetched",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phoneNumber": "+919876543210",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

#### Update UPI ID
**PUT** `/users/upi`

Update the user's UPI ID for receiving payments.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "upiId": "john.doe@upi"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "UPI ID updated successfully",
  "data": null
}
```

---

### Groups

#### Create Group
**POST** `/groups`

Create a new expense sharing group.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "name": "Apartment Expenses",
  "description": "Rent and utilities split"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "id": 1,
    "name": "Apartment Expenses",
    "description": "Rent and utilities split",
    "groupCode": "ABC123XYZ",
    "createdByName": "John Doe",
    "createdByIdentifier": "user@example.com"
  }
}
```

---

#### Get My Groups
**GET** `/groups/my`

Retrieve all groups of the authenticated user.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User groups fetched",
  "data": [
    {
      "id": 1,
      "name": "Apartment Expenses",
      "description": "Rent and utilities split",
      "groupCode": "ABC123XYZ",
      "createdByName": "John Doe",
      "createdByIdentifier": "user@example.com"
    }
  ]
}
```

---

#### Get Group Members
**GET** `/groups/{groupId}/members`

Fetch all members of a specific group.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Group members fetched",
  "data": [
    {
      "userId": 1,
      "fullName": "John Doe",
      "identifier": "user@example.com",
      "role": "ADMIN",
      "isFriend": false
    }
  ]
}
```

---

#### Add Member to Group
**POST** `/groups/{groupId}/members`

Add a user to a group by email or phone number. Only group admin can perform this action.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Query Parameters:**
- `identifier` (String): Email or phone number of user to add

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Member added successfully",
  "data": null
}
```

---

#### Join Group
**POST** `/groups/join`

Join an existing group using an invite code.

**Authentication:** Required (JWT Token)

**Query Parameters:**
- `code` (String): Group invite code

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Joined group successfully",
  "data": null
}
```

---

#### Get Group Detail
**GET** `/groups/{groupId}/detail`

Fetch detailed information about a specific group including members, expenses, and balances.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "group": {
      "id": 1,
      "name": "Trip to Goa",
      "description": "Fun times!",
      "groupCode": "XYZ789",
      "createdByName": "Alice",
      "createdByIdentifier": "alice@email.com"
    },
    "currentUser": {
      "id": 1,
      "fullName": "Alice",
      "email": "alice@email.com",
      "phoneNumber": "111222333",
      "role": "USER"
    },
    "members": [
      {
        "userId": 1,
        "fullName": "Alice",
        "identifier": "alice@email.com",
        "role": "ADMIN",
        "isFriend": false
      },
      {
        "userId": 2,
        "fullName": "Bob",
        "identifier": "bob@email.com",
        "role": "MEMBER",
        "isFriend": true
      }
    ],
    "transactions": [
      {
        "type": "EXPENSE",
        "amount": 1000.00,
        "description": "Flights",
        "createdAt": "2026-03-08T10:00:00Z",
        "fromUserId": 1,
        "fromUserName": "Alice",
        "toUserId": 1,
        "toUserName": "Alice",
        "perspective": "SPENT"
      }
    ],
    "balances": [
      {
        "userId": 1,
        "fullName": "Alice",
        "netBalance": 500.00
      },
      {
        "userId": 2,
        "fullName": "Bob",
        "netBalance": -500.00
      }
    ],
    "myBalance": 500.00,
    "expenses": [
      {
        "id": 1,
        "description": "Flights",
        "totalAmount": 1000.00,
        "groupName": "Trip to Goa",
        "paidByName": "Alice",
        "paidByUserId": 1,
        "createdAt": "2026-03-08T10:00:00Z",
        "isCancelled": false
      }
    ]
  }
}
```

---

### Expenses

#### Create Expense
**POST** `/expenses`

Create and split a group expense.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "groupId": 1,
  "description": "Dinner",
  "amount": 1200.00,
  "splitType": "EQUAL",
  "userIds": [1, 2]
}
```
For `splitType: "EXACT"`, provide `exactSplits`:
```json
{
  "groupId": 1,
  "description": "Dinner",
  "amount": 1200.00,
  "splitType": "EXACT",
  "exactSplits": [
    { "userId": 1, "amount": 800.00 },
    { "userId": 2, "amount": 400.00 }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 1,
    "description": "Dinner",
    "totalAmount": 1200.00,
    "paidBy": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z",
    "splits": [
      {
        "userId": 1,
        "amountOwed": 600.00
      },
      {
        "userId": 2,
        "amountOwed": 600.00
      }
    ]
  }
}
```

---

#### Create Direct Split (Ad-hoc expense)
**POST** `/expenses/direct-split`

Create an expense without a pre-existing group. A temporary group is created behind the scenes. This is useful for one-off payments between users.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "description": "Movie tickets",
  "amount": 500.00,
  "payerId": 1,
  "splitType": "EQUAL",
  "userIds": [1, 2]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Direct split created",
  "data": null
}
```

---

#### Get Group Expenses
**GET** `/expenses/group/{groupId}`

Fetch all non-cancelled expenses in a group.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Group expenses fetched",
  "data": [
    {
      "id": 1,
      "description": "Dinner",
      "totalAmount": 1200.00,
      "groupName": "Apartment Expenses",
      "paidByName": "John Doe",
      "paidByUserId": 1,
      "createdAt": "2024-01-15T10:30:00Z",
      "isCancelled": false
    }
  ]
}
```

---

#### Get My Expenses in Group
**GET** `/expenses/group/{groupId}/my`

Fetch non-cancelled expenses created by the current user in a specific group.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Response (200 OK):**
(Same format as `Get Group Expenses`)

---

#### Get My Expenses
**GET** `/expenses/my`

Fetch all non-cancelled expenses created by the current user across all groups.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
(Same format as `Get Group Expenses`)

---

#### Edit Expense
**PUT** `/expenses/{expenseId}`

Modify an existing expense. This reverses the old splits and creates new ones.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `expenseId` (Long): The expense ID

**Request Body:**
```json
{
  "description": "Dinner (Updated)",
  "amount": 1500.00,
  "payerId": 1,
  "splitType": "EQUAL",
  "userIds": [1, 2]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense edited",
  "data": null
}
```

---

#### Delete Expense
**DELETE** `/expenses/{expenseId}`

Cancel and remove an expense. This will reverse the ledger entries associated with it.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `expenseId` (Long): The expense ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense cancelled",
  "data": null
}
```

---

### Friends

#### Send Friend Request
**POST** `/friends/request`

Send a friend request to another user by their email or phone number.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "identifier": "user2@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Friend request sent",
  "data": null
}
```

---

#### Accept Friend Request
**POST** `/friends/{id}/accept`

Accept a pending friend request.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `id` (Long): The friendship request ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Friend request accepted",
  "data": null
}
```

---

#### Reject Friend Request
**POST** `/friends/{id}/reject`

Reject a pending friend request.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `id` (Long): The friendship request ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Friend request rejected",
  "data": null
}
```

---

#### Get Pending Friend Requests
**GET** `/friends/pending`

Fetch all pending friend requests for the current user.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending requests",
  "data": [
    {
      "requestId": 1,
      "requesterId": 2,
      "requesterName": "Jane Smith",
      "requesterPhone": "+919876543211",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Get Friends List
**GET** `/friends`

Fetch all accepted friends of the current user.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Friends list",
  "data": [
    {
      "id": 2,
      "email": "user2@example.com",
      "fullName": "Jane Smith",
      "phoneNumber": "+919876543211"
    }
  ]
}
```

---

### Ledger & Balance Tracking

#### Get User Balance in Group
**GET** `/ledger/group/{groupId}/user/{userId}`

Fetch the balance of a specific user in a group.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID
- `userId` (Long): The user ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Balance fetched",
  "data": 500.00
}
```

---

#### Get Group Balances
**GET** `/ledger/group/{groupId}/balances`

Fetch balances of all members in a group.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Group balances fetched",
  "data": [
    {
      "userId": 1,
      "fullName": "John Doe",
      "netBalance": 500.00
    },
    {
      "userId": 2,
      "fullName": "Jane Smith",
      "netBalance": -500.00
    }
  ]
}
```

---

#### Get Group Transactions
**GET** `/ledger/group/{groupId}/transactions`

Fetch all transactions (expenses and settlements) in a group from the current user's perspective.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transactions fetched",
  "data": [
    {
      "type": "EXPENSE",
      "amount": 1200.00,
      "description": "Dinner",
      "createdAt": "2024-01-15T10:30:00Z",
      "fromUserId": 1,
      "fromUserName": "John Doe",
      "toUserId": 1,
      "toUserName": "John Doe",
      "perspective": "SPENT"
    }
  ]
}
```

---

#### Get Simplified Debts
**GET** `/ledger/group/{groupId}/simplified-debts`

Get optimized settlement plan (minimum transactions needed).

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `groupId` (Long): The group ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Simplified debts",
  "data": [
    {
      "fromUserId": 2,
      "fromUserName": "Jane Smith",
      "toUserId": 1,
      "toUserName": "John Doe",
      "amount": 300.00
    }
  ]
}
```

---

#### Get My Transactions
**GET** `/ledger/my-transactions`

Fetch all transactions involving the current user across all groups.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
(Same format as `Get Group Transactions`)

---

#### Who Owes Me
**GET** `/ledger/who-owes-me`

Get a summary of all users who owe money to the current user across all groups.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "People who owe me",
  "data": [
    {
      "userId": 2,
      "userName": "Jane Smith",
      "amount": 500.00
    }
  ]
}
```

---

#### Whom I Owe
**GET** `/ledger/whom-i-owe`

Get a summary of all users to whom the current user owes money.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "People I owe",
  "data": [
    {
      "userId": 3,
      "userName": "Bob Johnson",
      "amount": 800.00
    }
  ]
}
```

---

### Settlements

This workflow allows users to settle debts outside of group expenses.

1.  **Initiate**: A user starts a settlement, specifying who they are paying.
2.  **Claim Paid**: The payer marks the settlement as paid.
3.  **Confirm/Dispute**: The payee confirms they received the payment or disputes it.

#### Initiate Settlement
**POST** `/settlements/initiate`

Start a payment settlement between two users. Generates a UPI deep link if the receiver has a UPI ID.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "groupId": 1,
  "fromUserId": 1,
  "toUserId": 2,
  "amount": 500.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settlement initiated",
  "data": {
    "settlementId": 1,
    "amount": 500.00,
    "upiLink": "upi://pay?pa=jane@upi&pn=Jane%20Smith...",
    "upiAvailable": true
  }
}
```

---

#### Claim Settlement as Paid
**POST** `/settlements/{settlementId}/claim`

The payer claims they have completed the payment. This moves the settlement to `PENDING_CONFIRMATION`.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `settlementId` (Long): The settlement ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settlement claimed as paid",
  "data": null
}
```

---

#### Confirm Settlement
**POST** `/settlements/{settlementId}/confirm`

The payee confirms they have received the payment. This completes the settlement and creates reversing ledger entries.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `settlementId` (Long): The settlement ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settlement completed",
  "data": null
}
```

---

#### Dispute Settlement
**POST** `/settlements/{settlementId}/dispute`

The payee disputes the payment claim. This moves the settlement to a `DISPUTED` state for manual resolution.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `settlementId` (Long): The settlement ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settlement disputed",
  "data": null
}
```

---

#### Get Pending Confirmations (for Payee)
**GET** `/settlements/pending-confirmations`

Fetches settlements that are awaiting the current user's confirmation as the payee.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending confirmations",
  "data": [
    {
      "id": 1,
      "group": { ... },
      "fromUser": { ... },
      "toUser": { ... },
      "amount": 500.00,
      "status": "PENDING_CONFIRMATION",
      "createdAt": "2024-01-16T11:00:00Z",
      "paymentReference": null
    }
  ]
}
```

---

### P2P Transfers

This workflow is for direct peer-to-peer payments, independent of any groups or expenses. It requires the receiver to have a UPI ID configured.

#### Initiate Transfer
**POST** `/transfers/initiate`

Initiates a P2P transfer, generating a UPI link for the sender to use.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "toUserId": 2,
  "amount": 100.00,
  "note": "For lunch"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transfer initiated",
  "data": {
    "transferId": 1,
    "upiLink": "upi://pay?pa=jane@upi&pn=Jane%20Smith...",
    "amount": 100.00,
    "toUserName": "Jane Smith",
    "toUpiId": "jane@upi",
    "status": "INITIATED"
  }
}
```

---

#### Claim Transfer as Sent
**POST** `/transfers/{transferId}/claim`

The sender claims they have sent the money.

**Authentication:** Required (JWT Token)

**Response (200 OK):** `{"success": true, "message": "Transfer claimed as sent"}`

---

#### Confirm Transfer Received
**POST** `/transfers/{transferId}/confirm`

The receiver confirms they have received the money. This creates ledger entries to reflect the transfer and can auto-offset existing debts between the two users.

**Authentication:** Required (JWT Token)

**Response (200 OK):** `{"success": true, "message": "Transfer confirmed"}`

---

#### Dispute Transfer
**POST** `/transfers/{transferId}/dispute`

The receiver disputes the sender's claim.

**Authentication:** Required (JWT Token)

**Response (200 OK):** `{"success": true, "message": "Transfer disputed"}`

---

#### Get My Pending Confirmations (Transfers)
**GET** `/transfers/pending-confirmations`

Fetches P2P transfers awaiting the current user's confirmation as the receiver.

**Authentication:** Required (JWT Token)

---

#### Get My Transfers
**GET** `/transfers/my`

Fetches a history of all P2P transfers involving the current user (both sent and received).

**Authentication:** Required (JWT Token)

---

### Dashboard & Analytics

#### Get Dashboard Summary
**GET** `/dashboard/summary`

DEPRECATED. Use `/dashboard/summary-detail` instead. Fetches the user's total balance.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard summary fetched",
  "data": {
    "totalBalance": -84675.74
  }
}
```

---

#### Get Dashboard Chart Data
**GET** `/dashboard/chart`

Fetch chart data for expense and income over the last 7 days.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "labels": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "income": [0, 100, 0, 50, 0, 200, 0],
    "expense": [50, 25, 70, 0, 150, 0, 90]
  }
}
```

---

#### Get Dashboard Summary Detail
**GET** `/dashboard/summary-detail`

Fetch comprehensive dashboard summary with detailed breakdowns.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "balance": {
      "total": -84675.74,
      "changePercent": null,
      "monthlySpent": 92175.74,
      "monthlyLimit": null
    },
    "pendingRequests": [
      {
        "id": 3,
        "name": "Akenzz",
        "description": "You owe money",
        "amount": 2500.00,
        "type": "YOU_OWE",
        "dueDate": null
      }
    ],
    "recentActivity": [
      {
        "id": 1,
        "description": "Hack-Nocturne 2.0",
        "amount": 1428.57,
        "type": "EXPENSE",
        "createdAt": "2026-03-07T15:19:38.467973",
        "fromUserName": "Tester",
        "toUserName": "Berry"
      }
    ],
    "summary": {
      "totalBalance": -84675.74,
      "totalOwes": 92175.74,
      "totalIsOwed": 7500.00,
      "groupCount": 1,
      "friendCount": 0
    },
    "expenseBreakdown": {
      "thisMonth": 92175.74,
      "lastMonth": 0,
      "trend": "UP",
      "percentageChange": 0
    }
  }
}
```

---

### Financial Analysis

#### Get My Financial Analysis
**GET** `/analysis/me`

Fetch detailed financial analysis and insights for the current user, generated daily based on the last 7 days of transactions. The response is a direct pass-through from an AI service.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Analysis fetched",
  "data": {
     "insights": "You've spent a lot on food this week.",
     "recommendations": "Consider cooking at home more often.",
     "spending_breakdown": {
        "Food": "70%",
        "Travel": "20%",
        "Other": "10%"
     }
  }
}
```

---

### Personal Expenses

#### Create Personal Expense
**POST** `/personal-expenses`

Record a personal (non-shared) expense.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "description": "Groceries",
  "amount": 1200.00,
  "category": "Food",
  "note": "Weekly groceries from market",
  "expenseDate": "2024-01-15T10:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Personal expense recorded",
  "data": {
    "id": 1,
    "user": { ... },
    "description": "Groceries",
    "amount": 1200.00,
    "category": "Food",
    "note": "Weekly groceries from market",
    "expenseDate": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Get My Personal Expenses
**GET** `/personal-expenses/my`

Fetch all personal expenses of the current user.

**Authentication:** Required (JWT Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Personal expenses fetched",
  "data": [
    {
      "id": 1,
      "description": "Groceries",
      "amount": 1200.00,
      "category": "Food",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Health Check

#### Health Status
**GET** `/health`

Check API server health and status.

**Authentication:** None

**Response (200 OK):**
```
SmartPay Core Backend Running
Last Updated on : 8th March at 16:00
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |
---
**Last Updated**: March 2026
**API Version**: 1.1.0
