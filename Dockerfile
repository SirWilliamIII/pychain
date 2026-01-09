# PyChain Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=4747 \
    DATA_DIR=/app/data

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py ./
COPY core/ ./core/
COPY static/ ./static/
COPY templates/ ./templates/

# Create data directory and non-root user
RUN mkdir -p /app/data && \
    useradd -m appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 4747

CMD ["python", "app.py"]
