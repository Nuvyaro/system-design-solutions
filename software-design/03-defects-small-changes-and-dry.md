# Design 3: Defects, Small Changes, Evidence & DRY

> **In one sentence:** every line you add or change can introduce a bug, so make small changes, only fix problems you have evidence for, and keep each piece of information in exactly one place.

> 📖 *Based on* **Code Simplicity** *by Max Kanat-Alexander (O'Reilly, 2012). Summarized and adapted in our own words.*

## The Law of Defect Probability

> **"The chance of introducing a defect into your program is proportional to the size of the changes you make to it."** — Code Simplicity

Even excellent programmers introduce defects at some rate per line written. So **more change = more defects = more maintenance**. Informally: you can't introduce new bugs if you don't add or modify code.

This conflicts with the Law of Change (software *must* change). Balancing the two is exactly what design is for:

> **"The best design is the one that allows for the most change in the environment with the least change in the software."** — Code Simplicity

Good abstractions, configuration in the right places, and clear module boundaries let the world change (new database, new tax rule, new client) while the code changes very little.

## Small changes win

| Big-bang change | Small changes |
|-----------------|---------------|
| Thousands of lines at once | Tens to hundreds of lines |
| Hard to review, hard to test | Easy to review and test |
| If it breaks, which part? | Easy to find and roll back |
| High defect probability | Low defect probability per step |

This is why modern practice favors small pull requests, trunk-based development, feature flags, and frequent deploys — and why the [CI/CD lessons](../devops/11-ci-cd-with-github-actions.md) emphasize rolling updates and canaries: small, observable, reversible steps.

## Don't fix what isn't broken

> **Rule:** Never "fix" anything unless it's a problem, and you have evidence that the problem really exists.

- **Evidence** = users reporting it, metrics showing it, or you reproducing it — not a hunch.
- Some "bug reports" are users who couldn't find an existing feature → the real fix is discoverability.
- If most users think intended behavior is a bug, treat it as a bug.

### Premature optimization
Optimizing code before measuring that it's slow solves a problem nobody has, adds complexity, and risks bugs. Only optimize where you can **show** a real performance problem for users; elsewhere, prefer simplicity and flexibility.

In system design terms: **measure first** — profile, look at p99 latency and resource metrics ([observability](../devops/19-observability-and-alerting.md)) — then optimize the actual bottleneck. Your [back-of-envelope estimates](../fundamentals/systems/10-back-of-envelope-estimation.md) are the interview version of evidence: they tell you which component truly needs scaling work.

## Don't Repeat Yourself (DRY)

> **Rule:** In any particular system, any piece of information should, ideally, exist only once.

- If the label "Password" is hard-coded on 100 screens, renaming it is 100 changes (and 100 chances to miss one).
- Copy-pasted code means every bug fix must be applied in N places.
- Reuse through functions, modules, shared configuration, and single sources of truth reduces both code size (fewer defects) and future change effort.

DRY at the architecture level:
- **One source of truth** per piece of data (a single system of record; caches and replicas are derived copies).
- **Schemas and contracts defined once** (OpenAPI/Protobuf) and generated for clients.
- **Infrastructure as code** with shared modules instead of hand-built, slightly different environments ([Terraform](../devops/18-infrastructure-as-code-terraform.md)).

> ⚠️ DRY is about duplicated *knowledge*, not text that merely looks similar. Two pieces of code that look alike but change for different reasons can stay separate — forcing them together couples unrelated things.

## Quick check

**Q: You want to refactor a module "because the code style is old," but it has no bugs and nobody needs to change it. Should you?**

A: Usually not. Without evidence of a problem (bugs, or upcoming changes made hard by the code), the refactor adds risk and effort for no value. Refactor when you need to change that code.

**Q: How does "the best design allows the most change in the environment with the least change in the software" apply to choosing a database client?**

A: Using a standard interface (e.g., SQL through a common driver/ORM layer) means switching databases or versions requires minimal code changes, whereas vendor-specific calls sprinkled everywhere require changing the whole codebase.

**Next:** [Simplicity, readability & consistency](04-simplicity-readability-and-consistency.md)
