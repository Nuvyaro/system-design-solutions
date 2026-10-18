# The Night-Before Cheat Sheet: All 54 Problems on One Page

> One row per problem: the **core insight** that unlocks the design, the components you **must mention**, and the **trap** interviewers probe. Skim it before an interview; click through for the full solution.

## Numbers to remember

| Fact | Value | Fact | Value |
|------|-------|------|-------|
| Seconds/day | ~10⁵ | 1M req/day | ~12 QPS |
| Memory read | 100 ns | SSD random read | ~100 µs |
| Same-DC round trip | 0.5 ms | Cross-continent RTT | 80–150 ms |
| Redis node | ~100k ops/s | SQL primary | ~5–20k writes/s |
| Kafka partition | ~10 MB/s | Web server | 1–10k RPS |
| 1 token | ~4 chars | 70B model FP16 | ~140 GB |
| 99.9% / 99.99% | 8.8 h / 53 min down per year | Bloom filter 1% FP | ~10 bits/item |

## Universal answer skeleton

Clarify (5) → Estimate (5) → API & data model (5) → High-level design (10) → 2–3 deep dives (15) → Bottlenecks, failures, next steps (5).

## Classic system design

| # | Problem | Core insight | Must mention | Trap |
|---|---------|--------------|--------------|------|
| 1 | [URL shortener](../classic-system-design/01-url-shortener.md) | Read-heavy key→value lookup | Range-allocated IDs + base62, cache, 302 vs 301 | Guessable sequential codes |
| 2 | [Rate limiter](../classic-system-design/02-rate-limiter.md) | Atomic counters shared by all gateways | Token bucket / sliding window, Redis + Lua, fail open | Race conditions with GET-then-SET |
| 3 | [News feed](../classic-system-design/03-news-feed.md) | Precompute feeds, except for celebrities | Hybrid fan-out, timeline cache, ranking | 100M-follower fan-out on write |
| 4 | [Chat](../classic-system-design/04-chat-system.md) | Persist, then push; pull to resync | WebSockets, per-conversation sequence, dedupe | Client timestamps for ordering |
| 5 | [Notifications](../classic-system-design/05-notification-system.md) | Accept fast, deliver async with retries | Priority queues, idempotency keys, provider rate limits | Marketing blasts delaying OTPs |
| 6 | [Key-value store](../classic-system-design/06-distributed-key-value-store.md) | Leaderless replicas + quorums | Consistent hashing, R+W>N, hinted handoff, Merkle trees | Conflict resolution under skew |
| 7 | [Web crawler](../classic-system-design/07-web-crawler.md) | Politeness per host is the hard part | URL frontier (priority + per-host queues), Bloom filter, SimHash | Crawler traps |
| 8 | [Video streaming](../classic-system-design/08-video-streaming.md) | Bandwidth dominates → CDN | Chunked parallel transcoding, ABR (HLS/DASH), multipart upload | Transcoding everything upfront |
| 9 | [Ride sharing](../classic-system-design/09-ride-sharing.md) | 500k location writes/s, latest only | In-memory geo index (H3/geohash), atomic driver reservation | Storing locations in SQL |
| 10 | [Autocomplete](../classic-system-design/10-search-autocomplete.md) | Precompute top-k per prefix | Trie with cached top-k, offline aggregation, edge cache | Updating the trie per query |
| 11 | [File storage](../classic-system-design/11-file-storage.md) | Content-addressed blocks | Chunking + dedup, metadata journal, conflict copies | Re-uploading whole files |
| 12 | [Payments](../classic-system-design/12-payment-system.md) | Correctness over throughput | Idempotency keys, double-entry ledger, outbox, reconciliation | Retrying a timed-out charge with a new key |
| 13 | [Message queue](../classic-system-design/13-distributed-message-queue.md) | Partitioned append-only log | Segments + page cache, ISR replication, consumer groups | Global ordering expectations |
| 14 | [Ticket booking](../classic-system-design/14-ticket-booking.md) | Small inventory, huge contention | Conditional row updates, holds with expiry, waiting room | Eventual consistency for seats |
| 15 | [Collaborative editor](../classic-system-design/15-collaborative-editor.md) | Concurrent edits must converge | OT (central server) vs CRDTs, op log + snapshots | Applying position-based ops naively |
| 16 | [Job scheduler](../classic-system-design/16-distributed-job-scheduler.md) | Never miss, rarely duplicate | Shard leases, unique (job, tick), heartbeats, jitter | Thundering herd at :00 |
| 17 | [Leaderboard / top-K](../classic-system-design/17-leaderboard-top-k.md) | Sorted sets for rank; sketches for streams | Redis ZSET, Count-Min Sketch, partition by key | SQL COUNT(*) for rank |
| 18 | [Metrics monitoring](../classic-system-design/18-metrics-monitoring.md) | Time series compress extremely well | TSDB (Gorilla), rollups, cardinality limits, alert dedupe | Averaging percentiles |
| 19 | [Proximity (Yelp)](../classic-system-design/19-proximity-service.md) | Static points → replicated in-memory index | Geohash + 8 neighbors or quadtree, read replicas | Cell-boundary misses |
| 20 | [Hotel reservation](../classic-system-design/20-hotel-reservation.md) | Inventory per room type per night | Atomic multi-night update, idempotency, overbooking limit | Double-click double bookings |
| 21 | [Stock exchange](../classic-system-design/21-stock-exchange.md) | Deterministic single-threaded matching | Sequencer, event-sourced journal, hot standby, price-time priority | Multithreaded matching with locks |
| 22 | [Unique IDs](../classic-system-design/22-unique-id-generator.md) | Time + machine + sequence in 64 bits | Snowflake layout, machine-ID leasing, clock rollback | Clocks moving backwards |
| 23 | [Object storage (S3)](../classic-system-design/23-object-storage.md) | Separate metadata from bytes | Erasure coding, commit metadata last, multipart upload | 3× replication cost at exabyte scale |
| 24 | [Email (Gmail)](../classic-system-design/24-email-service.md) | Durable queue before SMTP 250 OK | MX/SMTP, per-user partitioning, spam filtering, per-user search | Losing mail after acknowledging |
| 25 | [Ad click aggregation](../classic-system-design/25-ad-click-aggregation.md) | Billing-grade streaming counts | Event-time windows, watermarks, checkpoints, reconciliation | Processing-time windows |
| 26 | [Online judge](../classic-system-design/26-online-code-judge.md) | Running untrusted code safely | microVM/gVisor sandbox, cgroup limits, no network, queues | Fork bombs and network access |
| 27 | [Live streaming](../classic-system-design/27-live-streaming.md) | Segments cached at the edge | RTMP ingest, real-time ABR, LL-HLS, chat fan-out batching | Sending every chat message to 2M viewers |
| 28 | [Web search](../classic-system-design/28-web-search-engine.md) | Inverted index + staged ranking | Document-partitioned shards, BM25/PageRank, re-ranker, result cache | Term-partitioning hot spots |

