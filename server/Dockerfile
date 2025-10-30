FROM python:3.11-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install uv and dependencies - force Python 3.11
RUN pip install --no-cache-dir uv && \
    uv sync --no-dev --python 3.11

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["uv", "run", "--python", "3.11", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]