# SmartPay AI Microservices

AI-powered microservices for SmartPay — combining **Google Gemini LLM** and **Machine Learning** for bill parsing and intelligent financial analysis.

## Features

### Bill Parser
- **Image Upload**: Accept bill/receipt images in multiple formats (JPEG, PNG, GIF, BMP, WebP)
- **AI-Powered Extraction**: Uses Google Gemini 2.5 Flash for intelligent data extraction
- **In-Memory Processing**: No temporary files — images processed entirely in memory
- **Structured Output**: Returns clean, validated JSON with merchant, date, total, items, etc.
- **Validation Layer**: Validates and normalizes all extracted data
- **Duplicate Detection**: SHA256 file hashing to detect duplicate uploads
- **Confidence Scoring**: Indicates quality/completeness of extraction

### Finance Analyzer
- **LLM-Based Category Detection**: Uses Gemini to classify transactions (NOT rule-based)
- **ML Anomaly Detection**: IsolationForest to flag unusual spending patterns
- **Financial Health Score**: 0-100 score based on consistency, spikes, diversity, and anomalies
- **Future Spending Prediction**: Moving-average model for next-transaction prediction
- **AI-Generated Insights**: Gemini-powered personalized saving suggestions and alerts

### Scam Protection
- **Community-Based Reporting**: Users can report suspicious accounts with a reason
- **Automatic Scammer Flagging**: Users with 10+ reports are automatically marked as scammers
- **Duplicate Report Prevention**: A user can only report the same person once (enforced at DB + app level)
- **Self-Report Guard**: Prevents users from reporting themselves
- **Race-Condition Safety**: Row-level locking ensures accurate counts under concurrent requests
- **Neon DB (PostgreSQL)**: Powered by Neon serverless PostgreSQL via SQLAlchemy ORM

### AI Fraud Detection
- **XGBoost ML Model**: Pre-trained gradient-boosted classifier (500 trees, depth 6) for real-time fraud scoring
- **12-Feature Risk Analysis**: 9 raw behavioral features + 3 engineered features (`amount_deviation`, `velocity_ratio`, `is_first_interaction`)
- **5 Fraud Patterns**: Detects burst, account-takeover, micro-test, social engineering, and slow-fraud scenarios
- **Business-Aware Normal Cases**: Includes business receivers (airlines, restaurants, hotels), first-time stranger payments, group settlements, and popular receivers — reducing false positives on legitimate high-value payments
- **Overlapping Feature Ranges**: Fraud and normal distributions intentionally overlap on `previous_connections_count` so the model cannot use a single feature as a hard separator
- **Risk Levels**: Responses include `HIGH`, `MEDIUM`, `LOW`, or `SAFE` classification
- **Automatic Blocking**: Transactions with fraud probability > 80% are automatically blocked
- **SHAP Explainability**: Per-prediction feature-impact explanations and human-readable risk reasons in API responses
- **ROC AUC Evaluation**: Training pipeline reports ROC AUC alongside accuracy and classification metrics
- **Standalone Predictor**: `fraud_ml/predict.py` for CLI-based inference and integration testing

## Project Structure

```
ai/
├── main.py                       # FastAPI application entry point
├── database.py                   # Neon DB (PostgreSQL) connection & session factory
├── models.py                     # SQLAlchemy ORM models (ScamReport, ScammerProfile)
├── schemas.py                    # Pydantic request/response schemas
├── services/
│   ├── __init__.py
│   ├── gemini_parser.py          # Gemini Vision API integration (bill parsing)
│   ├── finance_analyzer.py       # ML + LLM financial analysis engine
│   ├── report_service.py         # Scam reporting business logic
│   ├── fraud_service.py          # XGBoost fraud detection logic
│   ├── validator.py              # Data validation and normalization
│   └── cleaner.py                # JSON response cleaning
├── routers/
│   ├── __init__.py
│   ├── report_router.py          # Scam report API endpoints
│   └── fraud_router.py           # Fraud detection API endpoints
├── utils/
│   ├── __init__.py
│   ├── file_handler.py           # In-memory image processing
│   ├── prompt.py                 # Bill parsing prompt
│   └── finance_prompts.py        # Finance analysis LLM prompts
├── requirements.txt              # Python dependencies
├── xgboost_fraud_model.json      # Pre-trained XGBoost fraud model
├── Dockerfile                    # Container configuration
├── fraud_ml/
│   ├── generate_dataset.py       # Realistic synthetic data generator (5 fraud types + business & stranger normals)
│   ├── train_model.py            # XGBoost training + ROC AUC + SHAP
│   ├── predict.py                # Standalone predictor with risk levels + SHAP
│   └── transactions_data.csv     # Generated training dataset
├── test/
│   ├── train.py                  # Legacy training script
│   ├── fake.py                   # Legacy data generator
│   └── transactions_data.csv     # Legacy training dataset
└── README.md                     # This file
```

