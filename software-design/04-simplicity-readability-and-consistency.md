# Design 4: Simplicity, Readability & Consistency

> **In one sentence:** a system is only as maintainable as its individual pieces are simple — so make each piece "stupid, dumb simple" for its audience, consistent with the rest, and easy to read.

> 📖 *Based on* **Code Simplicity** *by Max Kanat-Alexander (O'Reilly, 2012). Summarized and adapted in our own words.*

## The Law of Simplicity

> **"The ease of maintenance of any piece of software is proportional to the simplicity of its individual pieces."** — Code Simplicity

Notice: *individual pieces*, not the whole system. Real systems are too big for anyone to hold in their head; we only ever understand them one piece at a time. So what matters is that **each piece is understandable when you look at it**.

Analogy from the book: a steel tower built from many standard girders vs. three huge custom forgings. Girders are easy to make, inspect, and replace; a flawed giant forging can't be removed without the tower falling, so you weld on patches. Software made of small, simple, self-contained pieces is the girder tower.

Simplifying code **now** is the main lever you control to make maintenance effort *decrease* over time (see the [equation](01-purpose-and-the-equation-of-design.md)) — and you don't need to predict anything to do it.

## Simplicity is relative

What's simple depends on the audience:
- Your own code always looks simple to you; read unfamiliar code to feel what newcomers feel.
- A long list of links is simple for an expert and bewildering for a beginner → provide a "New to this code?" entry point.
- Advanced tools can make code *simpler* when used well, as long as the result is easy for the target readers.

## How simple? "Stupid, dumb simple"

The book's blunt answer: if you want to succeed, aim for **stupid, dumb simple** for the intended audience. Think of the best mall map: a huge red "YOU ARE HERE" dot — not a tiny triangle explained in a footnote. People using your API, library, or service are busy; they don't want to study it like you did. It's not about intelligence — it's about knowledge they don't have yet.

## Be consistent

If you do something one way in one place, do it that way everywhere:
- Naming style (`snake_case` everywhere, or `camelCase` everywhere).
- Field names (`name` on every object lets generic code handle all of them).
- Behavior: if `dump()` in module A prints its state, `dump()` in module B should too.

Even a complex convention, applied consistently, is learned once. Inconsistency forces people to relearn the system at every step.

## Readability

Code is read far more often than written.

**Spacing shows structure.** Too little space hides boundaries; too much hides relationships:

```python
# cramped
total=price*qty;tax=total*rate;if(total>limit){alert("over")}

# readable
total = price * qty
tax = total * rate
if total > limit:
    alert("over")
```

**Names should say what something is or does — without being so long they hurt:**

```python
q = s(j, f, m)                                   # meaningless
quarterly_total = sum_months(jan, feb, mar)      # just right
quarterly_total_for_company_as_of_today = add_all_these_together_and_return(...)  # too long
```

**Comments explain *why*, not *what*.** If code needs a comment to explain what it does, first try to make the code simpler. Use comments for non-obvious reasons:

```python
# Retry with jitter: the payment provider rate-limits bursts from one IP.
time.sleep(random.uniform(0, 0.5))
```

Readable code isn't the whole of good design, but it's the usual **first step**: make messy code readable and the bugs (and simplifications) become visible.

## Simplicity requires design

Without deliberate design work, systems drift into complexity. Good design is often invisible — the outages that never happen get no applause — but it shows up as on-time releases, few incidents, and a codebase newcomers can learn quickly.

## Applying it to systems and services

| Principle | Code level | System level |
|-----------|------------|--------------|
| Simple pieces | Small functions/modules | Services with one clear responsibility; boring, well-understood components |
| Consistency | Naming, error handling | Same API conventions, logging format, deploy pipeline, health endpoints across services |
| Readability | Spacing, names, why-comments | Clear diagrams, runbooks, ADRs (architecture decision records) explaining *why* |
| Relative simplicity | Docs for newcomers | Golden paths/templates so a new service is "stupid simple" to create correctly |

## Quick check

**Q: A function is commented `# loop through users and sum balances`. Is that a good comment?**

A: Not really — it restates *what* the code does. Better: make the code self-explanatory (`total_balance = sum(u.balance for u in users)`) and comment only non-obvious *why*s.

**Q: Why does consistency count as simplicity even when the convention itself is a bit complex?**

A: Because you only learn it once. Every piece then behaves predictably, so readers can apply what they learned everywhere instead of relearning each part.

**Next:** [Complexity & how to tame it](05-complexity-and-how-to-tame-it.md)
