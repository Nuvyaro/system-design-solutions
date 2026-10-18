# CAP Theorem & Consistency Models

> **In one sentence:** when a network failure splits your system, you must choose between staying **consistent** (refuse some requests) or staying **available** (answer, but maybe with stale or conflicting data).

## Everyday analogy

Two bank branches share account balances over a phone line. The line goes dead. A customer wants to withdraw money at branch A. Branch A can **refuse** until the line is back (consistent but unavailable), or **allow it** and sort out any overdraft later (available but possibly inconsistent).

## See it in action

<div class="sim" data-sim="cap"><em>Interactive animation available on the website.</em></div>

Cut the network link, choose **CP** or **AP**, and write a value. CP rejects the write; AP accepts it and the two nodes disagree until the link heals.

## CAP in plain words

- **C**onsistency: every read sees the latest write.
- **A**vailability: every request gets a (non-error) response.
- **P**artition tolerance: the system keeps working when messages between nodes are lost.

Network partitions *will* happen, so P isn't optional. The real choice is **during a partition: C or A?**

| Choose | Behavior during partition | Examples | Use for |
|--------|---------------------------|----------|---------|
| **CP** | Some requests fail/timeout | etcd, ZooKeeper, Spanner, HBase | Payments, inventory, locks, leader election |
| **AP** | Everyone answers; data may diverge, reconciled later | Cassandra, DynamoDB (default), DNS | Feeds, likes, shopping carts, presence |

**PACELC** adds: *else* (no partition), choose between **L**atency and **C**onsistency. Even when healthy, strong consistency costs extra round trips.

## Consistency models (strongest → weakest)

| Model | Guarantee | Feels like |
|-------|-----------|------------|
| Linearizable (strong) | Behaves like a single copy; reads see the latest write | One database on one machine |
| Sequential | Everyone sees operations in the same order | — |
| Causal | Cause before effect (a reply never appears before its question) | Comments make sense |
| Read-your-writes | You always see your own updates | Your profile edit "sticks" |
| Eventual | If writes stop, replicas converge eventually | Like counts that catch up |

## How to talk about it in an interview

Don't pick one model for the whole system — **pick per feature**:
- Seat inventory, account balance → strong consistency.
- View counts, recommendations, feed ordering → eventual consistency is fine.
- Say what users would see during a failure and why that's acceptable.

## Where it shows up

[Distributed KV Store](../../classic-system-design/06-distributed-key-value-store.md) (tunable consistency), [Ticket Booking](../../classic-system-design/14-ticket-booking.md) (strong), [News Feed](../../classic-system-design/03-news-feed.md) (eventual).

## Quick check

**Q: A like counter shows 1,203 to one user and 1,205 to another for a few seconds. Is that a bug?**

A: Usually not — like counts are a classic case where eventual consistency is acceptable in exchange for availability and speed.

**Q: Why can't a system be "CA"?**

A: In a distributed system, partitions are inevitable. "CA" only exists on a single node; once you have a network between nodes, you must decide what happens when it fails.
