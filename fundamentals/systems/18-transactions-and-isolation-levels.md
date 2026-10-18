# Transactions & Isolation Levels

> **In one sentence:** transactions let a group of reads and writes behave as one all-or-nothing unit, and the **isolation level** decides which concurrency anomalies — dirty reads, lost updates, write skew — your application must still guard against.

> 📚 **Further reading:** *Designing Data-Intensive Applications* by Martin Kleppmann (O'Reilly), chapter "Transactions". This lesson is written independently as a companion.

## Everyday analogy

Two cashiers share one notebook of stock counts. Without rules, both read "1 laptop left," both sell it, and the store promised the same laptop to two customers. Isolation levels are the rules for how much one cashier can see or must wait for the other's unfinished work.

## See it in action

<div class="sim" data-sim="isolation"><em>Interactive animation available on the website.</em></div>

Run each anomaly under each isolation level. Notice that **write skew** slips through snapshot isolation and is only stopped by serializable.

## ACID, briefly

| Letter | Meaning | Gives you |
|--------|---------|-----------|
| **Atomicity** | All writes commit or none do | Safe retries after a crash halfway |
| **Consistency** | Application invariants hold (e.g., debits = credits) | Mostly the application's job, helped by constraints |
| **Isolation** | Concurrent transactions don't interfere (to some degree) | Fewer race conditions |
| **Durability** | Committed data survives crashes | WAL, replication, backups |

## The anomalies

| Anomaly | What happens | Example |
|---------|--------------|---------|
| **Dirty read** | Read data another transaction hasn't committed (and may roll back) | Seeing a balance of 0 that never really happened |
| **Dirty write** | Overwrite another transaction's uncommitted write | Two buyers' writes interleaved on one order |
| **Non-repeatable read / read skew** | Reading the same data twice gives different results mid-transaction | A report sums accounts while a transfer moves money between them |
| **Lost update** | Two read-modify-write cycles; one overwrites the other | Two likes counted as one |
| **Write skew** | Two transactions read the same condition, then write *different* rows, together breaking a rule | Two doctors both go off call; two people book the same meeting room via separate rows |
| **Phantom** | A query's result set changes because another transaction inserted matching rows | Checking "no booking overlaps" then inserting |

## Isolation levels

| Level | Prevents | Still allows | Notes |
|-------|----------|--------------|-------|
| Read uncommitted | Dirty writes | Dirty reads and everything below | Rarely used |
| **Read committed** | Dirty reads/writes | Lost updates, read skew, write skew | Default in PostgreSQL, Oracle, SQL Server |
| **Snapshot isolation / repeatable read** | + read skew; lost updates detected in some DBs (PostgreSQL) | Write skew, some phantoms | Each transaction reads a consistent snapshot (MVCC) |
| **Serializable** | All of the above | — | As if transactions ran one at a time; via actual serial execution, two-phase locking, or SSI (serializable snapshot isolation) |

> Names differ between databases ("repeatable read" in MySQL ≠ PostgreSQL). Always check your database's documentation for exactly what's guaranteed.

## How databases implement it

- **MVCC (multi-version concurrency control):** keep multiple versions of rows; each transaction sees the versions committed before it started → readers never block writers.
- **Two-phase locking (2PL):** shared locks for reads, exclusive for writes, held until commit → serializable but contention and deadlocks.
- **Serializable snapshot isolation (SSI):** run optimistically on snapshots; detect dangerous dependencies at commit and abort one transaction → app must **retry**.
- **Actual serial execution:** one thread processes transactions in order (VoltDB, Redis scripts) → simple and fast if transactions are tiny and data fits in memory.

## Practical defenses at lower isolation

```sql
-- Atomic update instead of read-modify-write (prevents lost updates)
UPDATE posts SET likes = likes + 1 WHERE id = 7;

-- Explicit lock for read-then-write logic
BEGIN;
SELECT * FROM doctors WHERE on_call = true FOR UPDATE;   -- lock the rows you depend on
UPDATE doctors SET on_call = false WHERE name = 'Alice';
COMMIT;

-- Compare-and-set with a version column (optimistic locking)
UPDATE seats SET status = 'HELD', version = version + 1
WHERE id = 12 AND version = 41;   -- 0 rows updated → someone else changed it; retry
```

Plus constraints (UNIQUE, CHECK, exclusion constraints for overlapping ranges) as the last line of defense — see [Ticket Booking](../../classic-system-design/14-ticket-booking.md) and [Hotel Reservation](../../classic-system-design/20-hotel-reservation.md).

Across services, there's no shared transaction — see [distributed transactions & sagas](13-distributed-transactions-and-sagas.md).

## Quick check

**Q: Two requests run `SELECT stock` → `UPDATE stock = stock_read - 1` under read committed. What can go wrong and how do you fix it?**

A: A lost update — both read 5 and write 4. Use an atomic `UPDATE ... SET stock = stock - 1 WHERE stock > 0`, `SELECT ... FOR UPDATE`, optimistic version checks, or serializable isolation with retries.

**Q: Why doesn't snapshot isolation prevent write skew?**

A: Each transaction reads a consistent snapshot and writes a *different* row, so there's no write-write conflict to detect. The conflict is in the read dependency, which only serializable isolation (or explicit locking) catches.
