# System Design Ocean: System Design, AI System Design & DevOps

Animated, beginner-friendly tutorials plus full interview solutions, in four tracks:

1. **Fundamentals**: short lessons on the building blocks (caching, sharding, queues, embeddings, LLM inference, RAG…), each with an interactive simulation.
2. **Classic system design**: distributed systems problems asked at most backend / infrastructure interviews.
3. **AI system design**: ML and LLM-powered systems, increasingly asked for ML engineer, AI engineer, and applied-scientist roles.
4. **DevOps**: Docker, Kubernetes, YAML, CI/CD, disaster recovery and reliability engineering from basics to production, with real, tested example files.

## 🌊 The website

Everything here is also an animated website: open `index.html` through GitHub Pages or any static server.

- **Live site (after enabling Pages):** `https://nuvyaro.github.io/system-design-solutions/`
- **Enable GitHub Pages:** repository **Settings → Pages → Build and deployment → Source: Deploy from a branch**, choose the branch (e.g. `main`) and folder **`/ (root)`**, then **Save**. No build step is needed.
- **Run locally:** `python3 -m http.server 8000` in the repo root, then open http://localhost:8000.

Site features: 40+ interactive simulations, animated diagrams, practice mode with a 45-minute timer, tap-to-reveal follow-up questions, progress tracking (stored in your browser), search, and dark mode. The Markdown files are the single source of truth: the site renders them directly, so anything you edit here shows up on the site.

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

## Interview Prep

| Guide | What you get |
|-------|--------------|
| [Mock interview: URL shortener](interview-prep/01-mock-interview-url-shortener.md) | Full mid-level transcript with coaching notes |
| [Mock interview: RAG assistant](interview-prep/02-mock-interview-rag-assistant.md) | AI engineer interview, including recovering from a weak answer |
| [Mock interview: chat system](interview-prep/03-mock-interview-chat-system.md) | Senior interview with hard pushback and polite disagreement |
| [20 common mistakes](interview-prep/04-common-mistakes.md) | What candidates do wrong and exactly what to say instead |
| [Scoring rubric](interview-prep/05-scoring-rubric.md) | How interviewers grade, junior → staff, with a score sheet |
| [Night-before cheat sheet](interview-prep/06-cheat-sheet.md) | All 54 problems: core insight, must-mention components, trap |

## Software Design Principles (based on *Code Simplicity*)

Lessons summarizing and applying the ideas of *Code Simplicity: The Fundamentals of Software* by Max Kanat-Alexander (O'Reilly, 2012, ISBN 978-1-4493-1389-0), written in our own words with brief attributed quotes.

| # | Lesson | Simulation |
|---|--------|------------|
| 1 | [Purpose & the Equation of Design](software-design/01-purpose-and-the-equation-of-design.md) | Quick hack vs designed change over time |
| 2 | [Change & the Three Flaws](software-design/02-change-and-the-three-flaws.md) | Incremental development steps |
| 3 | [Defects, Small Changes & DRY](software-design/03-defects-small-changes-and-dry.md) | — |
| 4 | [Simplicity, Readability & Consistency](software-design/04-simplicity-readability-and-consistency.md) | — |
| 5 | [Complexity & How to Tame It](software-design/05-complexity-and-how-to-tame-it.md) | Complexity growth: n² vs modular |
| 6 | [Testing & the Six Laws](software-design/06-testing-and-the-six-laws.md) | What 'tested' means |
| 7 | [Applying Simplicity to System Design](software-design/07-applying-simplicity-to-system-design.md) | — |

## Fundamentals: Distributed Systems

| # | Lesson | Simulation |
|---|--------|------------|
| 1 | [Scalability Basics](fundamentals/systems/01-scalability-basics.md) | Add servers, watch load drop |
| 2 | [Load Balancing](fundamentals/systems/02-load-balancing.md) | Algorithms and failing servers |
| 3 | [Caching](fundamentals/systems/03-caching.md) | Hits, misses, LRU eviction |
| 4 | [Databases & Indexing](fundamentals/systems/04-databases-and-indexing.md) | Full scan vs index lookup |
| 5 | [Replication](fundamentals/systems/05-replication.md) | Replication lag and stale reads |
| 6 | [Sharding & Consistent Hashing](fundamentals/systems/06-sharding-and-consistent-hashing.md) | Hash ring: add/remove nodes |
| 7 | [CAP & Consistency](fundamentals/systems/07-cap-and-consistency.md) | Network partition: CP vs AP |
| 8 | [Message Queues](fundamentals/systems/08-message-queues.md) | Bursts, buffering, consumers |
| 9 | [Reliability Patterns](fundamentals/systems/09-reliability-patterns.md) | Circuit breaker, token bucket |
| 10 | [Back-of-Envelope Estimation](fundamentals/systems/10-back-of-envelope-estimation.md) | Live calculator |
| 11 | [Networking, CDNs & APIs](fundamentals/systems/11-networking-cdn-and-apis.md) | Life of a request |
| 12 | [Consensus & Raft](fundamentals/systems/12-consensus-and-raft.md) | 5-node Raft: kill the leader, watch the election |
| 13 | [Distributed Transactions & Sagas](fundamentals/systems/13-distributed-transactions-and-sagas.md) | Saga compensations vs two-phase commit |
| 14 | [Bloom Filters & Sketches](fundamentals/systems/14-bloom-filters.md) | Add/check words, see false positives |

## Fundamentals: AI & ML Systems

| # | Lesson | Simulation |
|---|--------|------------|
| 1 | [The ML System Lifecycle](fundamentals/ai/01-ml-system-lifecycle.md) | The ML loop |
| 2 | [Embeddings & Vector Search](fundamentals/ai/02-embeddings-and-vector-search.md) | Click to run nearest-neighbor search |
| 3 | [How LLMs Generate Text](fundamentals/ai/03-how-llms-generate-text.md) | Prefill, decode, KV cache, temperature |
| 4 | [LLM Serving & Batching](fundamentals/ai/04-llm-serving-and-batching.md) | Static vs continuous batching |
| 5 | [RAG Explained](fundamentals/ai/05-rag-explained.md) | The RAG pipeline |
| 6 | [The Recommendation Funnel](fundamentals/ai/06-recommendation-funnel.md) | 1 billion items → 20 |
| 7 | [AI Agents](fundamentals/ai/07-ai-agents-explained.md) | Agent loop + prompt injection |
| 8 | [Evaluation Metrics](fundamentals/ai/08-evaluation-metrics.md) | Drag the threshold: precision vs recall |
| 9 | [How GenAI Changes System Design](fundamentals/ai/09-how-genai-changes-system-design.md) | LLM cost & capacity calculator |

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
| 13 | [Distributed Message Queue (Kafka)](classic-system-design/13-distributed-message-queue.md) | Partitioned logs, ISR replication, consumer groups, exactly-once |
| 14 | [Ticket Booking (Ticketmaster)](classic-system-design/14-ticket-booking.md) | Seat holds, row locking, virtual waiting room, bot defense |
| 15 | [Collaborative Editor (Google Docs)](classic-system-design/15-collaborative-editor.md) | OT vs CRDTs, op logs, snapshots, presence |
| 16 | [Distributed Job Scheduler](classic-system-design/16-distributed-job-scheduler.md) | Shard leases, timer wheels, misfires, at-least-once execution |
| 17 | [Leaderboard & Top-K Heavy Hitters](classic-system-design/17-leaderboard-top-k.md) | Redis sorted sets, Count-Min Sketch, streaming windows |
| 18 | [Metrics Monitoring & Alerting](classic-system-design/18-metrics-monitoring.md) | Time-series DB, Gorilla compression, rollups, cardinality, alerting |
| 19 | [Proximity Service (Yelp / Nearby)](classic-system-design/19-proximity-service.md) | Geohash, quadtree, S2/H3, replicated geo index |
| 20 | [Hotel Reservation (Booking.com / Airbnb)](classic-system-design/20-hotel-reservation.md) | Inventory per night, transactions, idempotency, overbooking |
| 21 | [Stock Exchange (Order Matching)](classic-system-design/21-stock-exchange.md) | Order book, sequencer, event sourcing, low latency |
| 22 | [Unique ID Generator (Snowflake)](classic-system-design/22-unique-id-generator.md) | 64-bit IDs, clock skew, machine-ID leasing |
| 23 | [Object Storage (Amazon S3)](classic-system-design/23-object-storage.md) | Metadata/data split, erasure coding, multipart upload |
| 24 | [Email Service (Gmail)](classic-system-design/24-email-service.md) | SMTP/MX, per-user partitioning, spam filtering, search |
| 25 | [Ad Click Event Aggregation](classic-system-design/25-ad-click-aggregation.md) | Event-time windows, watermarks, exactly-once, reconciliation |
| 26 | [Online Code Judge (LeetCode)](classic-system-design/26-online-code-judge.md) | Sandboxing, resource limits, queues, contest leaderboards |
| 27 | [Live Streaming + Chat (Twitch)](classic-system-design/27-live-streaming.md) | RTMP ingest, LL-HLS, CDN fan-out, chat at scale |
| 28 | [Web Search Engine (Google)](classic-system-design/28-web-search-engine.md) | Inverted index, document sharding, BM25, PageRank, re-ranking |

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
| 11 | [AI Code Assistant (Copilot / Cursor)](ai-system-design/11-ai-code-assistant.md) | FIM completion, latency tricks, code RAG, multi-file edits |
| 12 | [Text-to-SQL Analytics Assistant](ai-system-design/12-text-to-sql-analytics.md) | Semantic layer, schema linking, validation loop, execution accuracy |
| 13 | [Ad Click Prediction & Ranking](ai-system-design/13-ad-click-prediction.md) | CTR models, calibration, auctions, pacing, delayed feedback |
| 14 | [Text-to-Image Generation Service](ai-system-design/14-image-generation-service.md) | Diffusion serving, step distillation, GPU scheduling, image safety |
| 15 | [Real-time Voice AI Assistant](ai-system-design/15-voice-assistant.md) | Streaming ASR→LLM→TTS, latency budget, barge-in, turn-taking |
| 16 | [Document Intelligence & Extraction](ai-system-design/16-document-extraction.md) | OCR + layout, VLM extraction, grounding, calibrated human review |
| 17 | [LLM Gateway (AI Gateway)](ai-system-design/17-llm-gateway.md) | Provider routing/fallback, token & $ quotas, semantic caching, cost attribution |
| 18 | [AI Answer Engine (Perplexity)](ai-system-design/18-ai-answer-engine.md) | Query planning, live web retrieval, cited generation, latency budget |
| 19 | [Deep Research Multi-Agent System](ai-system-design/19-deep-research-agent.md) | Orchestrator–worker agents, durable execution, findings store, verification |
| 20 | [Autonomous Coding Agent Platform](ai-system-design/20-autonomous-coding-agent.md) | microVM sandboxes, egress control, agent loop, steerable long runs |
| 21 | [AI Customer Support Agent](ai-system-design/21-ai-customer-support-agent.md) | LLM + deterministic policy engine, scoped tools, human handoff, simulated-customer evals |
| 22 | [Tool Integration Platform (MCP)](ai-system-design/22-mcp-tool-platform.md) | Model Context Protocol, delegated OAuth, policy engine, injection defenses |
| 23 | [LLM Fine-Tuning & Alignment Platform](ai-system-design/23-llm-fine-tuning-platform.md) | When to fine-tune, LoRA/QLoRA, DPO/RLHF, GPU scheduling, eval gates |
| 24 | [Distributed LLM Training Infrastructure](ai-system-design/24-distributed-llm-training.md) | 6ND compute math, TP/PP/DP/FSDP, failures & checkpointing, stability |
| 25 | [LLM Pretraining Data Pipeline](ai-system-design/25-llm-pretraining-data-pipeline.md) | Extraction, MinHash dedup, quality classifiers, PII, decontamination, mixtures |
| 26 | [AI Meeting Assistant](ai-system-design/26-ai-meeting-assistant.md) | Streaming ASR + diarization, hierarchical summarization, permissioned search |

## DevOps: Docker, Kubernetes, CI/CD & Disaster Recovery

| # | Tutorial | Level |
|---|----------|-------|
| 1 | [Containers & Docker Basics](devops/01-containers-and-docker-basics.md) | Beginner |
| 2 | [Writing Dockerfiles](devops/02-writing-dockerfiles.md) | Beginner → Intermediate |
| 3 | [Networking, Volumes & Docker Compose](devops/03-docker-networking-volumes-compose.md) | Intermediate |
| 4 | [YAML for DevOps](devops/04-yaml-for-devops.md) (with a live playground) | Beginner → Intermediate |
| 5 | [Kubernetes Architecture](devops/05-kubernetes-architecture.md) | Beginner |
| 6 | [Kubernetes Workloads](devops/06-kubernetes-workloads.md) | Beginner → Intermediate |
| 7 | [Kubernetes Networking](devops/07-kubernetes-networking.md) | Intermediate |
| 8 | [Config & Storage](devops/08-kubernetes-config-and-storage.md) | Intermediate |
| 9 | [Production Readiness](devops/09-kubernetes-production-readiness.md) | Advanced |
| 10 | [Helm & Kustomize](devops/10-helm-and-kustomize.md) | Intermediate → Advanced |
| 11 | [CI/CD with GitHub Actions](devops/11-ci-cd-with-github-actions.md) | Intermediate → Advanced |
| 12 | [GitOps & Deployment Strategies](devops/12-gitops-and-deployment-strategies.md) | Advanced |
| 13 | [Capstone: Code to Production](devops/13-capstone-end-to-end.md) | Hands-on |
| 14 | [Troubleshooting & Cheat Sheet](devops/14-troubleshooting-cheatsheet.md) | Reference |
| 15 | [Disaster Recovery & Business Continuity](devops/15-disaster-recovery-and-business-continuity.md) | Advanced |
| 16 | [Backup & Restore (DB, Kubernetes, ransomware)](devops/16-backup-and-restore.md) | Intermediate |
| 17 | [High Availability: Zones, Regions & Failover](devops/17-multi-region-high-availability.md) | Advanced |
| 18 | [Infrastructure as Code with Terraform](devops/18-infrastructure-as-code-terraform.md) | Intermediate → Advanced |
| 19 | [Observability, SLOs & Alerting](devops/19-observability-and-alerting.md) | Intermediate → Advanced |
| 20 | [Incident Response, On-Call & Postmortems](devops/20-incident-response-and-postmortems.md) | Intermediate |
| 21 | [Chaos Engineering, Game Days & DR Drills](devops/21-chaos-engineering-and-dr-drills.md) | Advanced |
| 22 | [DevSecOps & Supply-Chain Security](devops/22-devsecops-and-supply-chain-security.md) | Intermediate → Advanced |

The reliability examples in [`devops/examples/reliability`](devops/examples/reliability) include Terraform for immutable cross-region backups and DNS failover (passes `terraform validate` with the AWS provider), plus a PostgreSQL backup CronJob, Velero schedules, Prometheus SLO alerts and Chaos Mesh experiments (all schema-validated).

The [`devops/examples`](devops/examples) folder holds a working app with its Dockerfile, Compose file, Kubernetes manifests (Kustomize base + staging/production overlays), a Helm chart, and a GitHub Actions pipeline. They are verified: unit tests pass, the image builds and runs, the manifests and rendered chart pass `kubeconform` against Kubernetes 1.30, and the workflow passes `actionlint`.

## How to use this repo

- **Practice first, read second.** Read only the problem statement, set a 45-minute timer, sketch your own design, then compare.
- **Focus on the deep dives.** Interviewers differentiate candidates on the 2–3 hardest components, not on boxes-and-arrows.
- **Say the trade-offs out loud.** Every design choice in these solutions lists what was given up. Interviewers want to hear that reasoning.
- **Use the follow-up questions** as a mock-interview script with a friend.
