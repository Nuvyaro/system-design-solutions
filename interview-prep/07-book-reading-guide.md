# Book Reading Guide: Classic System Design Books → This Site

> Read a chapter, then practice the matching interactive lesson or problem here. This page maps four well-known books to the content on this site. All lessons and solutions on this site are written independently; the books are recommended for their own depth, examples and diagrams.

<div class="sim" data-sim="pipeline" data-title="A study loop that works" data-steps="Read a chapter|Play the simulation|Attempt the problem|Practice mode timer|Compare with the solution|Review follow-ups" data-labels="Get the author's full explanation|Build intuition with the interactive lesson|Sketch your own design first|45 minutes, out loud|Note what you missed|Tap-to-reveal questions as a mini mock interview"><em>Interactive animation available on the website.</em></div>

## *System Design Interview – An Insider's Guide* (Vol. 1) — Alex Xu

| Book chapter (topic) | On this site |
|----------------------|--------------|
| Scale from zero to millions of users | [Scalability](../fundamentals/systems/01-scalability-basics.md), [Load balancing](../fundamentals/systems/02-load-balancing.md), [Caching](../fundamentals/systems/03-caching.md), [Replication](../fundamentals/systems/05-replication.md), [Sharding](../fundamentals/systems/06-sharding-and-consistent-hashing.md), [CDNs](../fundamentals/systems/11-networking-cdn-and-apis.md) |
| Back-of-the-envelope estimation | [Estimation (with calculator)](../fundamentals/systems/10-back-of-envelope-estimation.md) |
| A framework for system design interviews | [Interview framework](../framework.md), [Mock interviews](01-mock-interview-url-shortener.md), [Rubric](05-scoring-rubric.md) |
| Rate limiter | [Rate limiter](../classic-system-design/02-rate-limiter.md), [Reliability patterns](../fundamentals/systems/09-reliability-patterns.md) |
| Consistent hashing | [Sharding & consistent hashing (ring simulation)](../fundamentals/systems/06-sharding-and-consistent-hashing.md) |
| Key-value store | [Distributed KV store](../classic-system-design/06-distributed-key-value-store.md), [CAP](../fundamentals/systems/07-cap-and-consistency.md) |
| Unique ID generator | [Unique ID generator](../classic-system-design/22-unique-id-generator.md) |
| URL shortener | [URL shortener](../classic-system-design/01-url-shortener.md) |
| Web crawler | [Web crawler](../classic-system-design/07-web-crawler.md), [Bloom filters](../fundamentals/systems/14-bloom-filters.md) |
| Notification system | [Notification system](../classic-system-design/05-notification-system.md) |
| News feed | [News feed](../classic-system-design/03-news-feed.md) |
| Chat system | [Chat system](../classic-system-design/04-chat-system.md), [Mock interview: chat](03-mock-interview-chat-system.md) |
| Search autocomplete | [Search autocomplete](../classic-system-design/10-search-autocomplete.md) |
| YouTube | [Video streaming](../classic-system-design/08-video-streaming.md) |
| Google Drive | [Cloud file storage](../classic-system-design/11-file-storage.md) |

## *System Design Interview* (Vol. 2) — Alex Xu & Sahn Lam

| Book chapter (topic) | On this site |
|----------------------|--------------|
| Proximity service | [Proximity service](../classic-system-design/19-proximity-service.md) |
| Nearby friends | [Nearby friends](../classic-system-design/29-nearby-friends.md) |
| Google Maps | [Google Maps](../classic-system-design/30-google-maps.md) |
| Distributed message queue | [Message queue](../classic-system-design/13-distributed-message-queue.md), [Queues lesson](../fundamentals/systems/08-message-queues.md) |
| Metrics monitoring & alerting | [Metrics monitoring](../classic-system-design/18-metrics-monitoring.md), [Observability & SLOs](../devops/19-observability-and-alerting.md) |
| Ad click event aggregation | [Ad click aggregation](../classic-system-design/25-ad-click-aggregation.md), [Stream processing](../fundamentals/systems/20-batch-and-stream-processing.md) |
| Hotel reservation | [Hotel reservation](../classic-system-design/20-hotel-reservation.md), [Transactions](../fundamentals/systems/18-transactions-and-isolation-levels.md) |
| Distributed email service | [Email service](../classic-system-design/24-email-service.md) |
| S3-like object storage | [Object storage](../classic-system-design/23-object-storage.md) |
| Real-time gaming leaderboard | [Leaderboard & top-K](../classic-system-design/17-leaderboard-top-k.md) |
| Payment system | [Payment system](../classic-system-design/12-payment-system.md) |
| Digital wallet | [Digital wallet](../classic-system-design/31-digital-wallet.md), [Sagas](../fundamentals/systems/13-distributed-transactions-and-sagas.md) |
| Stock exchange | [Stock exchange](../classic-system-design/21-stock-exchange.md) |