**Note:** All image processing is done in-memory. No temporary files are created.

## Prerequisites

- Python 3.10 or higher
- Google Cloud account with Gemini API access
- Google API Key
- Neon PostgreSQL database (for scam reporting)
- XGBoost fraud model (`xgboost_fraud_model.json` — included, or retrain with `fraud_ml/train_model.py`)

## Installation

### 1. Clone/Navigate to the project

```bash
cd ai_service
```

### 2. Create a virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

#### Option A: Environment Variable (recommended)

**Windows (PowerShell):**
```powershell
$env:GOOGLE_API_KEY = "your-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set GOOGLE_API_KEY=your-api-key-here
```

**Linux/macOS:**
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

#### Option B: Create a .env file

Create a `.env` file in the `ai_service` directory:
```
GOOGLE_API_KEY=your-api-key-here
PORT=8000
HOST=0.0.0.0
```

Then add this to the beginning of `main.py`:
```python
from dotenv import load_dotenv
load_dotenv()
```

## Running the Server

### Development Mode (with auto-reload)

```bash
# Option 1: Using Python directly
python main.py

# Option 2: Using Uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The server will start at: `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### `POST /parse-bill`

Parse a bill/receipt image and extract structured data.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` - Image file (JPEG, PNG, GIF, BMP, or WebP)

**Response:**
```json
{
  "success": true,
  "data": {
    "merchant": "ABC Store",
    "date": "2024-01-15",
    "total": 150.50,
    "currency": "INR",
    "category": "Shopping",
    "items": [
      {"name": "Product 1", "price": 100.00},
      {"name": "Product 2", "price": 50.50}
    ]
  },
  "confidence": 0.95,
  "file_hash": "a1b2c3d4...",
  "is_duplicate": false,
  "warnings": [],
  "processing_time_ms": 2500
}
```

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/parse-bill" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/receipt.jpg"
```

**Example using Python:**
```python
import requests

url = "http://localhost:8000/parse-bill"
files = {"file": open("receipt.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

### `POST /parse-bill/debug`

Same as `/parse-bill` but includes raw AI response for debugging.

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "gemini_connected": true,
  "timestamp": "2024-01-15T10:30:00"
}
```

### `DELETE /duplicates`

Clear the duplicate detection cache.

### `GET /duplicates/count`

Get the count of processed bill hashes.

---

### `POST /analyze-finance`

Analyze user transactions with ML + LLM for financial insights.

**Request:**
- Method: `POST`
- Content-Type: `application/json`

**Body:**
```json
{
  "transactions": [
    {
      "amount": 150.00,
      "createdAt": "2026-02-18T22:12:40.640342",
      "description": "dinner",
      "fromUserName": "Berry",
      "toUserName": "Akenzz"
    },
    {
      "amount": 50.00,
      "createdAt": "2026-02-19T10:30:00.000000",
      "description": "movie tickets",
      "fromUserName": "Akenzz",
      "toUserName": "CinemaWorld"
    }
  ],
  "username": "Akenzz"
}
```

