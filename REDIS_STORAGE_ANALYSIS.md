# Redis Storage Requirements Analysis

## Executive Summary

Based on a comprehensive analysis of the WorkZone application codebase, this document provides detailed Redis storage estimates for running the application with **10 tenants** and **10 rows per table** in each tenant.

**Recommended Redis Memory: 256 MB - 512 MB**

For production environments with growth headroom and safety margin: **1 GB**

---

## Application Overview

WorkZone is a multi-tenant HR management platform with the following key features:
- Job posting and application management
- AI-powered interview sessions
- HR policy chatbot with RAG (Retrieval-Augmented Generation)
- Leave management
- Learning paths
- Employee queries

---

## Redis Usage in WorkZone

Redis is used for three primary purposes:

### 1. **Session Storage for AI Interviews**
- Interview session state management
- Question/answer history
- Resume and JD text
- Real-time interview progress

### 2. **Chat Session Storage for HR Policy Bot**
- Conversation history
- User context
- Chat metadata
- Message timestamps

### 3. **Celery Task Queue**
- Background job management
- Task results storage
- Job state tracking

---

## Detailed Storage Calculations

### 1. AI Interview Sessions

#### Data Structure Analysis
From `src/genai/schemas/hr_interview.py`, the `SessionData` model includes:

```python
class SessionData:
    - session_id: str (UUID, ~36 bytes)
    - resume_text: str (extracted from PDF)
    - jd_text: str (job description markdown)
    - candidate_name: str (~50 bytes)
    - position: str (~50 bytes)
    - responses: List[QuestionResponse] (5-10 items)
    - questions_asked: List[InterviewQuestion] (5-10 items)
    - created_at: datetime (~30 bytes)
    - current_question_index: int (~8 bytes)
```

#### Size Estimation per Session:

| Component | Size Estimate | Notes |
|-----------|---------------|-------|
| session_id | 36 bytes | UUID string |
| resume_text | 5-15 KB | Extracted text from PDF resume |
| jd_text | 2-5 KB | Job description in markdown |
| candidate_name | 50 bytes | Average name length |
| position | 50 bytes | Job title |
| responses (10 max) | 5-10 KB | Each Q&A pair ~500-1000 bytes |
| questions_asked (10 max) | 2-3 KB | Each question ~200-300 bytes |
| created_at | 30 bytes | ISO datetime string |
| current_question_index | 8 bytes | Integer |
| JSON overhead | ~500 bytes | Serialization overhead |
| **Total per session** | **15-35 KB** | **Average: ~25 KB** |

#### Concurrent Sessions Estimate:
- **Per tenant:** 2-3 concurrent interview sessions (peak)
- **10 tenants:** 20-30 concurrent sessions
- **TTL:** 24 hours (sessions expire after 24 hours)

**Storage for Interview Sessions:**
- Active sessions: 30 sessions × 25 KB = **750 KB**
- With 50% overhead: **~1.1 MB**

---

### 2. HR Policy Chat Sessions

#### Data Structure Analysis
From `src/genai/schemas/hr_policy.py`, the `ChatSession` model includes:

```python
class ChatSession:
    - chat_id: str (UUID, ~36 bytes)
    - user_info: Dict (user context)
    - messages: List[Message] (conversation history)
    - context: Dict (session context)
    - created_at: str (~30 bytes)
    - last_activity: str (~30 bytes)
```

#### Size Estimation per Chat Session:

| Component | Size Estimate | Notes |
|-----------|---------------|-------|
| chat_id | 36 bytes | UUID string |
| user_info | 200-500 bytes | User context dictionary |
| messages (avg 10-20) | 5-15 KB | Each message ~300-500 bytes |
| context | 500-1000 bytes | Session context data |
| created_at | 30 bytes | ISO datetime string |
| last_activity | 30 bytes | ISO datetime string |
| JSON overhead | ~300 bytes | Serialization overhead |
| **Total per session** | **6-17 KB** | **Average: ~12 KB** |

#### Concurrent Chat Sessions Estimate:
- **Per tenant:** 5-10 concurrent chat sessions (peak)
- **10 tenants:** 50-100 concurrent sessions
- **TTL:** 24 hours

**Storage for Chat Sessions:**
- Active sessions: 75 sessions × 12 KB = **900 KB**
- With 50% overhead: **~1.4 MB**

---

### 3. Celery Task Queue

#### Task Types in Application:
From `src/core/celery.py` and task files:
- Email notifications
- Tenant provisioning
- Background processing
- Domain operations
- Leave processing
- Job notifications
- Policy document processing

#### Celery Storage Components:

| Component | Size Estimate | Notes |
|-----------|---------------|-------|
| Task metadata | 500-1000 bytes | Task ID, args, kwargs, state |
| Task result | 1-5 KB | Depends on task return value |
| Broker messages | 1-2 KB | Message routing info |

**Average task size:** ~2-3 KB

#### Task Volume Estimate:
- **Per tenant per day:** 50-100 tasks (emails, notifications, background jobs)
- **10 tenants per day:** 500-1000 tasks
- **Concurrent/pending tasks:** 50-100 tasks at peak
- **Result TTL:** Usually 1-24 hours

**Storage for Celery:**
- Pending/active tasks: 75 tasks × 3 KB = **225 KB**
- Task results (retained): 200 tasks × 3 KB = **600 KB**
- Total Celery storage: **~1 MB**

---

## Total Storage Summary

### Base Requirements

| Component | Storage | Notes |
|-----------|---------|-------|
| AI Interview Sessions | 1.1 MB | 30 concurrent sessions |
| HR Chat Sessions | 1.4 MB | 75 concurrent sessions |
| Celery Tasks | 1.0 MB | Queue + results |
| **Subtotal** | **3.5 MB** | Core application data |

### Additional Overhead

| Overhead Type | Multiplier | Storage |
|---------------|------------|---------|
| Redis metadata | +10% | 0.35 MB |
| Connection overhead | +5% | 0.18 MB |
| Memory fragmentation | +20% | 0.70 MB |
| **Total Overhead** | **~35%** | **1.23 MB** |

### **Total Estimated Usage: 4.7 MB**

---

## Scaling Considerations

### Growth Factors

| Scenario | Sessions/Tasks | Storage |
|----------|---------------|---------|
| **Current (10 tenants)** | 30 + 75 + 75 | ~5 MB |
| **2x load (peak hours)** | 60 + 150 + 150 | ~10 MB |
| **5x load (growth)** | 150 + 375 + 375 | ~25 MB |
| **10x load (high growth)** | 300 + 750 + 750 | ~50 MB |

### Database Rows (Not in Redis)

The application uses PostgreSQL for persistent storage. With 10 tenants and 10 rows per table:

#### Per-Tenant Tables:
- **users:** 10 rows × 10 tenants = 100 users
- **employees:** 10 rows × 10 tenants = 100 employees
- **managers:** 10 rows × 10 tenants = 100 managers
- **recruiters:** 10 rows × 10 tenants = 100 recruiters
- **applicants:** 10 rows × 10 tenants = 100 applicants
- **jobs:** 10 rows × 10 tenants = 100 jobs
- **applications:** 10 rows × 10 tenants = 100 applications
- **ai_interviews:** 10 rows × 10 tenants = 100 interviews
- **leave_requests:** 10 rows × 10 tenants = 100 requests
- **leave_entitlements:** 10 rows × 10 tenants = 100 entitlements
- **learning_paths:** 10 rows × 10 tenants = 100 paths
- **queries:** 10 rows × 10 tenants = 100 queries

**Total tenant rows:** ~1,200 rows across all tenant tables

**Note:** These rows are stored in PostgreSQL, NOT Redis. Redis only stores temporary session data.

---

## Recommendations

### 1. **Minimum Redis Configuration**

For **10 tenants with 10 rows per table:**
- **Minimum:** 128 MB
- **Recommended:** 256 MB
- **Comfortable:** 512 MB

### 2. **Production Configuration**

For production with growth headroom:
- **Recommended:** 1 GB
- **Scaling to 50 tenants:** 2 GB
- **Scaling to 100+ tenants:** 4 GB

### 3. **Redis Configuration Settings**

```conf
# Memory Management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence (optional for session data)
save ""
appendonly no

# Connection Settings
timeout 300
tcp-keepalive 60

# Performance
maxclients 1000
```

### 4. **Key Expiration Strategy**

All keys should have appropriate TTL:
- Interview sessions: 24 hours
- Chat sessions: 24 hours
- Celery results: 1-24 hours (configurable)

This is already implemented in the codebase:
```python
await redis_client.set_session(session_id, data, hours=24)
```

### 5. **Monitoring Recommendations**

Track these metrics:
- `used_memory`: Current memory usage
- `used_memory_peak`: Peak memory usage
- `connected_clients`: Number of active connections
- `evicted_keys`: Keys removed due to memory pressure
- `expired_keys`: Keys that have naturally expired

---

## Cost Considerations (Cloud Providers)

### AWS ElastiCache for Redis
- **cache.t3.micro (512 MB):** ~$12/month
- **cache.t3.small (1.5 GB):** ~$25/month
- **cache.t3.medium (3.2 GB):** ~$50/month

### Google Cloud Memorystore
- **Basic Tier (1 GB):** ~$26/month
- **Standard Tier (1 GB):** ~$50/month (with HA)

### Azure Cache for Redis
- **Basic C0 (250 MB):** ~$16/month
- **Basic C1 (1 GB):** ~$55/month

### Docker/Self-Hosted
- Redis is extremely lightweight
- 1 GB Redis typically uses ~1 GB RAM + minimal CPU
- Can run on smallest VPS instances

---

## Conclusion

**For your specific use case (10 tenants, 10 rows per table):**

### Quick Answer:
- **Minimum viable:** 128 MB Redis
- **Recommended:** 256-512 MB Redis
- **Production ready:** 1 GB Redis

### Why these numbers?
1. **Actual usage is only ~5 MB** for 10 tenants
2. **2-10x overhead** accounts for:
   - Memory fragmentation
   - Peak load spikes
   - Redis internal structures
   - Safety margin
3. **Redis is cheap** - better to over-provision slightly

### Start with:
**512 MB Redis instance** - gives you plenty of headroom for growth and handles peak loads comfortably.

### Monitor and adjust:
- Start small (512 MB)
- Monitor `used_memory` metrics
- Scale up when consistently using >70% capacity
- Scale down if consistently using <30% capacity

---

## Additional Notes

### What's NOT in Redis:
- **Database records** (PostgreSQL stores these)
- **File uploads** (GCS stores these)
- **Long-term data** (all Redis data has TTL)

### What IS in Redis:
- **Active session data** (temporary, 24h TTL)
- **Real-time interview state** (temporary)
- **Chat conversation context** (temporary)
- **Background task queue** (temporary)

### Key Insight:
The number of database rows (10 per table) has **minimal impact** on Redis storage because:
1. Redis stores active sessions, not database rows
2. Concurrency (active users) matters more than total users
3. For 10 tenants, you'll likely have 20-100 concurrent sessions max
4. Each session is small (10-30 KB)

---

## Document Metadata

- **Analysis Date:** 2025-12-06
- **Application:** WorkZone HR Management Platform
- **Version:** v0.1.0
- **Analyst:** GitHub Copilot
- **Scope:** 10 tenants, 10 rows per table scenario
