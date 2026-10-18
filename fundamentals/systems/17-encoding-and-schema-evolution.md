# Encoding & Schema Evolution: JSON, Protobuf, Avro

> **In one sentence:** data outlives code — old and new versions of your services read and write the same data at the same time — so choose encodings and evolve schemas so that **new code reads old data and old code reads new data**.

> 📚 **Further reading:** *Designing Data-Intensive Applications* by Martin Kleppmann (O'Reilly), chapter "Encoding and Evolution". This lesson is written independently as a companion.

## Everyday analogy

A company form changes every year. If the new form adds an optional box, staff using last year's instructions can still process it (they ignore the new box), and new staff can still read old forms (the box is just empty). If the new form *renames* a required box, everything breaks.

## See it in action: a rolling deploy

<div class="sim" data-sim="pipeline" data-title="Why compatibility matters" data-steps="v1 everywhere|Deploy v2 to 1 pod|v2 writes new field|v1 reads v2 data|v2 reads v1 data|Rollback to v1?|v2 everywhere" data-labels="Writes {id, name}|Old and new code run side by side|Writes {id, name, email}|Must ignore unknown 'email' → forward compatibility|Must handle missing 'email' → backward compatibility|Old code must still read data v2 wrote|Only now can you rely on the new field"><em>Interactive animation available on the website.</em></div>

## Two directions of compatibility

| Term | Meaning | Needed when |
|------|---------|-------------|
| **Backward compatible** | New code can read data written by old code | Always (old data is stored for years) |
| **Forward compatible** | Old code can read data written by new code | Rolling deploys, rollbacks, old mobile clients, other teams' consumers |

During a [rolling update](../../devops/06-kubernetes-workloads.md) or [canary](../../devops/12-gitops-and-deployment-strategies.md), both directions happen at once.

## Encoding formats

| Format | Schema | Size/speed | Evolution | Typical use |
|--------|--------|-----------|-----------|-------------|
| **JSON** | Optional (JSON Schema) | Text, verbose, slower | Flexible but informal; ambiguous numbers (big ints), no binary | Public REST APIs, configs |
| **Protocol Buffers** | Required `.proto`, numbered fields | Compact binary, fast | Field numbers make add/remove safe | gRPC, internal services |
| **Avro** | Required schema; writer and reader schemas resolved | Very compact | Strong rules; great for data pipelines | Kafka + Schema Registry, Hadoop |
| **Thrift** | IDL with field IDs | Compact binary | Similar to Protobuf | Some RPC systems |
| Language-native (Java Serializable, pickle) | — | — | Poor, insecure | Avoid for anything stored or shared |

### Protobuf evolution rules (by example)

```proto
message User {
  int64  id    = 1;
  string name  = 2;
  string email = 3;        // ✅ added later as a new field number: old readers skip it
  // int32 age = 4;        // removed? → reserve the number so it's never reused:
  reserved 4;
  reserved "age";
}
```

- ✅ Add new fields with new numbers (make them optional / give defaults).
- ✅ Remove optional fields — and **reserve** their numbers and names.
- ❌ Never change a field's number or reuse an old number.
- ❌ Don't change types incompatibly (e.g., `string` → `int64`).

## Schema evolution in databases

- Additive migrations first: add nullable columns or columns with defaults; backfill; then make code use them.
- **Expand → migrate → contract** for breaking changes (rename = add new column, dual-write, backfill, switch reads, drop old) — detailed in [GitOps & deployment strategies](../../devops/12-gitops-and-deployment-strategies.md).
- Document databases (schema-on-read) still have a schema — it's in your code. Handle missing/old fields explicitly.

## Data flowing through services and streams

- **APIs (REST/gRPC):** version carefully; prefer additive changes; keep old fields until all clients upgrade (mobile apps may stay old for years).
- **Message queues/streams:** messages written today may be replayed months later → use a **schema registry** (Avro/Protobuf/JSON Schema) that enforces compatibility rules on every new schema version.
- **Data warehouses:** schema changes ripple into analytics; communicate and version contracts ("data contracts").

## Quick check

**Q: You add a required field to a Protobuf message and deploy consumers before producers. What breaks?**

A: Consumers expecting the new required field fail when reading messages from old producers (or old stored data). Add fields as optional with defaults, deploy readers that handle absence, then writers.

**Q: Why must you never reuse a deleted Protobuf field number?**

A: Old data or old clients may still contain values under that number; a new field with the same number would misinterpret them — silently corrupting data.
