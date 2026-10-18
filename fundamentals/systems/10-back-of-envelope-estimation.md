# Back-of-the-Envelope Estimation

> **In one sentence:** quick, rounded math that tells you which parts of a design will be under pressure — before you pick any technology.

## Everyday analogy

Before a road trip you estimate: 600 km at 100 km/h ≈ 6 hours, plus stops. You don't need the exact minute — you need to know whether you'll arrive before dark.

## Try it

<div class="sim" data-sim="estimator"><em>Interactive calculator available on the website.</em></div>

Change daily users, actions per user, and data size to see QPS, peak QPS, and storage per year update instantly.

## The four numbers interviewers expect

1. **QPS (requests per second)** = daily requests ÷ 86,400 (round to 10⁵). Peak ≈ 2–3× average.
2. **Storage** = items per day × size × retention (× replication factor).
3. **Bandwidth** = QPS × response size.
4. **Memory for cache** = hot fraction of data (often 20%) × size.

## Handy conversions

| Fact | Value |
|------|-------|
| Seconds per day | 86,400 ≈ 10⁵ |
| 1M requests/day | ≈ 12 QPS |
| 1B requests/day | ≈ 12k QPS |
| 1 KB × 1B | 1 TB |
| Seconds per year | ≈ 3 × 10⁷ |
| 1 char (ASCII) | 1 byte |
| 1 LLM token | ≈ 4 characters ≈ 0.75 words |

## Worked example: photo sharing app

- 100M daily users, each uploads 1 photo/day, views 50.
- **Writes:** 100M/day ÷ 10⁵ ≈ **1,000 uploads/s**; peak ~3,000/s.
- **Reads:** 5B/day ≈ **58,000 views/s** → read-heavy → CDN + caching are the main design concerns.
- **Storage:** 100M × 2 MB = 200 TB/day → **~73 PB/year** → object storage, tiering, compression.
- **Conclusion:** the hard problems are media storage/delivery and read scaling, not the metadata database.

## How to use the numbers

The point isn't precision — it's to reach conclusions like:
- "12k QPS fits a small cluster; 1M QPS needs sharding and heavy caching."
- "90 TB won't fit on one machine → we need to partition."
- "100 GB of hot data fits in a Redis cluster's memory."

## Common mistakes

- Spending 10 minutes on exact arithmetic. Round aggressively; state assumptions out loud.
- Forgetting replication (×3) and peak (×2–3).
- Computing numbers and never using them to justify a design decision.

## Quick check

**Q: 500M daily users each make 20 requests. Average and peak QPS?**

A: 10B/day ÷ 10⁵ ≈ 100k QPS average; ~200–300k QPS peak.

**Q: Storing 1 KB per event at 10k events/second — how much per year?**

A: 10k × 1 KB = 10 MB/s × 3×10⁷ s ≈ 300 TB/year (before replication).