**Response:**
```json
{
  "success": true,
  "health_score": 72,
  "health_grade": "Good",
  "health_breakdown": {
    "consistency": { "score": 20, "max": 30 },
    "spike_control": { "score": 22, "max": 25 },
    "category_diversity": { "score": 12, "max": 25 },
    "anomaly_penalty": { "score": 18, "max": 20 }
  },
  "health_stats": {
    "total_spending": 200.00,
    "average_transaction": 100.00,
    "std_deviation": 70.71,
    "transaction_count": 2
  },
  "prediction": {
    "predicted_next_amount": 100.00,
    "method": "moving_average",
    "window": 2,
    "trend": "stable",
    "recent_average": 100.00
  },
  "anomalies": [
    {
      "description": "dinner",
      "amount": 150.00,
      "date": "2026-02-18T22:12:40.640342",
      "from": "Berry",
      "to": "Akenzz",
      "anomaly_score": -0.1234,
      "reason": "unusual spending pattern detected by ML model"
    }
  ],
  "categories": {
    "dinner": "Food",
    "movie tickets": "Entertainment"
  },
  "category_totals": {
    "Food": 150.00,
    "Entertainment": 50.00
  },
  "top_recipients": [
  {
    "recipient": "CinemaWorld",
    "total_amount": 500.00,
    "transaction_count": 3,
    "primary_category": "Entertainment",
    "category_breakdown": { "Entertainment": 500.00 },
    "descriptions": ["movie tickets", "popcorn", "IMAX show"],
    "reason": "Paid 500.00 across 3 transaction(s). Mostly for Entertainment (movie tickets, popcorn, IMAX show)."
  }
],
  "insights": [
    "Your Food spending (150.00) makes up 75% of your total — consider cooking at home more often.",
    "Your financial health score is 72/100 (Good). Keep maintaining consistent spending habits.",
    "Based on your recent transactions, your predicted next spend is around 100.00."
  ]
}
```

If there are not enough transactions for anomaly detection, the response will include:

```json
{
  "anomalies": [],
  "anomaly_skipped": true,
  "anomaly_skip_reason": "Anomaly detection requires at least 25 transactions for accurate results. You currently have 8 need 17 more. Keep transacting and check back soon!"
}
```

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/analyze-finance" \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {
        "amount": 150.00,
        "createdAt": "2026-02-18T22:12:40.640342",
        "description": "dinner",
        "fromUserName": "Berry",
        "toUserName": "Akenzz"
      }
    ],
    "username": "Akenzz"
  }'
```

**Example using Python:**
```python
import requests

url = "http://localhost:8000/analyze-finance"
payload = {
    "transactions": [
        {
            "amount": 150.00,
            "createdAt": "2026-02-18T22:12:40.640342",
            "description": "dinner",
            "fromUserName": "Berry",
            "toUserName": "Akenzz"
        }
    ],
    "username": "Akenzz"
}
response = requests.post(url, json=payload)
print(response.json())
```

---

### `POST /report-user`

Report a suspicious user. Duplicate reports from the same reporter are rejected.

**Request:**
- Method: `POST`
- Content-Type: `application/json`

**Body:**
```json
{
  "reporter_user_id": 12,
  "reported_user_id": 25,
  "reason": "Requested suspicious payment"
}
```

**Success Response (201):**
```json
{
  "message": "Report submitted successfully",
  "reported_user_id": 25,
  "report_count": 4,
  "is_scammer": false
}
```

**Duplicate Report Error (409):**
```json
{
  "detail": "User 12 has already reported user 25."
}
```

**Self-Report Error (409):**
```json
{
  "detail": "A user cannot report themselves."
}
```

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/report-user" \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_user_id": 12,
    "reported_user_id": 25,
    "reason": "Requested suspicious payment"
  }'
```

**Example using Python:**
```python
import requests

url = "http://localhost:8000/report-user"
payload = {
    "reporter_user_id": 12,
    "reported_user_id": 25,
    "reason": "Requested suspicious payment"
}
response = requests.post(url, json=payload)
print(response.json())
```

### `GET /scammer-status/{user_id}`

Check whether a user has been flagged as a scammer.

**Request:**
- Method: `GET`
- URL Parameter: `user_id` (integer)

