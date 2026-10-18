# Time, Clocks & Ordering in Distributed Systems

> **In one sentence:** machines' clocks drift and jump, networks delay and reorder messages, and processes pause unexpectedly — so distributed systems use logical clocks, fencing tokens, and consensus instead of trusting wall-clock time for ordering and correctness.

> 📚 **Further reading:** *Designing Data-Intensive Applications* by Martin Kleppmann (O'Reilly), chapters "The Trouble with Distributed Systems" and "Consistency and Consensus". This lesson is written independently as a companion.

## Everyday analogy

Friends in different cities text about plans. Phones' clocks differ by a minute, some texts arrive late or out of order, and someone's phone dies for an hour. Deciding "who said what first" from the timestamps alone leads to arguments; you need agreed rules ("the latest *numbered* plan wins").

## See it in action: why "last write wins" by timestamp loses data

<div class="sim" data-sim="pipeline" data-title="Clock skew causes lost writes" data-steps="Node A clock: 12:00:05|Node B clock: 12:00:02 (3 s behind)|Client writes x=1 via A|Client then writes x=2 via B|LWW compares timestamps|x = 1 wins" data-labels="NTP says A is slightly ahead|B drifted behind|Stamped 12:00:05|Really later, but stamped 12:00:03|12:00:05 > 12:00:03|The newer write x=2 is silently discarded"><em>Interactive animation available on the website.</em></div>

## The three kinds of trouble

| Problem | Reality | Consequence |
|---------|---------|-------------|
| **Unreliable networks** | Messages can be lost, delayed, duplicated, reordered; you can't tell "slow" from "dead" | Timeouts are guesses; retries cause duplicates → idempotency |
| **Unreliable clocks** | Quartz drift, NTP corrections (clock jumps backward!), leap seconds, VM pauses | Wall-clock timestamps can't order events across machines |
| **Process pauses** | GC pauses, VM migration, swapping, SIGSTOP — seconds long | A "leader" may wake up not knowing it lost its lease |

## Two kinds of clocks on one machine

- **Time-of-day clock** (wall clock): what time is it? Can jump backward or forward when synchronized. Use for display, not for measuring durations or ordering.
- **Monotonic clock:** only moves forward; use for **timeouts and measuring elapsed time** within one process.

## Ordering without trusting clocks

### Lamport timestamps
Each node keeps a counter; increment on every event; attach it to messages; on receive, set `counter = max(local, received) + 1`. Ties broken by node ID. Gives a **total order consistent with causality** (if A caused B, A's timestamp is smaller) — but can't tell if two events were concurrent.

### Vector clocks / version vectors
Each node keeps a counter per node. Comparing vectors tells you whether one event **happened before** another or whether they are **concurrent** (conflict!) — used to detect conflicting writes in leaderless stores ([KV store](../../classic-system-design/06-distributed-key-value-store.md)).

### Hybrid logical clocks & TrueTime
- **HLC:** combine physical time with a logical counter — close to wall time, but causally consistent (CockroachDB, YugabyteDB).
- **Google Spanner's TrueTime:** clocks with explicit uncertainty bounds (GPS + atomic clocks); transactions wait out the uncertainty before committing to guarantee external consistency.

## Leases and fencing tokens

A process holds a lock/lease, pauses for 30 seconds (GC), its lease expires, another process takes over — then the first one wakes up and writes, corrupting data.

**Fix: fencing tokens.** The lock service hands out a monotonically increasing token with each lease (e.g., Raft term/ZooKeeper zxid). The storage system rejects any write carrying a token older than the newest it has seen.

```
Client A gets lease, token 33 ──pause──────────────────▶ writes with token 33 → REJECTED (seen 34)
Client B gets lease, token 34 → writes with token 34 → accepted
```

## Linearizability vs causal consistency

- **Linearizable:** the system behaves as if there's one copy and operations happen instantly at some point between start and end — needed for leader election, locks, uniqueness constraints. Costs coordination (consensus, see [Raft](12-consensus-and-raft.md)).
- **Causal consistency:** preserves cause-before-effect without global coordination; often enough for user-facing features (comments after the post they reply to).

## Practical rules

1. Never use wall-clock timestamps alone to decide which write wins when correctness matters; use versions, sequence numbers, or consensus.
2. Use monotonic clocks for timeouts and durations.
3. Assume any message may be duplicated → make operations idempotent.
4. Assume a process may pause at any point → use fencing tokens with leases.
5. Monitor clock offset (NTP) and alert on drift; treat large drift as a node failure.

## Quick check

**Q: Why are vector clocks more informative than Lamport timestamps?**

A: Lamport timestamps give an order consistent with causality but can't distinguish concurrent events from causally related ones. Vector clocks can tell whether one event happened before another or whether they were concurrent — which is what you need to detect conflicts.

**Q: A worker holding a distributed lock had a 40-second GC pause. What protects your database from its stale write?**

A: A fencing token: each lock grant carries an increasing number, and the database rejects writes with a token lower than the highest it has accepted.