## *Designing Data-Intensive Applications* — Martin Kleppmann

| Book chapter (topic, 1st edition numbering) | On this site |
|---------------------------------------------|--------------|
| 1. Reliable, scalable, maintainable applications | [Scalability](../fundamentals/systems/01-scalability-basics.md), [Reliability patterns](../fundamentals/systems/09-reliability-patterns.md), [Software design principles](../software-design/01-purpose-and-the-equation-of-design.md) |
| 2. Data models and query languages | [Data models](../fundamentals/systems/15-data-models-and-query-languages.md), [Databases & indexing](../fundamentals/systems/04-databases-and-indexing.md) |
| 3. Storage and retrieval | [Storage engines: LSM vs B-tree (simulation)](../fundamentals/systems/16-storage-engines-lsm-vs-btree.md), [Bloom filters](../fundamentals/systems/14-bloom-filters.md) |
| 4. Encoding and evolution | [Encoding & schema evolution](../fundamentals/systems/17-encoding-and-schema-evolution.md) |
| 5. Replication | [Replication (simulation)](../fundamentals/systems/05-replication.md), [Multi-region HA](../devops/17-multi-region-high-availability.md) |
| 6. Partitioning | [Sharding & consistent hashing](../fundamentals/systems/06-sharding-and-consistent-hashing.md) |
| 7. Transactions | [Transactions & isolation levels (simulation)](../fundamentals/systems/18-transactions-and-isolation-levels.md) |
| 8. The trouble with distributed systems | [Time, clocks & ordering](../fundamentals/systems/19-time-clocks-and-ordering.md), [CAP](../fundamentals/systems/07-cap-and-consistency.md) |
| 9. Consistency and consensus | [Consensus & Raft (simulation)](../fundamentals/systems/12-consensus-and-raft.md), [Distributed transactions](../fundamentals/systems/13-distributed-transactions-and-sagas.md) |
| 10. Batch processing | [Batch & stream processing](../fundamentals/systems/20-batch-and-stream-processing.md), [ML platform](../ai-system-design/09-ml-platform.md) |
| 11. Stream processing | [Batch & stream processing (windows simulation)](../fundamentals/systems/20-batch-and-stream-processing.md), [Message queues](../fundamentals/systems/08-message-queues.md), [Ad click aggregation](../classic-system-design/25-ad-click-aggregation.md) |
| 12. The future of data systems | [Batch & stream processing: the log as backbone](../fundamentals/systems/20-batch-and-stream-processing.md), [Digital wallet (event sourcing)](../classic-system-design/31-digital-wallet.md) |

## *Code Simplicity* — Max Kanat-Alexander

| Book chapter | On this site |
|--------------|--------------|
| Purpose of software; the future & the equation | [Design 1](../software-design/01-purpose-and-the-equation-of-design.md) |
| Change | [Design 2](../software-design/02-change-and-the-three-flaws.md) |
| Defects and design | [Design 3](../software-design/03-defects-small-changes-and-dry.md) |
| Simplicity | [Design 4](../software-design/04-simplicity-readability-and-consistency.md) |
| Complexity | [Design 5](../software-design/05-complexity-and-how-to-tame-it.md) |
| Testing; the laws | [Design 6](../software-design/06-testing-and-the-six-laws.md), [Design 7](../software-design/07-applying-simplicity-to-system-design.md) |

## Suggested 6-week plan

| Week | Read | Practice here |
|------|------|---------------|
| 1 | Xu Vol. 1 ch. 1–3; DDIA ch. 1 | Fundamentals 1–3, 10; framework; mock interview 1 |
| 2 | DDIA ch. 2–4 | Fundamentals 4, 15–17; URL shortener, KV store |
| 3 | DDIA ch. 5–7; Xu Vol. 1 rest | Fundamentals 5–7, 18; chat, news feed, notifications |
| 4 | DDIA ch. 8–9; Xu Vol. 2 (half) | Fundamentals 12, 13, 19; payment, hotel, wallet, stock exchange |
| 5 | DDIA ch. 10–12; Xu Vol. 2 (rest) | Fundamentals 20; ad clicks, metrics, maps, nearby friends |
| 6 | Code Simplicity | Software design track; AI track; mock interviews 2–3; cheat sheet |
