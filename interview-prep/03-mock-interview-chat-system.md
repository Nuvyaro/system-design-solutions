# Mock Interview 3: Chat System with Hard Pushback (Senior, 60 minutes)

> A senior-level interview where the interviewer challenges almost every decision. Shows how to defend, adapt, and drive the conversation. Includes a moment where the candidate disagrees with the interviewer — politely and with reasons.

**Level:** Senior / Staff · **Problem:** [Chat System](../classic-system-design/04-chat-system.md) · **Rating at the end:** Hire (senior), leaning staff

<div class="sim" data-sim="pipeline" data-title="Pushback moments and responses" data-steps="'Why not polling?'|'Timestamps for order?'|'Exactly-once delivery?'|'Presence to everyone?'|'Region outage?'|'Disagree: E2EE search'" data-labels="Quantified overhead, chose WebSockets|Server-assigned per-conversation sequence|At-least-once + idempotent display|Fan out only to interested online users|Home region per conversation, failover plan|Explained the trade-off, offered options"><em>Interactive animation available on the website.</em></div>

---

## 0:00 — Scoping fast

**Interviewer:** Design WhatsApp.

**Candidate:** WhatsApp is big, so let me propose a scope and you correct me: 1:1 and group chats up to a few hundred members, online presence, delivery and read receipts, multi-device history sync. Out of scope for now: voice/video calls, stories, payments. Scale: let's say 500M daily users, 50 messages each per day. Is end-to-end encryption required?

**Interviewer:** Scope is fine. Discuss E2EE later.

**Candidate:** Then roughly 25B messages/day ≈ **300k messages/s average**, ~1M/s peak. Storage at ~200 bytes per message ≈ 5 TB/day before replication. Concurrent connections maybe 150M at peak; at ~100k connections per server, ~1,500 connection servers.

> 💡 **Coach:** At senior level, propose the scope yourself. Asking 10 questions wastes time; proposing and confirming shows leadership.

## 0:06 — Protocol pushback

**Interviewer:** Why not just have clients poll an HTTP endpoint every second? Simpler, stateless.

**Candidate:** It's simpler, but at 150M connected clients, polling every second is 150M requests/s — mostly empty responses — and still adds up to a second of latency. WebSockets keep one connection per device; messages push in milliseconds and idle cost is tiny. The cost is stateful connection servers, which I'll handle with a session registry and client reconnect-and-resync. For constrained networks, long polling remains a fallback.

**Interviewer:** OK.

## 0:12 — Ordering pushback

**Candidate:** Message flow: client sends over WebSocket with a client-generated message ID → message service persists to Cassandra partitioned by conversation → acks the sender → publishes to a log partitioned by conversation → router finds recipients' connection servers → pushes; offline users get a push notification.

**Interviewer:** How do you order messages? Use client timestamps?

**Candidate:** No — client clocks drift and can be wrong or malicious. I'd assign a **monotonically increasing sequence number per conversation** on the server. The simplest correct way is to have a single writer per conversation: the log partition owner, or an atomic counter keyed by conversation. Clients display by sequence, and gaps tell them to fetch missing messages.

**Interviewer:** A single sequencer per conversation is a bottleneck.

**Candidate:** Per *conversation*, not globally. Even a busy group chat produces a few messages per second — trivial for one owner. The global load is spread across millions of conversations. The real hot-spot risk is huge broadcast channels, where I'd shard by time bucket and relax strict ordering.

> 💡 **Coach:** The pushback ("bottleneck") was testing whether the candidate understood the *granularity* of the sequencer. Quantifying ("a few messages per second per conversation") ended the challenge.

## 0:20 — Delivery semantics pushback

**Interviewer:** Guarantee exactly-once delivery.

**Candidate:** Over unreliable networks, exactly-once *delivery* isn't achievable — acks can be lost, so someone must retry. What we can guarantee is **exactly-once display**: at-least-once delivery plus deduplication by `(conversation_id, client_message_id)` on the server and by sequence number on clients. Users never see duplicates, and nothing is lost because we persist before acknowledging.

**Interviewer:** Good answer.

## 0:28 — Presence and fan-out

**Interviewer:** How does presence work?

**Candidate:** Heartbeats every ~30 s over the socket; a presence service stores last-seen in Redis with TTL. The trap is fan-out: if each status change goes to all contacts, a user with 2,000 contacts going online/offline repeatedly creates storms. I'd only push presence to users who are **online and currently looking** at that contact or chat, and let others fetch on demand. Also debounce flapping on mobile networks.

## 0:36 — Multi-device and multi-region

**Interviewer:** A whole region goes down. What happens to conversations?

**Candidate:** Each conversation has a **home region** where its sequencer lives — chosen by participants' locations. Messages are replicated asynchronously to other regions for reads and backup. If the home region fails, a failover controller reassigns home regions; because replication is async, the last few hundred milliseconds of messages might be missing until the region recovers, and clients will re-send unacked messages with the same client IDs, which dedupe naturally. If we need zero loss, we'd replicate synchronously to a second region at the cost of write latency — I'd only do that for enterprise tiers.

> 💡 **Coach:** Senior answers name the trade-off (async replication = possible small loss window) and offer a dial (sync for some tiers) instead of pretending there's a free solution.

## 0:46 — Polite disagreement

**Interviewer:** With end-to-end encryption, we still want server-side search across all messages for users. Add that.

**Candidate:** I'd push back a bit, because those requirements conflict. With E2EE the server only has ciphertext, so it can't build a search index without breaking the encryption guarantee. Options:
1. **Client-side search:** each device indexes its own decrypted messages locally — preserves E2EE; history is limited to what's on the device.
2. **Encrypted backups the user unlocks** and searches client-side.
3. Make E2EE opt-out for some product tiers (like enterprise with compliance needs), with server-side search there.
I'd recommend option 1 for consumer chats. Which matters more for this product — the privacy guarantee or server search?

**Interviewer:** Privacy. Go with client-side.

> 💡 **Coach:** Disagreeing is fine — even expected at senior level — when you explain the conflict, give options, recommend one, and hand the decision back.

## 0:52 — Wrap-up

**Candidate:** Summary of risks: connection server fleet management during deploys (drain gradually to avoid reconnect storms with jittered backoff), hot group chats, push notification provider limits, and storage growth (tiering old messages). Next steps I'd prioritize: E2EE key management for multi-device (Signal protocol, per-device keys), and abuse/spam detection that works on metadata since we can't read content.

---

## Scorecard

| Area | Rating | Evidence |
|------|--------|----------|
| Leadership of the session | Very strong | Proposed scope, drove agenda, summarized |
| Handling pushback | Very strong | Quantified, adapted, never defensive |
| Distributed systems depth | Strong | Ordering granularity, delivery semantics, multi-region trade-offs |
| Product judgment | Strong | Presence fan-out trap, E2EE vs search conflict |
| **Overall** | **Hire (senior), leaning staff** | Staff signal: framed trade-offs as product decisions and offered tiers |

## How to handle pushback

| Interviewer says | Good response pattern |
|------------------|-----------------------|
| "Why not X instead?" | Compare X vs your choice on 1–2 key dimensions with numbers; switch if X is better |
| "That's a bottleneck." | Check the granularity/scale; quantify; if true, propose sharding or caching |
| "Guarantee Y." (impossible) | Explain what's achievable and how close you get (e.g., exactly-once *effect*) |
| A conflicting requirement | Name the conflict, give options, recommend, ask which matters more |
| Silence | Summarize where you are and propose what to deep-dive next |
