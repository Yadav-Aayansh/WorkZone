# Redis Storage Quick Reference

## TL;DR - Quick Answer

**For 10 tenants with 10 rows per table:**

### Recommended Redis Memory: **512 MB**

---

## Storage Breakdown

| Component | Usage |
|-----------|-------|
| AI Interview Sessions | ~1.1 MB |
| HR Chat Sessions | ~1.4 MB |
| Celery Task Queue | ~1.0 MB |
| Overhead (fragmentation, etc.) | ~1.2 MB |
| **Total Current Usage** | **~5 MB** |

---

## Why 512 MB if usage is only 5 MB?

1. **Peak Load Handling:** 2-5x traffic spikes during business hours
2. **Memory Fragmentation:** Redis needs ~20% overhead
3. **Growth Buffer:** Room for 5-10x growth without reconfiguration
4. **Safety Margin:** Redis performance degrades at >80% capacity

---

## Redis Sizing Guide

| Tenants | Min Memory | Recommended | With Growth |
|---------|-----------|-------------|-------------|
| 10 | 128 MB | **512 MB** | 1 GB |
| 25 | 256 MB | 1 GB | 2 GB |
| 50 | 512 MB | 2 GB | 4 GB |
| 100+ | 1 GB | 4 GB | 8 GB |

---

## Key Configuration

```bash
# Minimum viable
maxmemory 512mb
maxmemory-policy allkeys-lru

# Recommended for production
maxmemory 1gb
maxmemory-policy allkeys-lru
timeout 300
```

---

## Session Storage Details

### What's Stored:
- **Interview sessions:** 15-35 KB each (24h TTL)
- **Chat sessions:** 6-17 KB each (24h TTL)
- **Task queue:** 2-3 KB per task (1-24h TTL)

### What's NOT Stored:
- ❌ Database records (PostgreSQL)
- ❌ File uploads (Google Cloud Storage)
- ❌ Historical data (all data has TTL)

---

## Monitoring Commands

```bash
# Check current memory usage
redis-cli INFO memory

# Key commands to watch
> INFO memory
used_memory_human: 4.7M
used_memory_peak_human: 8.2M

> DBSIZE
(integer) 156

> TTL interview_session:abc123
(integer) 86234
```

---

## Cost Estimates (Monthly)

| Provider | Size | Cost |
|----------|------|------|
| AWS ElastiCache | 512 MB | $12 |
| AWS ElastiCache | 1 GB | $25 |
| Google Memorystore | 1 GB | $26 |
| Azure Cache | 1 GB | $55 |
| Self-hosted | 1 GB | $5-10 (VPS) |

---

## When to Scale Up

Scale to **1 GB** when:
- Used memory consistently >350 MB (70% of 512 MB)
- Frequent evictions in Redis logs
- Growing to 20+ tenants
- Adding new features using Redis

Scale to **2 GB** when:
- Used memory consistently >700 MB
- Growing to 50+ tenants
- High concurrent usage patterns

---

## Implementation Checklist

- [x] Redis already configured in application
- [x] TTL set on all sessions (24 hours)
- [x] LRU eviction policy recommended
- [ ] Set `maxmemory 512mb` in redis.conf
- [ ] Set `maxmemory-policy allkeys-lru`
- [ ] Setup monitoring for used_memory
- [ ] Alert at 70% capacity threshold

---

## Key Takeaway

**Start with 512 MB Redis** for your 10-tenant setup. It provides:
- ✅ 100x your current needs (~5 MB actual usage)
- ✅ Handles peak load spikes
- ✅ Room for growth
- ✅ Cost-effective (~$12-25/month)
- ✅ No performance concerns

**Monitor and scale** as needed based on actual usage patterns.

---

See [REDIS_STORAGE_ANALYSIS.md](./REDIS_STORAGE_ANALYSIS.md) for detailed calculations and methodology.
