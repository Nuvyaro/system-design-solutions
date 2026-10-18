# 20 Common System Design Interview Mistakes (and What to Say Instead)

> Most candidates who fail don't lack knowledge — they make a handful of predictable process mistakes. Each item below shows the mistake, why it hurts, and a better line you can actually say.

<div class="sim" data-sim="pipeline" data-title="Where candidates lose points" data-steps="Jump to solution|Numbers without meaning|Buzzword soup|No trade-offs|Ignore failures|Run out of time" data-labels="No requirements = designing the wrong system|Estimates that never change the design|Naming Kafka/K8s without saying why|Every choice presented as obviously right|Happy path only|Never reach the deep dives"><em>Interactive animation available on the website.</em></div>

## Process mistakes

**1. Jumping straight into boxes and arrows.**
Why it hurts: you may design the wrong system and you signal poor engineering habits.
Say instead: *"Before designing, let me confirm the core features and scale. I'm assuming X, Y, Z — does that match what you have in mind?"*

**2. Asking 15 open-ended questions.**
Why it hurts: burns time; looks like you can't make decisions.
Say instead: *"I'll assume 100M daily users and a 10:1 read/write ratio unless you'd like different numbers."* Propose defaults, confirm, move on.

**3. Estimating without using the numbers.**
Why it hurts: arithmetic for its own sake earns nothing.
Say instead: *"30k reads per second with a 95% cache hit rate means the database sees ~1.5k QPS, so a single primary with replicas is enough."*

**4. Running out of time before deep dives.**
Why it hurts: the deep dive is where you're graded.
Do instead: keep requirements + estimates under ~10 minutes; announce the plan: *"I'll sketch the high level in ten minutes, then go deep on ID generation and caching."*

**5. Going silent while thinking.**
Why it hurts: the interviewer can't credit reasoning they don't hear.
Say instead: *"I'm weighing two options for storage — let me think out loud."*

**6. Not checking in.**
Say instead at transitions: *"That's the high-level picture. Would you like me to go deeper on the write path or the read path?"*

## Design mistakes

**7. Buzzword soup ("we'll add Kafka, Kubernetes, and a service mesh").**
Why it hurts: tools without reasons suggest memorization.
Say instead: *"We need to decouple upload from transcoding and absorb bursts, so I'll put a durable queue between them — Kafka or SQS would work."*

**8. Presenting choices without trade-offs.**
Say instead: *"I'll use fan-out on write for normal users because reads dominate, accepting heavier writes; celebrities use fan-out on read to avoid 100M inserts per post."*

**9. Picking a database by fashion.**
Say instead: decide by access pattern and consistency: *"Seat inventory needs transactions and row locks, so relational. Chat messages are append-heavy and read by conversation, so a wide-column store."*

**10. One consistency model for everything.**
Say instead: *"Payments and inventory are strongly consistent; like counts and feeds are eventually consistent."*

**11. Ignoring the read/write ratio and access patterns.**
Ask yourself early: *Is this read-heavy or write-heavy? What's the hottest query?* Those decide caching, indexing, and partitioning.

**12. Single points of failure.**
Check every box you draw: *"What happens if this dies?"* Then add replication, failover, or a degraded mode.

**13. Forgetting hot keys and skew.**
Celebrities, viral links, Black Friday. Say: *"A viral link is a hot key; I'll add in-process caching and request coalescing."*

**14. Happy path only.**
Mention retries, idempotency, timeouts, dead-letter queues, and what users see during failures.

**15. Over-engineering.**
Designing for 1B users when the problem says 10k. Say: *"At this scale a single PostgreSQL instance with a replica is enough; here's what I'd change at 100× growth."*

## AI-specific mistakes

**16. Defaulting to fine-tuning (or agents) for everything.**
Say instead: *"The model needs our private, changing documents with citations and permissions, so RAG fits better than fine-tuning. An agent isn't needed because the steps are fixed."*

**17. No evaluation plan.**
Say instead: *"Offline: a labeled set for retrieval recall and an LLM judge calibrated against human ratings for faithfulness. Online: thumbs, escalations, A/B tests. Evals run in CI on every prompt or model change."*

**18. Ignoring cost and latency in tokens.**
Say instead: *"About 6k input and 500 output tokens per request at 1M requests/day — caching the system prompt and routing easy queries to a small model cuts cost roughly in half."*

**19. Trusting the model with security.**
Say instead: *"Permissions are enforced in code before retrieval and before any tool call. Retrieved text and tool outputs are untrusted — prompt injection can't grant access the user doesn't have."*

**20. Forgetting the feedback loop.**
Say instead: *"User feedback and failure cases flow back into the eval set and training data, and we monitor drift."*

## Pre-interview checklist

- [ ] Can I explain the 45-minute structure from the [framework](../framework.md)?
- [ ] Do I know the reference numbers (QPS conversions, latency table)?
- [ ] For each building block, can I name two alternatives and the trade-off?
- [ ] Have I practiced out loud with a timer at least three times?
- [ ] Do I have a go-to closing: bottlenecks, failures, what I'd do next?
