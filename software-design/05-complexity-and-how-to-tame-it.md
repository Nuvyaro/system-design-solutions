# Design 5: Where Complexity Comes From & How to Tame It

> **In one sentence:** complexity compounds — each feature must work with all the others — so guard your software's purpose, choose technologies carefully, look for the real problem beneath messy symptoms, and simplify in small steps instead of rewriting.

> 📖 *Based on* **Code Simplicity** *by Max Kanat-Alexander (O'Reilly, 2012). Summarized and adapted in our own words.*

## Complexity builds on complexity

Adding one feature to ten doesn't add 10% work: the new feature has to interact correctly with the existing ten. Without good design, cost grows much faster than the feature count — the road to the "never-shipping product."

## See it in action

<div class="sim" data-sim="complexity-growth"><em>Interactive animation available on the website.</em></div>

Slide the number of features up. With no design, interactions grow roughly with n²; with simple modules behind clear interfaces, each new feature mostly touches one place.

## Sources of complexity

The book lists common ways teams make software more complex:

| Source | What it looks like | Antidote |
|--------|--------------------|----------|
| **Expanding the purpose** | "Let's make the tax app also cook dinner" | Keep one clear purpose; say no |
| **Adding programmers** | More people → more coordination (Brooks' law) | Small, expert teams; clear ownership boundaries |
| **Changing things that don't need changing** | Churn in requirements, designs, code | Change only with evidence and value |
| **Locked into bad technologies** | Stuck on an unmaintained or proprietary dependency | Evaluate before adopting (below) |
| **Misunderstanding** | Code written without understanding the system/tools | Learn deeply; ask questions; prototype |
| **Poor or no design** | Each feature multiplies complexity | Design continuously, not once |
| **Reinventing the wheel** | Home-grown protocol, web server, or ORM | Use proven components unless one of the exceptions applies |
| **Violating the purpose** | Pop-ups and features that fight what users are trying to do | Align the product's purpose with the user's purpose |

Reinventing is reasonable only when what you need doesn't exist, all existing options are bad technologies that would lock you in, none can meet your needs, or they're unmaintained and you can't take them over.

## Judging a technology before you adopt it

The book offers three tests for spotting a "bad technology" early:

1. **Survival potential** — Will it still be maintained? Look at release history, responsiveness to bugs, community activity, and whether many organizations (not one vendor) depend on it.
2. **Interoperability** — How hard is it to switch away? Does it follow standards (SQL, HTTP, OpenTelemetry, OCI images, S3-compatible APIs, Kubernetes APIs)?
3. **Attention to quality** — Is it getting better and simpler with each release? Do maintainers care about quality and security?

After those filters, it's fine to pick the option your team finds simplest or enjoys more.

This is exactly how to justify choices in a design interview: *"PostgreSQL — long survival potential, standard SQL so we're not locked in, and a strong quality track record."*

## Complexity is a symptom: find the real problem

- **Square wheels:** if a car can't go fast, tuning the engine won't help; fix the wheels. When something seems "unsolvably" complex, the root cause is usually lower down in the design.
- **"How do I make this pony fly to the moon?"** — Ask *what problem are you trying to solve?* Maybe they just need some grey rocks from outside. Strip away assumptions and ask how the problem should ideally be solved; then reshape the code toward that.
- **Hard problems** (chess engines, spell checkers) don't require complex code — but they require extra simplification effort. **Draw it or write it out on paper**; many design problems dissolve on paper.

## Handling complexity: small steps

Redesign the individual pieces **in small steps**, each as small as you can safely make it without adding new complexity:
- Rename a confusing variable. Add a "why" comment.
- Split one tiny piece out of a giant file into its own module and clean it up. Repeat.
- Each time, imagine a system *slightly simpler* than today's and move toward it. You never need the "perfect" design — just better than now, continuously.

Don't stop shipping features for months to redesign. Instead, **redesign in service of the next feature**: simplify the code a feature will touch, then build the feature. The book's real example: a project that needed to support a second database replaced vendor-specific queries with standard ones file by file, wrapped the unavoidable differences behind small functions, simplified the installer, and tested after every step — ending up able to support four databases.

**Unfixable complexity** (hardware quirks, awkward third-party APIs): hide it behind a simple wrapper so the rest of the code stays simple.

## Rewrites: almost never

A full rewrite is an admission that the design failed; it often ends as complex as the original. The book's conditions for considering one — **all** must hold:
1. You've *measured* (by actually trying to redesign parts) that rewriting is more efficient than incremental redesign.
2. You have a lot of time for the new system.
3. You're a better designer than the original author (or have grown a lot).
4. You'll build it in small steps with real user feedback along the way.
5. You can keep maintaining the old system at the same time.

Otherwise: incrementally redesign. The strangler-fig pattern (route one capability at a time to new code) is the system-level version of this advice.

## Quick check

**Q: Adding a feature to a module keeps requiring hacks in five places. What does the book suggest you look at?**

A: The design beneath the symptom. The difficulty is a sign of an underlying design problem (like duplicated logic or a missing abstraction); simplify that first, and the feature becomes easy.

**Q: Your team proposes writing its own message broker because "Kafka is too heavy." Which questions should you ask?**

A: Does a suitable wheel already exist (SQS, RabbitMQ, NATS, Redis Streams)? Would building one become a huge in-house dependency that isn't your product? Only build it if none of the existing options can meet the need or all would lock you in.

**Next:** [Testing & the six laws](06-testing-and-the-six-laws.md)
