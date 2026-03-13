import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, Set
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Query
from typing import List as TypingList

logger = logging.getLogger(__name__)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

sys.path.insert(0, str(Path(__file__).parent))

from services.gemini_parser import GeminiParser, GeminiParserError
from services.finance import FinanceAnalyzer, FinanceAnalyzerError
from utils.file_handler import FileHandler, FileHandlerError

from database import engine, Base
from routers.report_router import router as report_router
from routers.fraud_router import router as fraud_router

# ==================== PYDANTIC MODELS ====================

class ItemModel(BaseModel):
    name: str = Field(..., description="Item name/description")
    price: float = Field(..., description="Item price")


class BillData(BaseModel):
    merchant: str = Field(..., description="Merchant/store name")
    date: str = Field(..., description="Bill date in YYYY-MM-DD format")
    total: float = Field(..., description="Total amount")
    currency: str = Field(..., description="ISO currency code")
    category: str = Field(..., description="Bill category")
    items: list[ItemModel] = Field(default_factory=list, description="List of items")


class ParseResponse(BaseModel):
    success: bool = Field(..., description="Whether parsing was successful")
    data: BillData = Field(..., description="Parsed bill data")
    confidence: float = Field(..., description="Confidence score (0-1)")
    file_hash: str = Field(..., description="File hash for duplicate detection")
    is_duplicate: bool = Field(False, description="Whether this bill was already processed")
    warnings: list[str] = Field(default_factory=list, description="Validation warnings")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")


class ErrorResponse(BaseModel):
    success: bool = False
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code for programmatic handling")


class SingleBillResult(BaseModel):
    success: bool = Field(..., description="Whether parsing was successful")
    filename: str = Field(..., description="Original filename")
    data: Optional[BillData] = Field(None, description="Parsed bill data")
    confidence: float = Field(0.0, description="Confidence score (0-1)")
    file_hash: str = Field("", description="File hash for duplicate detection")
    is_duplicate: bool = Field(False, description="Whether this bill was already processed")
    warnings: list[str] = Field(default_factory=list, description="Validation warnings")
    error: Optional[str] = Field(None, description="Error message if parsing failed")


class BatchParseResponse(BaseModel):
    success: bool = Field(..., description="Whether the overall batch was successful")
    total: int = Field(..., description="Total number of files submitted")
    parsed: int = Field(..., description="Number of files successfully parsed")
    failed: int = Field(..., description="Number of files that failed")
    results: list[SingleBillResult] = Field(..., description="Individual results for each file")
    processing_time_ms: int = Field(..., description="Total processing time in milliseconds")


class HealthResponse(BaseModel):
    status: str
    version: str
    gemini_connected: bool
    timestamp: str


# ==================== FINANCE ANALYSIS MODELS ====================

class TransactionItem(BaseModel):
    amount: float = Field(..., description="Transaction amount")
    createdAt: str = Field(..., description="ISO timestamp of the transaction")
    description: str = Field(..., description="Transaction description")
    fromUserName: str = Field(..., description="Sender username")
    toUserName: str = Field(..., description="Receiver username")


class FinanceAnalysisRequest(BaseModel):
    transactions: list[TransactionItem] = Field(..., description="List of transactions to analyze")
    username: str = Field(..., description="Current user's username")


class PredictionResult(BaseModel):
    predicted_next_amount: float
    method: str
    trend: str
    data_points_used: int
    model_confidence_r2: float
    recent_average: float


class AnomalyItem(BaseModel):
    description: str
    amount: float
    date: str
    from_user: str = Field(alias="from")
    to_user: str = Field(alias="to")
    direction: str
    anomaly_score: float
    reason: str

    model_config = {"populate_by_name": True}


class HealthBreakdownItem(BaseModel):
    score: int
    max: int


class HealthBreakdown(BaseModel):
    consistency: HealthBreakdownItem
    spike_control: HealthBreakdownItem
    category_diversity: HealthBreakdownItem
    anomaly_penalty: HealthBreakdownItem


class HealthStats(BaseModel):
    total_spending: float
    total_income: float
    net_cash_flow: float
    average_transaction: float
    std_deviation: float
    transaction_count: int
    outgoing_count: int
    incoming_count: int


class TopRecipientItem(BaseModel):
    recipient: str = Field(..., description="Username the user paid to")
    total_amount: float = Field(..., description="Total amount paid to this recipient")
    transaction_count: int = Field(..., description="Number of transactions to this recipient")
    primary_category: str = Field(..., description="Main spending category for this recipient")
    category_breakdown: Dict[str, float] = Field(default_factory=dict, description="Category → amount for this recipient")
    descriptions: list[str] = Field(default_factory=list, description="Transaction descriptions (up to 5)")
    reason: str = Field(..., description="Human-readable explanation of why this recipient ranks high")


