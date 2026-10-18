# Data Models: Relational, Document, Graph & More

> **In one sentence:** the data model you choose — tables, documents, graphs, key-value, columns, time series — shapes how naturally you can express your data and queries, so pick it from your data's relationships and access patterns.

> 📚 **Further reading:** *Designing Data-Intensive Applications* by Martin Kleppmann (O'Reilly), chapter "Data Models and Query Languages". This lesson is written independently as a companion; read the book for depth.

## Everyday analogy

The same family can be described as a **spreadsheet** (one row per person, columns for name and parent), a **folder of profile cards** (each card holds everything about one person, including their children), or a **family-tree drawing** (people as nodes, relationships as lines). Each is best for different questions: "list everyone born in 1990" (spreadsheet), "show me this person's full profile" (card), "how are these two people related?" (tree).

## See it in action: same data, three models

<div class="sim" data-sim="pipeline" data-title="Choosing a data model" data-steps="Relational|Document|Graph|Key-value|Wide-column|Time series" data-labels="Tables + joins: many-to-many relationships, transactions|Self-contained JSON trees: load a whole object at once|Nodes + edges: highly connected data, traversals|One key → one value: fastest lookups, simplest scaling|Rows partitioned by key, sorted columns: huge write volumes|Timestamped points: metrics, IoT, append-heavy"><em>Interactive animation available on the website.</em></div>

## Relational vs document

```sql
-- Relational: normalized tables, joined at query time
users(id, name)
positions(id, user_id, title, company_id)
companies(id, name)
SELECT u.name, p.title, c.name FROM users u
JOIN positions p ON p.user_id = u.id JOIN companies c ON c.id = p.company_id;
```

```json
// Document: one self-contained record
{ "id": 42, "name": "Priya",
  "positions": [ { "title": "Engineer", "company": "Acme" },
                 { "title": "Lead", "company": "Globex" } ] }
```

| | Relational | Document |
|---|---|---|
| Best for | Many-to-many relationships, ad-hoc queries, transactions | One-to-many trees loaded together (profiles, orders with line items, CMS content) |
| Schema | Enforced on write (schema-on-write) | Flexible; interpreted on read (schema-on-read) |
| Joins | Native and efficient | Weak or manual; duplicate data or do multiple queries |
| Locality | Data spread across tables | Whole document stored together → one read |
| Watch out | Object-relational mismatch | Denormalized copies drifting out of sync; large documents rewritten on small updates |

Most modern databases blur the line: PostgreSQL has JSONB columns; document databases added joins and transactions. Choose by your **dominant access pattern**.

### Normalization in one paragraph
Store each fact once (e.g., company name in one place, referenced by ID). Updates touch one row and stay consistent — the database version of DRY. Denormalize (copy data) deliberately for read speed, accepting the work of keeping copies in sync.

## Graph models

When almost everything relates to everything (social networks, fraud rings, knowledge graphs, recommendation "friends of friends"), a **graph** model is clearest: nodes (people, accounts) and edges (follows, paid, located-in), queried by traversals:

```cypher
// Cypher (Neo4j-style): accounts within 3 hops of a known fraudster
MATCH (f:Account {flagged: true})-[:SHARES_DEVICE|PAID*1..3]-(a:Account)
RETURN DISTINCT a.id
```

Doing this with SQL means recursive queries or many self-joins; graph databases and graph processing frameworks make traversals natural.

## Other models you'll name in interviews

| Model | Examples | Use |
|-------|----------|-----|
| Key-value | Redis, DynamoDB (simple use) | Sessions, caches, lookups by ID |
| Wide-column | Cassandra, HBase, Bigtable | Messages, feeds, time-ordered data at massive write volume |
| Search index | Elasticsearch/OpenSearch | Full-text search, faceting |
| Time series | Prometheus, InfluxDB, TimescaleDB | Metrics, IoT ([monitoring](../../classic-system-design/18-metrics-monitoring.md)) |
| Vector | pgvector, Milvus, Qdrant | Similarity search ([vector search](../ai/02-embeddings-and-vector-search.md)) |
| Columnar warehouse | BigQuery, Snowflake, ClickHouse | Analytics over billions of rows |

## Declarative vs imperative queries

SQL and Cypher are **declarative**: you say *what* you want, and the database decides *how* (indexes, join order, parallelism). That lets the engine optimize and evolve without changing your queries — a big reason declarative query languages won.

## Quick check

**Q: You're storing résumés that are always loaded whole, but you also need "all engineers who worked at Acme." Document or relational?**

A: Either can work: documents give fast whole-résumé loads; the cross-cutting query needs an index on positions.company (or a relational model with joins). Many teams use a relational DB with a JSON column, or documents plus a secondary index/search index.

**Q: Why is a graph database a good fit for fraud-ring detection?**

A: Fraud rings are discovered by following chains of relationships (shared devices, payments, addresses) several hops deep — natural graph traversals that are awkward and slow as SQL self-joins.
