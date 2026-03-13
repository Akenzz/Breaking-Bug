# SmartPay AI - Docker Image for Hugging Face Spaces
# ====================================================

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create a non-root user (required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
ENV HOME=/home/user
ENV PATH="/home/user/.local/bin:$PATH"

# Install dependencies as root first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Switch to non-root user
USER user

# Copy application code
COPY --chown=user:user . .

# Hugging Face Spaces uses port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
