# System Design Interview Questions & Solutions

A collection of system design interview questions with full worked solutions, split into two tracks:

1. **Classic system design** – distributed systems problems asked at most backend / infrastructure interviews.
2. **AI system design** – ML and LLM-powered systems, increasingly asked for ML engineer, AI engineer, and applied-scientist roles.

Every solution follows the same structure so you can practice a repeatable approach:

1. Problem statement & clarifying questions
2. Functional / non-functional requirements
3. Back-of-the-envelope estimation
4. API design
5. Data model
6. High-level architecture (Mermaid diagram)
7. Deep dives on the hardest components
8. Trade-offs, bottlenecks, and failure modes
9. Follow-up interview questions with model answers

Start with the [interview framework](framework.md) — it explains how to run a 45–60 minute interview and has the reference numbers used in the estimates.

## Classic System Design

| # | Problem | Key concepts |
|---|---------|--------------|
| 1 | [URL Shortener (TinyURL / bit.ly)](classic-system-design/01-url-shortener.md) | ID generation, base62, caching, read-heavy scaling |
| 2 | [Distributed Rate Limiter](classic-system-design/02-rate-limiter.md) | Token bucket, sliding window, Redis + Lua, consistency |
| 3 | [News Feed (Twitter / Instagram)](classic-system-design/03-news-feed.md) | Fan-out on write vs read, celebrity problem, ranking |
| 4 | [Chat System (WhatsApp / Slack)](classic-system-design/04-chat-system.md) | WebSockets, message ordering, presence, delivery receipts |
| 5 | [Notification System](classic-system-design/05-notification-system.md) | Queues, retries, idempotency, multi-channel delivery |
| 6 | [Distributed Key-Value Store / Cache](classic-system-design/06-distributed-key-value-store.md) | Consistent hashing, replication, quorum, CAP |
| 7 | [Web Crawler](classic-system-design/07-web-crawler.md) | URL frontier, politeness, dedup, Bloom filters |
| 8 | [Video Streaming (YouTube / Netflix)](classic-system-design/08-video-streaming.md) | Transcoding pipeline, adaptive bitrate, CDN |
| 9 | [Ride Sharing (Uber / Lyft)](classic-system-design/09-ride-sharing.md) | Geospatial indexing, matching, location updates |
| 10 | [Search Autocomplete / Typeahead](classic-system-design/10-search-autocomplete.md) | Tries, top-k, offline aggregation, caching |
| 11 | [Cloud File Storage (Dropbox / Google Drive)](classic-system-design/11-file-storage.md) | Chunking, dedup, sync, conflict resolution |
| 12 | [Payment System](classic-system-design/12-payment-system.md) | Idempotency, double-entry ledger, reconciliation, sagas |

## AI System Design

| # | Problem | Key concepts |
|---|---------|--------------|
| 1 | [RAG-based Enterprise Q&A Assistant](ai-system-design/01-rag-enterprise-assistant.md) | Chunking, embeddings, hybrid retrieval, reranking, ACLs, citations |
| 2 | [LLM Inference Serving Platform](ai-system-design/02-llm-inference-serving.md) | Continuous batching, KV cache, quantization, autoscaling GPUs |
| 3 | [Recommendation System (YouTube / TikTok)](ai-system-design/03-recommendation-system.md) | Two-tower retrieval, ranking, feature store, exploration |
| 4 | [ChatGPT-style Conversational Assistant](ai-system-design/04-conversational-assistant.md) | Streaming, context management, memory, safety, tools |
| 5 | [AI Agent Platform (tool-using agents)](ai-system-design/05-ai-agent-platform.md) | Agent loop, tool sandboxing, planning, durable execution |
| 6 | [Semantic Search / Vector Database](ai-system-design/06-semantic-search-vector-db.md) | ANN indexes (HNSW, IVF-PQ), sharding, filtering |
| 7 | [Content Moderation System](ai-system-design/07-content-moderation.md) | Multi-modal classifiers, cascades, human review, feedback loops |
| 8 | [Real-time Fraud Detection](ai-system-design/08-fraud-detection.md) | Streaming features, low-latency scoring, label delay, imbalance |
| 9 | [ML Training & Feature Platform (MLOps)](ai-system-design/09-ml-platform.md) | Feature store, training-serving skew, model registry, CI/CD for ML |
| 10 | [LLM Evaluation & Guardrails System](ai-system-design/10-llm-evaluation-guardrails.md) | Offline evals, LLM-as-judge, online monitoring, prompt injection defense |

## How to use this repo

- **Practice first, read second.** Read only the problem statement, set a 45-minute timer, sketch your own design, then compare.
- **Focus on the deep dives.** Interviewers differentiate candidates on the 2–3 hardest components, not on boxes-and-arrows.
- **Say the trade-offs out loud.** Every design choice in these solutions lists what was given up. Interviewers want to hear that reasoning.
- **Use the follow-up questions** as a mock-interview script with a friend.
