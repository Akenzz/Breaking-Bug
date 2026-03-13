import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, Set
from contextlib import asynccontextmanager


import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Query
from typing import List as TypingList



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