**Response (user with reports):**
```json
{
  "user_id": 25,
  "report_count": 12,
  "is_scammer": true
}
```

**Response (user with no reports):**
```json
{
  "user_id": 99,
  "report_count": 0,
  "is_scammer": false
}
```

**Example using cURL:**
```bash
curl "http://localhost:8000/scammer-status/25"
```

### Scam Protection — How It Works

| Step | Action |
|------|--------|
| 1 | User submits a report via `POST /report-user` |
| 2 | System checks for duplicate reports (same reporter → same target) |
| 3 | A new row is inserted into `scam_reports` |
| 4 | `report_count` in `scammer_profiles` is incremented |
| 5 | If `report_count >= 10`, the user is automatically flagged (`is_scammer = true`) |

### Database Tables

**scam_reports**
| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer (PK) | Auto-incrementing primary key |
| `reporter_user_id` | Integer | ID of the user filing the report |
| `reported_user_id` | Integer (FK) | ID of the user being reported |
| `reason` | String | Reason for the report |
| `created_at` | Timestamp | When the report was created |

**scammer_profiles**
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | Integer (PK) | The reported user's ID |
| `report_count` | Integer | Total number of reports received |
| `is_scammer` | Boolean | `true` when report_count >= 10 |
| `updated_at` | Timestamp | Last time the profile was updated |

---

### `POST /evaluate-risk`

Evaluate the fraud risk of a transaction using the pre-trained XGBoost ML model.

**Request:**
- Method: `POST`
- Content-Type: `application/json`

**Body:**
```json
{
  "amount": 5000.00,
  "hour_of_day": 3,
  "is_weekend": 1,
  "receiver_account_age_days": 5,
  "receiver_report_count": 8,
  "receiver_tx_count_24h": 47,
  "receiver_unique_senders_24h": 30,
  "previous_connections_count": 0,
  "avg_transaction_amount_7d": 120.50
}
```

**Feature Descriptions:**

| Feature | Type | Description |
|---------|------|-------------|
| `amount` | float | Transaction amount |
| `hour_of_day` | int (0-23) | Hour when the transaction occurs |
| `is_weekend` | int (0/1) | Whether it's a weekend |
| `receiver_account_age_days` | int | How old the receiver's account is |
| `receiver_report_count` | int | Scam reports filed against the receiver |
| `receiver_tx_count_24h` | int | Receiver's transactions in the last 24 h |
| `receiver_unique_senders_24h` | int | Unique senders to receiver in the last 24 h |
| `previous_connections_count` | int | Prior transactions between these two users |
| `avg_transaction_amount_7d` | float | Sender's 7-day average transaction amount |

**Response — Safe transaction:**
```json
{
  "fraud_risk_score": 0.0002,
  "risk_level": "SAFE",
  "is_blocked": false,
  "message": "Transaction appears safe.",
  "explanation": [
    {"feature": "previous_connections_count", "value": 15, "impact": -3.86},
    {"feature": "receiver_report_count", "value": 0, "impact": -2.90}
  ],
  "risk_reasons": []
}
```

**Response — Blocked transaction:**
```json
{
  "fraud_risk_score": 0.9512,
  "risk_level": "HIGH",
  "is_blocked": true,
  "message": "Transaction blocked due to high fraud risk.",
  "explanation": [
    {"feature": "previous_connections_count", "value": 0, "impact": 4.04},
    {"feature": "receiver_report_count", "value": 4, "impact": 1.86}
  ],
  "risk_reasons": [
    "Low previous connections with sender",
    "Multiple scam reports on receiver",
    "High unique senders in last 24h"
  ]
}
```

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/evaluate-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000.00,
    "hour_of_day": 3,
    "is_weekend": 1,
    "receiver_account_age_days": 5,
    "receiver_report_count": 8,
    "receiver_tx_count_24h": 47,
    "receiver_unique_senders_24h": 30,
    "previous_connections_count": 0,
    "avg_transaction_amount_7d": 120.50
  }'
```

**Example using Python:**
```python
import requests

url = "http://localhost:8000/evaluate-risk"
payload = {
    "amount": 5000.00,
    "hour_of_day": 3,
    "is_weekend": 1,
    "receiver_account_age_days": 5,
    "receiver_report_count": 8,
    "receiver_tx_count_24h": 47,
    "receiver_unique_senders_24h": 30,
    "previous_connections_count": 0,
    "avg_transaction_amount_7d": 120.50
}
response = requests.post(url, json=payload)
print(response.json())
```

### How the Fraud Model Works

| Step | Detail |
|------|--------|
| 1 | Backend computes 9 raw features from the transaction context |
| 2 | Features are sent to `POST /evaluate-risk` |
| 3 | Service computes 3 engineered features (`amount_deviation`, `velocity_ratio`, `is_first_interaction`) |
| 4 | XGBoost model (12 features) returns a fraud probability (0.0 – 1.0) |
| 5 | Risk level assigned: `HIGH` (≥ 0.80), `MEDIUM` (≥ 0.50), `LOW` (≥ 0.25), `SAFE` (< 0.25) |
| 6 | If probability > **0.80** → transaction is **blocked** |
| 7 | SHAP explanation and top risk reasons are included in the response |

### Engineered Features

| Feature | Formula | Purpose |
|---------|---------|--------|
| `amount_deviation` | `amount / (avg_transaction_amount_7d + 1)` | Detects amounts deviating from the sender's recent average |
| `velocity_ratio` | `receiver_unique_senders_24h / (receiver_tx_count_24h + 1)` | Detects fan-in patterns (many unique senders) |
| `is_first_interaction` | `1 if previous_connections_count == 0 else 0` | Flags first-time sender–receiver pairs |

These are computed automatically by the API — callers only provide the 9 raw features.

### Fraud Patterns Detected

| Pattern | Description |
|---------|-------------|
| **Burst** | Brand-new account suddenly receives many payments from many senders |
| **Account Takeover (ATO)** | Large unusual transfers from older accounts at odd hours |
| **Micro-Test** | Tiny transactions (₹1–₹10) to verify stolen credentials |
| **Social Engineering** | Manipulated victims send to semi-established accounts |
| **Slow Fraud** | Low-and-slow siphoning that mimics normal activity |

### Normal Edge Cases

| Pattern | Description |
|---------|-------------|
| **Group Trip Settlement** | Legitimate high-activity account receiving many payments from friends |
| **Business Receiver** | Airlines, restaurants, hotels, travel agents — high account age, zero reports, many unique senders, low/zero previous connections (₹2K–₹15K) |
| **First-Time Stranger Payment** | Legitimate first-time payment (previous_connections = 0) to a service provider or individual seller (₹100–₹5K) |
| **Popular Receiver** | Bus ticket sellers, local shops — high velocity but established accounts |

### Model Training

The XGBoost model can be retrained with the improved pipeline:

```bash
cd fraud_ml/
python generate_dataset.py    # Generate 15K realistic transactions (5 fraud types + 5 normal types)
python train_model.py         # Train, evaluate (ROC AUC), and save model + SHAP
python predict.py             # Test predictions with risk levels and explanations
```

The model is saved directly to the project root as `xgboost_fraud_model.json`.

Training features (12 total — 9 raw + 3 engineered):
1. `amount`
2. `hour_of_day`
3. `is_weekend`
4. `receiver_account_age_days`
5. `receiver_report_count`
6. `receiver_tx_count_24h`
7. `receiver_unique_senders_24h`
8. `previous_connections_count`
9. `avg_transaction_amount_7d`
10. `amount_deviation` *(engineered)*
11. `velocity_ratio` *(engineered)*
12. `is_first_interaction` *(engineered)*

### SHAP Model Explainability

SHAP explanations are included in every API response when `shap` is installed:

```json
{
  "explanation": [
    {"feature": "previous_connections_count", "value": 0, "impact": 4.04},
    {"feature": "receiver_report_count", "value": 4, "impact": 1.86},
    {"feature": "receiver_unique_senders_24h", "value": 30, "impact": 1.82}
  ],
  "risk_reasons": [
    "Low previous connections with sender",
    "Multiple scam reports on receiver",
    "High unique senders in last 24h"
  ]
}
```

The training script also prints detailed SHAP analysis for a sample fraud transaction. Install with: `pip install shap`

---

### Analysis Pipeline Details

| Step | Method | Description |
|------|--------|-------------|
| 1. Preprocessing | Python/Pandas | Feature engineering (day_of_week, hour_of_day, is_weekend) |
| 2. Categorization | Gemini LLM | Classify transaction descriptions into categories |
| 3. Anomaly Detection | IsolationForest (sklearn) | Detect unusual spending patterns |
| 4. Health Score | Algorithm | Score 0-100 based on consistency, spikes, diversity, anomalies |
| 5. Prediction | Moving Average | Predict next transaction amount from recent history |
| 6. Insights | Gemini LLM | Generate personalized saving suggestions and alerts |

### Supported Categories (LLM-Detected)

- Food
- Travel
- Entertainment
- Utilities
- Shopping
- Others

> **Note:** Categories are detected by the LLM, NOT by rule-based logic. The LLM reads each transaction description and classifies it intelligently.

---

```json
{
  "merchant": "string - Store/business name",
  "date": "string - Date in YYYY-MM-DD format",
  "total": "number - Total amount",
  "currency": "string - ISO currency code (INR, USD, EUR, etc.)",
  "category": "string - One of: Food, Travel, Shopping, Utilities, Healthcare, Entertainment, Others",
  "items": [
    {
      "name": "string - Item description",
      "price": "number - Item price"
    }
  ]
}
```

## Error Handling

The service returns appropriate HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Report created successfully |
| 400 | Invalid file (wrong format, too large, corrupted) |
| 409 | Duplicate report or self-report attempt |
| 500 | Fraud model inference error |
| 502 | Gemini API error |
| 503 | Service not configured (missing API key or model file) |

Error response format:
```json
{
  "success": false,
  "error": "Error description",
  "error_code": "ERROR_CODE"
}
```

## Configuration Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `GOOGLE_API_KEY` | (required) | Google Generative AI API key |
| `DATABASE_URL` | (required) | Neon PostgreSQL connection string |
| `FRAUD_MODEL_PATH` | `xgboost_fraud_model.json` | Path to the trained XGBoost model file |
| `FRAUD_THRESHOLD` | `0.80` | Probability threshold for blocking (0.0 – 1.0) |
| `PORT` | 8000 | Server port |
| `HOST` | 0.0.0.0 | Server host |

> **DATABASE_URL format:** `postgresql://user:password@your-host.neon.tech/dbname?sslmode=require`