class FinanceAnalysisResponse(BaseModel):
    success: bool = True
    health_score: int = Field(..., description="Financial health score 0-100")
    health_grade: str = Field(..., description="Grade: Excellent/Good/Fair/Needs Improvement/Poor")
    health_breakdown: HealthBreakdown
    health_stats: HealthStats
    prediction: PredictionResult
    anomalies: list[dict] = Field(default_factory=list, description="Detected spending anomalies")
    anomaly_skipped: bool = Field(False, description="True if anomaly detection was skipped due to insufficient data")
    anomaly_skip_reason: str = Field("", description="Reason anomaly detection was skipped (empty when not skipped)")
    categories: Dict[str, str] = Field(default_factory=dict, description="Description → Category mapping")
    category_totals: Dict[str, float] = Field(default_factory=dict, description="Category → Total amount")
    top_recipients: list[TopRecipientItem] = Field(default_factory=list, description="Top recipients the user paid most to, with reasons")
    insights: list[str] = Field(default_factory=list, description="AI-generated financial insights")


processed_hashes: Set[str] = set()
gemini_parser: Optional[GeminiParser] = None
file_handler: Optional[FileHandler] = None
finance_analyzer: Optional[FinanceAnalyzer] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global gemini_parser, file_handler, finance_analyzer
    
    Base.metadata.create_all(bind=engine)
    logger.info("Scam reporting database tables ensured.")
    
    file_handler = FileHandler()
    
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            gemini_parser = GeminiParser(api_key=api_key)
            finance_analyzer = FinanceAnalyzer(api_key=api_key)
    except (GeminiParserError, FinanceAnalyzerError):
        pass
    
    yield


# ==================== FASTAPI APP ====================

app = FastAPI(
    title="SmartPay AI Microservices",
    description="AI services for SmartPay",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report_router)
app.include_router(fraud_router)


# ==================== EXCEPTION HANDLERS ====================

@app.exception_handler(GeminiParserError)
async def gemini_parser_error_handler(request, exc: GeminiParserError):
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content=ErrorResponse(
            error=str(exc),
            error_code="GEMINI_ERROR"
        ).model_dump()
    )


@app.exception_handler(FileHandlerError)
async def file_handler_error_handler(request, exc: FileHandlerError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorResponse(
            error=str(exc),
            error_code="FILE_ERROR"
        ).model_dump()
    )


# ==================== API ENDPOINTS ====================

@app.get("/", tags=["Info"])
async def root():
    return {
        "service": "SmartPay AI Microservices",
        "version": "3.0.0",
        "documentation": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
async def health_check():
    gemini_connected = False
    
    if gemini_parser:
        try:
            gemini_connected = gemini_parser.test_connection()
        except Exception:
            gemini_connected = False
    
    return HealthResponse(
        status="healthy",
        version="3.0.0",
        gemini_connected=gemini_connected,
        timestamp=datetime.now().isoformat()
    )


@app.post(
    "/parse-bill",
    response_model=ParseResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file or request"},
        502: {"model": ErrorResponse, "description": "Gemini API error"},
        503: {"model": ErrorResponse, "description": "Service not configured"}
    },
    tags=["Parsing"]
)
async def parse_bill(
    file: UploadFile = File(..., description="Bill/receipt image file"),
    skip_duplicate_check: bool = Query(False, description="Skip duplicate detection")
):
    start_time = datetime.now()
    
    if not gemini_parser:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API not configured. Please set GOOGLE_API_KEY environment variable."
        )
    
    if not file_handler:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File handler not initialized."
        )
    
    try:
        image, file_hash, raw_bytes = await file_handler.process_upload(file)
    except FileHandlerError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    is_duplicate = file_hash in processed_hashes
    if is_duplicate and not skip_duplicate_check:
        pass
    
    try:
        result = gemini_parser.parse_bill(image)
        processed_hashes.add(file_hash)
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return ParseResponse(
            success=True,
            data=BillData(**result["data"]),
            confidence=result["confidence"],
            file_hash=file_hash,
            is_duplicate=is_duplicate,
            warnings=result["warnings"],
            processing_time_ms=int(processing_time)
        )
    except GeminiParserError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e)
        )


