# System Design Interview Framework

A repeatable approach for a 45–60 minute system design interview.

## 1. Time budget (45 minutes)

| Phase | Time | Goal |
|-------|------|------|
| Clarify requirements | 5 min | Scope the problem; agree on what's in / out |
| Estimation | 3–5 min | Find the numbers that drive the design (QPS, storage, bandwidth) |
| API + data model | 5 min | Define the contract and the core entities |
| High-level design | 10 min | Boxes and arrows covering every functional requirement |
| Deep dives | 15 min | 2–3 hardest components; this is where you are graded |
| Wrap-up | 3–5 min | Bottlenecks, failure modes, what you'd do with more time |

## 2. Clarifying questions checklist

- **Users & scale:** How many DAU? Peak vs average? Global or single region?
- **Core features:** What are the 2–3 features that must work? What can we drop?
- **Read/write ratio:** Read-heavy (feeds, URL shortener) or write-heavy (logging, metrics)?
- **Latency:** What's the p99 target? Is it user-facing?
- **Consistency:** Is stale data acceptable? For how long? (Money: no. Like counts: yes.)
- **Durability:** Can we ever lose data?
- **For AI systems additionally:** What's the quality metric? Is there labeled data? Latency/cost budget per request? What happens when the model is wrong?

## 3. Reference numbers

### Latency
| Operation | Latency |
|-----------|---------|
| L1 cache reference | 1 ns |
| Main memory reference | 100 ns |
| Read 1 MB sequentially from memory | 3 µs |
| SSD random read | 16–100 µs |
| Round trip within a datacenter | 0.5 ms |
| Read 1 MB sequentially from SSD | 0.2–1 ms |
| Redis GET (in-DC) | ~0.5–1 ms |
| Round trip US East ↔ US West | ~40 ms |
| Round trip US ↔ Europe | ~80–150 ms |

### Throughput rules of thumb
| Component | Rough capacity |
|-----------|----------------|
| Single web server (simple API) | 1k–10k RPS |
| Redis node | ~100k ops/s |
| PostgreSQL/MySQL primary (simple writes) | ~5k–20k writes/s |
| Kafka partition | ~10 MB/s write |
| Cassandra node | ~10k–50k writes/s |

### Time conversions
- 1 day ≈ 86,400 s ≈ **10⁵ s**
- 1M requests/day ≈ **12 RPS**
- 1B requests/day ≈ **12k RPS**
- Peak ≈ 2–3× average

### LLM / GPU numbers (2025–2026 era, order of magnitude)
| Item | Value |
|------|-------|
| 1 token | ~0.75 English words, ~4 characters |
| H100 HBM | 80 GB, ~3.35 TB/s bandwidth |
| 70B model in FP16 | ~140 GB weights (needs ≥2 × 80 GB GPUs) |
| 70B model in INT4/FP8 | ~35–70 GB |
| KV cache per token (70B, GQA, FP16) | ~0.3 MB |
| Decode speed per stream (70B, H100) | ~30–60 tokens/s |
| Embedding model latency (batch) | ~1–10 ms per item |

## 4. Common building blocks

| Need | Typical choice |
|------|----------------|
| Relational, transactional data | PostgreSQL / MySQL (+ sharding / Vitess / Citus) |
| Massive write throughput, wide rows | Cassandra / ScyllaDB / DynamoDB |
| Cache | Redis / Memcached |
| Async work, decoupling | Kafka (log), SQS/RabbitMQ (queue) |
| Blob storage | S3 / GCS |
| Full-text search | Elasticsearch / OpenSearch |
| Vector search | FAISS, HNSW-based DBs (pgvector, Milvus, Qdrant, Weaviate) |
| Stream processing | Flink / Kafka Streams / Spark Streaming |
| Batch processing | Spark / BigQuery / Snowflake |
| Static content delivery | CDN |
| Coordination / leader election | ZooKeeper / etcd |

## 5. Things interviewers listen for

1. You **drive** the conversation and check in at transitions.
2. You **quantify** before choosing technology.
3. You name **trade-offs** for every choice ("we give up X to get Y").
4. You identify the **bottleneck** and **single points of failure** without being asked.
5. For AI systems: you talk about **data, evaluation, and feedback loops**, not just models.
