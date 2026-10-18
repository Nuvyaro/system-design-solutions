# Design 7: Applying the Laws of Simplicity to System Design

> **In one sentence:** the same laws that keep code maintainable keep architectures maintainable — this lesson turns them into concrete guidance for system design interviews and real architecture decisions, with examples from this repo.

> 📖 *Applies ideas from* **Code Simplicity** *by Max Kanat-Alexander (O'Reilly, 2012) to distributed systems. The mapping and examples are our own.*

## Law by law, at the architecture level

### 1. Purpose → start every design from the user problem
Clarifying requirements in an interview *is* applying "the purpose of software is to help people." Define who is helped and how before drawing boxes. Features that don't serve the stated purpose (a "nice to have" analytics pipeline in a 45-minute URL shortener interview) are scope creep.

### 2. The equation → operational cost dominates
For long-lived systems, the cost of **running and changing** them outweighs building them:
- Prefer **managed services** when they remove ongoing toil (managed database, queue, Kubernetes control plane) — lower *Em*.
- Count **every new component** as a maintenance liability: monitoring, upgrades, on-call, security patches. A cache, a queue, or a new datastore must earn its place.
- Choose designs whose operations get **easier** over time (automation, IaC, GitOps), not harder.

### 3. Change → keep decisions reversible
- Hide likely-to-change decisions behind interfaces: storage behind a repository layer, providers behind an [LLM gateway](../ai-system-design/17-llm-gateway.md), payment providers behind a PSP abstraction ([payments](../classic-system-design/12-payment-system.md)).
- Use standard protocols and formats (HTTP/gRPC, SQL, OpenAPI, OCI, OpenTelemetry) so components can be replaced.
- Design databases for change: additive schema migrations (expand → migrate → contract — see [GitOps & deployment strategies](../devops/12-gitops-and-deployment-strategies.md)).

### 4. Defect probability → small, safe, reversible deploys
- Small changes + canary/rolling releases + automatic rollback = fewer, smaller incidents.
- Fewer moving parts → fewer failure modes. Each network hop between services is a place for bugs, latency and partial failure.

### 5. Simplicity → simple pieces, consistent everywhere
- **Monolith first** (well-modularized), split into services along real team or scaling boundaries — not because it's fashionable. A distributed system of tightly coupled microservices is the "three giant forgings" of architecture.
- Every service should be understandable on its own: one responsibility, clear API, its own data.
- **Consistency across services:** same health endpoints, logging format, metrics names, deploy pipeline, error conventions — a "golden path" template makes the right way the easy way.
- **Boring technology:** a few well-understood components the team knows deeply beat many trendy ones.

### 6. Testing → you only know what you've exercised
- Load tests to confirm capacity estimates; failover drills to confirm RTO/RPO; restore tests to confirm backups; chaos experiments to confirm resilience; eval suites for AI features.

## The three flaws in architecture

| Flaw | Architecture smell | Better |
|------|--------------------|--------|
| Unneeded code | Multi-region active-active, sharding, or a plugin framework "for later" with no requirement | Design so you *can* add them; build when evidence appears |
| Rigid design | Business logic coupled to one vendor's proprietary API everywhere; one shared database all services write to | Interfaces at boundaries; each service owns its data |
| Too generic | A home-grown "universal workflow platform" or "generic event bus for everything" | Solve the concrete problem with proven tools |

## Choosing technologies: the three tests in an interview

When you name a component, justify it briefly with the book's tests:

| Choice | Survival potential | Interoperability | Quality |
|--------|--------------------|------------------|---------|
| PostgreSQL | Decades of active development, many vendors | Standard SQL, many compatible services | Strong track record |
| Kafka | Huge adoption, multiple vendors/managed offerings | Open protocol, many clients; compatible alternatives exist | Mature, actively improved |
| Kubernetes | CNCF, every cloud offers it | Standard APIs and manifests portable across clouds | Large community, regular releases |
| A brand-new single-vendor datastore | Unknown | Proprietary API → lock-in | Unproven |

## A simplicity review for any architecture diagram

1. Can I state the system's purpose in one sentence? Does every box serve it?
2. What's the simplest design that meets today's numbers? (Use the [estimation](../fundamentals/systems/10-back-of-envelope-estimation.md).)
3. For each component: what value does it add, and what will it cost to operate for years?
4. Which decisions are hard to reverse? Can I make them reversible?
5. Is each service understandable alone? Are conventions consistent?
6. Where is complexity unavoidable (consensus, distributed transactions, ML)? Is it wrapped behind a simple interface or a managed service?
7. How will we *know* it works — load tests, drills, evals, monitoring?
8. What's the evolution path at 10× scale, and what evidence would trigger each step?

## Worked example: simplifying a design

**Over-engineered first draft** for an internal tool with 2,000 users: 8 microservices, Kafka, Cassandra, Redis, Elasticsearch, a service mesh, multi-region active-active.

**Applying the laws:**
- Purpose: help 2,000 employees track equipment requests. ~1 request/second at peak.
- Equation: each component adds years of maintenance; most add no user value at this scale.
- Change: keep the code modular so pieces can be split later if needed.
- Simplicity: one well-structured service + PostgreSQL (with full-text search) + a managed load balancer; nightly backups to another region; IaC for rebuilds.

**Result:** fewer failure modes, one deploy pipeline, a team of two can run it — and a documented path to add a queue or split services *if* usage grows 100×.

That's the answer interviewers love: the **simplest design that meets the requirements**, plus a clear story of how it evolves.

## Quick check

**Q: An interviewer asks you to design a URL shortener for 1,000 requests/day. You propose sharded Cassandra, Kafka, and a CDN. What would the laws say?**

A: You're over-engineering (too generic, unneeded components) and inflating maintenance effort. A single relational database with a cache — or even just the database — meets the need; mention how you'd evolve at 1,000× scale.

**Q: How do you apply the Law of Change to a third-party payment provider?**

A: Assume it may change (pricing, outages, new markets): put a thin internal interface in front of it, keep provider-specific code in one module, and store data in your own ledger — so adding or switching providers changes little code.

**Back to:** [Design 1: Purpose & the equation](01-purpose-and-the-equation-of-design.md) · [Interview framework](../framework.md)