@app.post(
    "/parse-bills",
    response_model=BatchParseResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        502: {"model": ErrorResponse, "description": "Gemini API error"},
        503: {"model": ErrorResponse, "description": "Service not configured"}
    },
    tags=["Parsing"]
)
async def parse_bills(
    files: TypingList[UploadFile] = File(..., description="Multiple bill/receipt image files"),
    skip_duplicate_check: bool = Query(False, description="Skip duplicate detection")
):
    """Parse multiple bill/receipt images in a single request."""
    start_time = datetime.now()

    if not gemini_parser:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API not configured. Please set GOOGLE_API_KEY environment variable."
        )

    if not file_handler:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File handler not initialized."
        )

    results: list[SingleBillResult] = []
    parsed_count = 0
    failed_count = 0

    for file in files:
        filename = file.filename or "unknown"
        try:
            image, file_hash, raw_bytes = await file_handler.process_upload(file)
        except FileHandlerError as e:
            failed_count += 1
            results.append(SingleBillResult(
                success=False,
                filename=filename,
                error=str(e)
            ))
            continue

        is_duplicate = file_hash in processed_hashes

        try:
            result = gemini_parser.parse_bill(image)
            processed_hashes.add(file_hash)
            parsed_count += 1
            results.append(SingleBillResult(
                success=True,
                filename=filename,
                data=BillData(**result["data"]),
                confidence=result["confidence"],
                file_hash=file_hash,
                is_duplicate=is_duplicate if not skip_duplicate_check else False,
                warnings=result["warnings"]
            ))
        except GeminiParserError as e:
            failed_count += 1
            results.append(SingleBillResult(
                success=False,
                filename=filename,
                file_hash=file_hash,
                error=str(e)
            ))

    processing_time = (datetime.now() - start_time).total_seconds() * 1000

    return BatchParseResponse(
        success=failed_count == 0,
        total=len(files),
        parsed=parsed_count,
        failed=failed_count,
        results=results,
        processing_time_ms=int(processing_time)
    )


@app.post("/parse-bill/debug", tags=["Debug"])
async def parse_bill_debug(
    file: UploadFile = File(..., description="Bill/receipt image file")
):
    start_time = datetime.now()
    
    if not gemini_parser or not file_handler:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not configured"
        )
    
    image, file_hash, raw_bytes = await file_handler.process_upload(file)
    image_info = file_handler.get_image_info(image, len(raw_bytes))
    result = gemini_parser.parse_bill(image)
    processing_time = (datetime.now() - start_time).total_seconds() * 1000
    
    return {
        "success": True,
        "data": result["data"],
        "confidence": result["confidence"],
        "file_hash": file_hash,
        "warnings": result["warnings"],
        "raw_response": result["raw_response"],
        "image_info": image_info,
        "processing_time_ms": int(processing_time)
    }


# ==================== FINANCE ANALYSIS ENDPOINT ====================

@app.post(
    "/analyze-finance",
    response_model=FinanceAnalysisResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request data"},
        502: {"model": ErrorResponse, "description": "Gemini API error"},
        503: {"model": ErrorResponse, "description": "Service not configured"},
    },
    tags=["Finance Analysis"],
    summary="Analyze user transactions with ML + LLM",
    description=(
        "Analyzes transaction data to produce: LLM-based category detection, "
        "ML-based anomaly detection, financial health score, spending prediction, "
        "and AI-generated insights with saving suggestions."
    ),
)
async def analyze_finance(request: FinanceAnalysisRequest):
    """Run full financial analysis pipeline on user transactions."""
    start_time = datetime.now()

    if not finance_analyzer:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Finance analyzer not configured. Please set GOOGLE_API_KEY environment variable.",
        )

    if not request.transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transactions provided.",
        )

    try:
        # Convert Pydantic models to plain dicts for the service layer
        transactions_raw = [tx.model_dump() for tx in request.transactions]

        result = finance_analyzer.analyze(
            transactions=transactions_raw,
            username=request.username,
        )

        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        logger.info(f"Finance analysis completed in {processing_time:.0f}ms")

        return FinanceAnalysisResponse(success=True, **result)

    except FinanceAnalyzerError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected error in /analyze-finance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {str(e)}",
        )


@app.delete("/duplicates", tags=["Admin"])
async def clear_duplicates():
    global processed_hashes
    count = len(processed_hashes)
    processed_hashes.clear()
    return {"message": f"Cleared {count} cached hashes"}


@app.get("/duplicates/count", tags=["Admin"])
async def get_duplicate_count():
    return {"count": len(processed_hashes)}


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )