"""
Finance Analysis Package
=========================
Modular financial analysis engine combining ML + LLM.

Components:
- categorizer:      LLM-based transaction category detection (Gemini)
- preprocessor:     Feature engineering for ML
- anomaly_detector: ML anomaly detection (IsolationForest) + LLM explanations
- health_scorer:    Financial health scoring (0-100)
- predictor:        Future spending prediction (moving average)
- recipients:       Top recipients analysis
- insight_generator: AI-generated insights and saving suggestions (Gemini)
- analyzer:         Main orchestrator that ties everything together
"""

from services.finance.analyzer import FinanceAnalyzer, FinanceAnalyzerError

__all__ = [
    "FinanceAnalyzer",
    "FinanceAnalyzerError",
]
