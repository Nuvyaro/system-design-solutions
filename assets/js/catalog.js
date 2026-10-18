// Content catalog: every page the site can render. Paths are Markdown files relative to the site root.
window.CATALOG = [
  {
    id: "start",
    title: "Start here",
    blurb: "How to run a system design interview and the numbers you need.",
    items: [
      { path: "framework", title: "The Interview Framework", desc: "Time budget, clarifying questions, reference numbers, building blocks.", mins: 10 }
    ]
  },
  {
    id: "prep",
    title: "Interview Prep: Mocks, Mistakes, Rubric & Cheat Sheet",
    blurb: "See full mock interviews, avoid the classic mistakes, grade yourself, and review all problems on one page.",
    kind: "lesson",
    items: [
      { path: "interview-prep/01-mock-interview-url-shortener", title: "Mock Interview: URL Shortener", desc: "Full mid-level transcript with coaching notes.", mins: 15, sim: true },
      { path: "interview-prep/02-mock-interview-rag-assistant", title: "Mock Interview: RAG Assistant", desc: "AI engineer interview, including a recovery from a weak answer.", mins: 15, sim: true },
      { path: "interview-prep/03-mock-interview-chat-system", title: "Mock Interview: Chat (Hard Pushback)", desc: "Senior interview: defending, adapting, disagreeing politely.", mins: 15, sim: true },
      { path: "interview-prep/04-common-mistakes", title: "20 Common Mistakes", desc: "What candidates do wrong and what to say instead.", mins: 10, sim: true },
      { path: "interview-prep/05-scoring-rubric", title: "Scoring Rubric", desc: "How interviewers grade, junior to staff, with a score sheet.", mins: 8, sim: true },
      { path: "interview-prep/06-cheat-sheet", title: "Night-Before Cheat Sheet", desc: "All 54 problems: core insight, must-mention, trap.", mins: 12 }
    ]
  },
  {
    id: "fund-systems",
    title: "Fundamentals: Distributed Systems",
    blurb: "Short animated lessons on the building blocks every design uses.",
    kind: "lesson",
    items: [
      { path: "fundamentals/systems/01-scalability-basics", title: "Scalability Basics", desc: "Vertical vs horizontal scaling and stateless servers.", mins: 6, sim: true },
      { path: "fundamentals/systems/02-load-balancing", title: "Load Balancing", desc: "Spread traffic, health checks, L4 vs L7, algorithms.", mins: 6, sim: true },
      { path: "fundamentals/systems/03-caching", title: "Caching", desc: "Hits, misses, eviction, invalidation, stampedes.", mins: 8, sim: true },
      { path: "fundamentals/systems/04-databases-and-indexing", title: "Databases & Indexing", desc: "SQL vs NoSQL, B-trees, how to choose a database.", mins: 8, sim: true },
      { path: "fundamentals/systems/05-replication", title: "Replication", desc: "Leaders, followers, lag, quorums.", mins: 7, sim: true },
      { path: "fundamentals/systems/06-sharding-and-consistent-hashing", title: "Sharding & Consistent Hashing", desc: "Split data across machines; move little when scaling.", mins: 8, sim: true },
      { path: "fundamentals/systems/07-cap-and-consistency", title: "CAP & Consistency", desc: "What happens during a network partition.", mins: 7, sim: true },
      { path: "fundamentals/systems/08-message-queues", title: "Message Queues", desc: "Async work, buffering spikes, delivery guarantees.", mins: 7, sim: true },
      { path: "fundamentals/systems/09-reliability-patterns", title: "Reliability Patterns", desc: "Timeouts, retries, circuit breakers, rate limits, SLOs.", mins: 9, sim: true },
      { path: "fundamentals/systems/10-back-of-envelope-estimation", title: "Back-of-Envelope Estimation", desc: "QPS, storage, bandwidth in two minutes.", mins: 6, sim: true },
      { path: "fundamentals/systems/11-networking-cdn-and-apis", title: "Networking, CDNs & APIs", desc: "Life of a request; REST, gRPC, WebSockets, SSE.", mins: 8, sim: true },
      { path: "fundamentals/systems/12-consensus-and-raft", title: "Consensus & Raft", desc: "Leader election, log replication, majorities.", mins: 9, sim: true },
      { path: "fundamentals/systems/13-distributed-transactions-and-sagas", title: "Distributed Transactions & Sagas", desc: "Two-phase commit vs sagas with compensations.", mins: 9, sim: true },
      { path: "fundamentals/systems/14-bloom-filters", title: "Bloom Filters & Sketches", desc: "Probably yes, definitely no — plus HyperLogLog and friends.", mins: 7, sim: true }
    ]
  },
  {
    id: "fund-ai",
    title: "Fundamentals: AI & ML Systems",
    blurb: "The AI concepts behind modern ML and LLM system design, visualized.",
    kind: "lesson",
    items: [
      { path: "fundamentals/ai/01-ml-system-lifecycle", title: "The ML System Lifecycle", desc: "Data → train → evaluate → deploy → monitor → repeat.", mins: 7, sim: true },
      { path: "fundamentals/ai/02-embeddings-and-vector-search", title: "Embeddings & Vector Search", desc: "Meaning as numbers; nearest-neighbor search.", mins: 8, sim: true },
      { path: "fundamentals/ai/03-how-llms-generate-text", title: "How LLMs Generate Text", desc: "Tokens, prefill, decode, the KV cache.", mins: 8, sim: true },
      { path: "fundamentals/ai/04-llm-serving-and-batching", title: "LLM Serving & Batching", desc: "Continuous batching, prefix caching, latency vs throughput.", mins: 7, sim: true },
      { path: "fundamentals/ai/05-rag-explained", title: "RAG Explained", desc: "Retrieve, then generate — with citations.", mins: 8, sim: true },
      { path: "fundamentals/ai/06-recommendation-funnel", title: "The Recommendation Funnel", desc: "Retrieval → ranking → re-ranking.", mins: 7, sim: true },
      { path: "fundamentals/ai/07-ai-agents-explained", title: "AI Agents", desc: "The think → act → observe loop and how to make it safe.", mins: 7, sim: true },
      { path: "fundamentals/ai/08-evaluation-metrics", title: "Evaluation Metrics", desc: "Precision, recall, thresholds, ranking metrics, LLM evals.", mins: 8, sim: true },
      { path: "fundamentals/ai/09-how-genai-changes-system-design", title: "How GenAI Changes System Design", desc: "Tokens, latency, evals, guardrails — plus a cost calculator.", mins: 9, sim: true }
    ]
  },
  {
    id: "devops",
    title: "DevOps: Docker, Kubernetes & CI/CD",
    blurb: "From your first container to production Kubernetes with automated pipelines. Every YAML file is real and tested.",
    kind: "lesson",
    items: [
      { path: "devops/01-containers-and-docker-basics", title: "Docker 1: Containers & Basics", desc: "Images vs containers, essential commands.", mins: 10, sim: true },
      { path: "devops/02-writing-dockerfiles", title: "Docker 2: Writing Dockerfiles", desc: "Instructions, layer caching, multi-stage, security.", mins: 12, sim: true },
      { path: "devops/03-docker-networking-volumes-compose", title: "Docker 3: Networks, Volumes & Compose", desc: "Multi-container apps with docker-compose.yml.", mins: 12, sim: true },
      { path: "devops/04-yaml-for-devops", title: "YAML for DevOps", desc: "Syntax, multi-line strings, anchors, gotchas — with a live playground.", mins: 10, sim: true },
      { path: "devops/05-kubernetes-architecture", title: "Kubernetes 1: Architecture", desc: "Control plane, nodes, reconciliation, kubectl.", mins: 12, sim: true },
      { path: "devops/06-kubernetes-workloads", title: "Kubernetes 2: Workloads", desc: "Deployments, StatefulSets, DaemonSets, Jobs, rollouts.", mins: 14, sim: true },
      { path: "devops/07-kubernetes-networking", title: "Kubernetes 3: Networking", desc: "Services, DNS, Ingress, Gateway API, NetworkPolicy.", mins: 12, sim: true },
      { path: "devops/08-kubernetes-config-and-storage", title: "Kubernetes 4: Config & Storage", desc: "ConfigMaps, Secrets, PV/PVC, StorageClass.", mins: 10, sim: true },
      { path: "devops/09-kubernetes-production-readiness", title: "Kubernetes 5: Production Readiness", desc: "Resources, probes, autoscaling, PDBs, RBAC, security.", mins: 16, sim: true },
      { path: "devops/10-helm-and-kustomize", title: "Kubernetes 6: Helm & Kustomize", desc: "Overlays, charts, values, releases.", mins: 12, sim: true },
      { path: "devops/11-ci-cd-with-github-actions", title: "CI/CD 1: GitHub Actions", desc: "Test → build → scan → push → deploy, with approvals.", mins: 16, sim: true },
      { path: "devops/12-gitops-and-deployment-strategies", title: "CI/CD 2: GitOps & Deploy Strategies", desc: "Argo CD, blue/green, canary, safe migrations.", mins: 12, sim: true },
      { path: "devops/13-capstone-end-to-end", title: "Capstone: Code to Production", desc: "Hands-on project tying everything together.", mins: 90, sim: true },
      { path: "devops/14-troubleshooting-cheatsheet", title: "Troubleshooting & Cheat Sheet", desc: "Pod statuses, kubectl/docker commands, CI fixes.", mins: 8, sim: true }
    ]
  },
  {
    id: "classic",
    title: "Classic System Design Problems",
    blurb: "Full interview questions with worked solutions.",
    kind: "problem",
    items: [
      { path: "classic-system-design/01-url-shortener", title: "URL Shortener", desc: "ID generation, base62, caching, read-heavy scaling.", mins: 20 },
      { path: "classic-system-design/02-rate-limiter", title: "Distributed Rate Limiter", desc: "Token bucket, sliding window, Redis + Lua.", mins: 20 },
      { path: "classic-system-design/03-news-feed", title: "News Feed", desc: "Fan-out on write vs read, the celebrity problem.", mins: 25 },
      { path: "classic-system-design/04-chat-system", title: "Chat System", desc: "WebSockets, ordering, presence, receipts.", mins: 25 },
      { path: "classic-system-design/05-notification-system", title: "Notification System", desc: "Queues, retries, idempotency, channels.", mins: 20 },
      { path: "classic-system-design/06-distributed-key-value-store", title: "Distributed Key-Value Store", desc: "Consistent hashing, quorums, LSM trees.", mins: 25 },
      { path: "classic-system-design/07-web-crawler", title: "Web Crawler", desc: "URL frontier, politeness, dedup.", mins: 20 },
      { path: "classic-system-design/08-video-streaming", title: "Video Streaming", desc: "Transcoding, adaptive bitrate, CDN.", mins: 25 },
      { path: "classic-system-design/09-ride-sharing", title: "Ride Sharing", desc: "Geospatial indexing, matching, live tracking.", mins: 25 },
      { path: "classic-system-design/10-search-autocomplete", title: "Search Autocomplete", desc: "Tries, top-k, edge caching.", mins: 20 },
      { path: "classic-system-design/11-file-storage", title: "Cloud File Storage", desc: "Chunking, dedup, sync, conflicts.", mins: 25 },
      { path: "classic-system-design/12-payment-system", title: "Payment System", desc: "Idempotency, ledgers, reconciliation.", mins: 25 },
      { path: "classic-system-design/13-distributed-message-queue", title: "Distributed Message Queue", desc: "Partitioned logs, replication, consumer groups.", mins: 25 },
      { path: "classic-system-design/14-ticket-booking", title: "Ticket Booking", desc: "Seat holds, locking, waiting rooms.", mins: 20 },
      { path: "classic-system-design/15-collaborative-editor", title: "Collaborative Editor", desc: "OT vs CRDTs, op logs, presence.", mins: 25 },
      { path: "classic-system-design/16-distributed-job-scheduler", title: "Distributed Job Scheduler", desc: "Shard leases, timer wheels, misfires.", mins: 20 },
      { path: "classic-system-design/17-leaderboard-top-k", title: "Leaderboard & Top-K", desc: "Sorted sets, Count-Min Sketch, windows.", mins: 20 },
      { path: "classic-system-design/18-metrics-monitoring", title: "Metrics Monitoring", desc: "Time-series storage, rollups, alerting.", mins: 25 },
      { path: "classic-system-design/19-proximity-service", title: "Proximity Service (Yelp)", desc: "Geohash, quadtrees, nearby search.", mins: 20 },
      { path: "classic-system-design/20-hotel-reservation", title: "Hotel Reservation", desc: "Inventory per night, no overbooking.", mins: 20 },
      { path: "classic-system-design/21-stock-exchange", title: "Stock Exchange", desc: "Order books, matching engine, determinism.", mins: 25 },
      { path: "classic-system-design/22-unique-id-generator", title: "Unique ID Generator", desc: "Snowflake IDs, clocks, machine IDs.", mins: 15 },
      { path: "classic-system-design/23-object-storage", title: "Object Storage (S3)", desc: "Metadata vs data, erasure coding.", mins: 25 },
      { path: "classic-system-design/24-email-service", title: "Email Service (Gmail)", desc: "SMTP, mailboxes, spam, search.", mins: 20 },
      { path: "classic-system-design/25-ad-click-aggregation", title: "Ad Click Aggregation", desc: "Exactly-once streaming counts.", mins: 20 },
      { path: "classic-system-design/26-online-code-judge", title: "Online Code Judge (LeetCode)", desc: "Sandboxing untrusted code, contests.", mins: 20 },
      { path: "classic-system-design/27-live-streaming", title: "Live Streaming (Twitch)", desc: "Low-latency video and live chat.", mins: 20 },
      { path: "classic-system-design/28-web-search-engine", title: "Web Search Engine", desc: "Inverted index, sharding, ranking.", mins: 25 }
    ]
  },
  {
    id: "ai",
    title: "AI System Design Problems",
    blurb: "ML and LLM systems as asked in AI engineer and ML engineer interviews.",
    kind: "problem",
    items: [
      { path: "ai-system-design/01-rag-enterprise-assistant", title: "RAG Enterprise Assistant", desc: "Hybrid retrieval, permissions, citations.", mins: 25 },
      { path: "ai-system-design/02-llm-inference-serving", title: "LLM Inference Serving", desc: "Batching, KV cache, quantization, GPUs.", mins: 25 },
      { path: "ai-system-design/03-recommendation-system", title: "Recommendation System", desc: "Two-tower retrieval, ranking, exploration.", mins: 25 },
      { path: "ai-system-design/04-conversational-assistant", title: "Conversational Assistant", desc: "Streaming, context, memory, tools.", mins: 25 },
      { path: "ai-system-design/05-ai-agent-platform", title: "AI Agent Platform", desc: "Durable agent loops, sandboxed tools.", mins: 25 },
      { path: "ai-system-design/06-semantic-search-vector-db", title: "Semantic Search / Vector DB", desc: "HNSW, IVF-PQ, filtering, sharding.", mins: 25 },
      { path: "ai-system-design/07-content-moderation", title: "Content Moderation", desc: "Classifier cascades, human review.", mins: 20 },
      { path: "ai-system-design/08-fraud-detection", title: "Real-time Fraud Detection", desc: "Streaming features, label delay.", mins: 20 },
      { path: "ai-system-design/09-ml-platform", title: "ML Training & Feature Platform", desc: "Feature store, registry, CI/CD for ML.", mins: 25 },
      { path: "ai-system-design/10-llm-evaluation-guardrails", title: "LLM Evaluation & Guardrails", desc: "LLM judges, injection defense.", mins: 20 },
      { path: "ai-system-design/11-ai-code-assistant", title: "AI Code Assistant", desc: "Fill-in-the-middle completion, code RAG.", mins: 20 },
      { path: "ai-system-design/12-text-to-sql-analytics", title: "Text-to-SQL Analytics", desc: "Semantic layer, validation loop.", mins: 20 },
      { path: "ai-system-design/13-ad-click-prediction", title: "Ad Click Prediction", desc: "CTR models, calibration, auctions.", mins: 20 },
      { path: "ai-system-design/14-image-generation-service", title: "Image Generation Service", desc: "Diffusion serving, GPU scheduling, safety.", mins: 20 },
      { path: "ai-system-design/15-voice-assistant", title: "Real-time Voice Assistant", desc: "Streaming speech pipeline, barge-in.", mins: 20 },
      { path: "ai-system-design/16-document-extraction", title: "Document Extraction", desc: "OCR, layout models, grounded extraction.", mins: 20 },
      { path: "ai-system-design/17-llm-gateway", title: "LLM Gateway", desc: "Routing, fallback, token budgets, caching.", mins: 20 },
      { path: "ai-system-design/18-ai-answer-engine", title: "AI Answer Engine (Perplexity)", desc: "Live web retrieval with citations.", mins: 20 },
      { path: "ai-system-design/19-deep-research-agent", title: "Deep Research Multi-Agent", desc: "Orchestrator-worker agents, long tasks.", mins: 25 },
      { path: "ai-system-design/20-autonomous-coding-agent", title: "Autonomous Coding Agent", desc: "Cloud sandboxes, tests, PRs.", mins: 25 },
      { path: "ai-system-design/21-ai-customer-support-agent", title: "AI Customer Support Agent", desc: "Policy engine, tools, escalation.", mins: 20 },
      { path: "ai-system-design/22-mcp-tool-platform", title: "MCP Tool Platform", desc: "Agent tools with auth, policy, audit.", mins: 20 },
      { path: "ai-system-design/23-llm-fine-tuning-platform", title: "LLM Fine-Tuning Platform", desc: "LoRA, DPO, eval gates, deployment.", mins: 25 },
      { path: "ai-system-design/24-distributed-llm-training", title: "Distributed LLM Training", desc: "Parallelism, failures, checkpoints.", mins: 25 },
      { path: "ai-system-design/25-llm-pretraining-data-pipeline", title: "LLM Pretraining Data Pipeline", desc: "Filtering, dedup, mixtures.", mins: 20 },
      { path: "ai-system-design/26-ai-meeting-assistant", title: "AI Meeting Assistant", desc: "Live captions, summaries, action items.", mins: 20 }
    ]
  }
];
