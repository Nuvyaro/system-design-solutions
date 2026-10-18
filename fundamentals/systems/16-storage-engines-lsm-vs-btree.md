# Storage Engines: LSM-Trees vs B-Trees

> **In one sentence:** databases store data on disk in one of two main ways — **B-trees** that update pages in place (great for reads) or **LSM-trees** that append sorted files and merge them later (great for writes) — and knowing which your database uses explains its performance.

> 📚 **Further reading:** *Designing Data-Intensive Applications* by Martin Kleppmann (O'Reilly), chapter "Storage and Retrieval". This lesson is written independently as a companion.

## Everyday analogy

**B-tree:** a library where every new book is shelved immediately in its exact alphabetical spot — finding books is fast, but shelving takes walking around. **LSM-tree:** new books go onto a cart (memory); when the cart is full, it's sorted and put on a new shelf as one batch; periodically the librarian merges shelves — shelving is very fast, but finding a book may mean checking a few shelves.

## See it in action

<div class="sim" data-sim="lsm-tree"><em>Interactive animation available on the website.</em></div>

Write keys until the memtable flushes into an SSTable; keep writing until compaction merges them. Then read keys and see how many files a lookup touches, and how deletes become tombstones.

## LSM-trees (Log-Structured Merge trees)

**Write path**
1. Append the write to a **write-ahead log** (WAL) on disk for durability.
2. Insert into the **memtable**, an in-memory sorted structure.
3. When the memtable is full, flush it to disk as an immutable, sorted **SSTable** (Sorted String Table) — one big sequential write.
4. Background **compaction** merges SSTables, keeping only the newest value per key and dropping deleted keys (**tombstones**).

**Read path:** memtable → newest SSTable → older SSTables. Per-SSTable **Bloom filters** ([lesson](14-bloom-filters.md)) skip files that can't contain the key, and sparse indexes jump to the right block.

Used by: Cassandra, ScyllaDB, RocksDB, LevelDB, HBase, Bigtable, many time-series DBs.

## B-trees

- Data lives in fixed-size **pages** (e.g., 4–16 KB) arranged as a balanced tree; each page holds keys and pointers to children.
- Lookup: walk from the root, ~3–4 page reads even for billions of rows ([indexing](04-databases-and-indexing.md)).
- Updates **overwrite pages in place**; a WAL protects against crashes mid-write; page splits keep the tree balanced.

Used by: PostgreSQL, MySQL/InnoDB, SQL Server, Oracle, SQLite, most relational databases.

## Comparison

| | LSM-tree | B-tree |
|---|---|---|
| Writes | Sequential appends → very high throughput | Random page writes → slower for heavy writes |
| Reads | May check several files (mitigated by Bloom filters, compaction) | Predictable: one tree walk |
| Write amplification | Compaction rewrites data multiple times | Writing whole pages (and WAL) for small changes |
| Space | Good compression; temporary duplication until compaction | Some fragmentation/empty space in pages |
| Latency spikes | Compaction can compete for disk I/O | Generally steadier |
| Range scans | Good (sorted files) | Excellent |
| Typical fit | Write-heavy: logs, metrics, messages, events | Read-heavy, transactional OLTP |

## OLTP vs OLAP storage

| | OLTP (transactions) | OLAP (analytics) |
|---|---|---|
| Queries | Read/write a few rows by key | Scan millions of rows, aggregate few columns |
| Storage | Row-oriented (B-tree or LSM) | **Column-oriented**: each column stored together, compressed |
| Examples | PostgreSQL, MySQL, DynamoDB | BigQuery, Snowflake, ClickHouse, Redshift, Parquet files |

Column storage reads only the columns a query needs and compresses them extremely well (similar values sit together) — why warehouses can scan billions of rows in seconds. Data typically flows from OLTP databases into a warehouse via ETL/CDC.

## Other index types worth knowing

- **Hash indexes:** in-memory hash map of key → file offset (Bitcask); very fast point lookups, no range queries.
- **Secondary indexes:** indexes on non-primary columns; each one slows writes.
- **Covering/clustered indexes:** store row data in (or with) the index to avoid an extra lookup.
- **Full-text (inverted) indexes** and **vector indexes** for search ([web search](../../classic-system-design/28-web-search-engine.md), [vector search](../ai/02-embeddings-and-vector-search.md)).

## Quick check

**Q: Your service writes 200k events per second and reads them rarely by key and time range. LSM or B-tree?**

A: An LSM-tree-based store (Cassandra/ScyllaDB/RocksDB-based): sequential writes handle the volume, and sorted SSTables serve time-range reads well.

**Q: Why does a deleted key still take space in an LSM-tree for a while?**

A: Deletes are written as tombstones; the old value and tombstone are only removed when compaction merges the files that contain them.