## AI system design

| # | Problem | Core insight | Must mention | Trap |
|---|---------|--------------|--------------|------|
| 1 | [RAG assistant](../ai-system-design/01-rag-enterprise-assistant.md) | Retrieval quality + permissions decide everything | Chunking, hybrid search, reranking, ACL pre-filter, citations | Filtering permissions after generation |
| 2 | [LLM serving](../ai-system-design/02-llm-inference-serving.md) | Decode is memory-bound; KV cache limits concurrency | Continuous batching, PagedAttention, prefix caching, quantization | Scaling on CPU utilization |
| 3 | [Recommendations](../ai-system-design/03-recommendation-system.md) | Funnel: cheap→expensive models | Two-tower + ANN, multi-task ranker, feature logging, exploration | Optimizing clicks only |
| 4 | [ChatGPT-style assistant](../ai-system-design/04-conversational-assistant.md) | Tokens are the cost; stream everything | Resumable streams, context management, memory, sandboxed tools | Re-sending entire history every turn |
| 5 | [Agent platform](../ai-system-design/05-ai-agent-platform.md) | Durable loop + least-privilege tools | Workflow engine, idempotent tools, policy engine, approvals | Trusting the prompt for safety |
| 6 | [Vector search](../ai-system-design/06-semantic-search-vector-db.md) | ANN trades recall for speed/memory | HNSW vs IVF-PQ, filtered search, hybrid, re-ranking | Selective filters killing recall |
| 7 | [Content moderation](../ai-system-design/07-content-moderation.md) | Cascade cheap → expensive → humans | Hash matching, thresholds by precision, review queues, appeals | Accuracy on imbalanced data |
| 8 | [Fraud detection](../ai-system-design/08-fraud-detection.md) | Real-time features + label delay | Velocity features, GBDT, cost-based thresholds, fallback rules | Training-serving skew |
| 9 | [ML platform](../ai-system-design/09-ml-platform.md) | Define features once for train and serve | Feature store, point-in-time joins, registry, eval gates, drift | Leakage from future data |
| 10 | [LLM evals & guardrails](../ai-system-design/10-llm-evaluation-guardrails.md) | Evals are the test suite | Golden/adversarial sets, calibrated LLM judges, input/output guards | Relying on injection classifiers alone |
| 11 | [Code assistant](../ai-system-design/11-ai-code-assistant.md) | Completion latency is everything | FIM, client context, cancel/debounce, code RAG | Large model for inline completion |
| 12 | [Text-to-SQL](../ai-system-design/12-text-to-sql-analytics.md) | Semantics matter more than SQL syntax | Semantic layer, schema retrieval, validation loop, run as user | Trusting raw generated SQL |
| 13 | [Ad CTR prediction](../ai-system-design/13-ad-click-prediction.md) | Calibration feeds the auction | Embeddings, delayed feedback, negative-sampling correction, pacing | Good AUC, bad calibration |
| 14 | [Image generation](../ai-system-design/14-image-generation-service.md) | GPU-seconds per image is the cost | Step distillation, batching, tiered queues, layered safety | Synchronous request model |
| 15 | [Voice assistant](../ai-system-design/15-voice-assistant.md) | Sub-second voice-to-voice budget | Streaming ASR→LLM→TTS, end-of-turn detection, barge-in | Waiting for full LLM response before TTS |
| 16 | [Document extraction](../ai-system-design/16-document-extraction.md) | Calibrated confidence drives review cost | OCR + layout, VLM extraction, grounding, validation rules | Hallucinated values not on the page |
| 17 | [LLM gateway](../ai-system-design/17-llm-gateway.md) | One control point for all model traffic | Aliases, fallback before first token, token/$ quotas, caching | Silent mid-stream provider switching |
| 18 | [AI answer engine](../ai-system-design/18-ai-answer-engine.md) | Fresh retrieval + verified citations | Query planning, live fetch with page cache, reranking, citation check | Injection via web pages |
| 19 | [Deep research](../ai-system-design/19-deep-research-agent.md) | Parallel subagents with isolated contexts | Orchestrator–worker, findings store, durable execution, budgets | Multi-agent for simple questions |
| 20 | [Coding agent](../ai-system-design/20-autonomous-coding-agent.md) | Isolation contains a manipulated model | microVM sandbox, egress allowlist, scoped tokens, PR review | Agent weakening tests to pass |
| 21 | [Support agent](../ai-system-design/21-ai-customer-support-agent.md) | LLM understands, code enforces policy | Policy engine, scoped tools, escalation, simulated-customer evals | Refund limits in the prompt only |
| 22 | [MCP tool platform](../ai-system-design/22-mcp-tool-platform.md) | Agents act with the user's own permissions | Delegated OAuth, policy per tool call, registry, audit | Admin API keys for agents |
| 23 | [Fine-tuning platform](../ai-system-design/23-llm-fine-tuning-platform.md) | Fine-tune behavior, retrieve knowledge | LoRA/QLoRA, DPO, data validation, regression + safety evals | Fine-tuning to teach facts |
| 24 | [Distributed training](../ai-system-design/24-distributed-llm-training.md) | Failures are daily; goodput matters | 6ND math, TP/PP/DP/FSDP, async checkpoints, stragglers | One slow GPU slowing 16k |
| 25 | [Pretraining data](../ai-system-design/25-llm-pretraining-data-pipeline.md) | Quality and dedup beat raw volume | Heuristics, MinHash dedup, quality classifiers, PII, decontamination | Benchmark contamination |
| 26 | [Meeting assistant](../ai-system-design/26-ai-meeting-assistant.md) | Fast live pass, accurate final pass | Streaming ASR + diarization, hierarchical summaries, permissioned search | Action items for non-participants |

## Closing lines that always work

- "The main bottleneck at 10× scale would be ___; I'd address it by ___."
- "If ___ fails, users see ___; we mitigate with ___."
- "I chose ___ over ___ because of ___, accepting ___."
- "To know it's working, I'd measure ___ offline and ___ online."