## Confidence Score

The confidence score (0-1) indicates extraction quality:

| Score | Quality |
|-------|---------|
| 0.9-1.0 | Excellent - All fields extracted |
| 0.7-0.9 | Good - Most fields extracted |
| 0.5-0.7 | Fair - Some fields missing |
| < 0.5 | Poor - Significant data missing |

## Supported Categories

- Food
- Travel
- Shopping
- Utilities
- Healthcare
- Entertainment
- Others

## Best Practices

1. **Image Quality**: Better image quality leads to better extraction
2. **Lighting**: Ensure bills are well-lit without harsh shadows
3. **Orientation**: Keep bills upright (not rotated)
4. **Resolution**: Use at least 800x600 pixels
5. **Format**: JPEG or PNG recommended

## Troubleshooting

### "Gemini API not configured"
- Ensure `GOOGLE_API_KEY` environment variable is set
- Restart the server after setting the key

### "Invalid or corrupted image file"
- Ensure the file is a valid image
- Try re-saving the image in a standard format (JPEG/PNG)

### Low confidence scores
- Check image quality
- Ensure the bill text is clearly visible
- Try different image formats

### "Request blocked by safety filters"
- The image may contain content blocked by Google's safety filters
- Try a different image

## Getting a Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key
4. Set it as `GOOGLE_API_KEY` environment variable

## License

MIT License - See LICENSE file for details.

## Support

For issues and feature requests, please open an issue in the repository.
