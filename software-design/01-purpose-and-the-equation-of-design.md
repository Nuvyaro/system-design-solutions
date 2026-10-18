# Design 1: The Purpose of Software & the Equation of Design

> **In one sentence:** software exists to help people, and every design decision is a trade-off between the value a change brings and the effort it costs — where, over a long life, **maintenance effort matters far more than the effort to build it**.

> 📖 *This track summarizes and applies ideas from* **Code Simplicity: The Fundamentals of Software** *by Max Kanat-Alexander (O'Reilly, 2012, ISBN 978-1-4493-1389-0). The explanations, examples and exercises here are our own; short law statements are quoted with attribution. Read the book for the full argument.*

## The purpose comes first

The book starts from one guiding statement: **"The purpose of software is to help people."** Not to impress other engineers, not to use a fashionable technology, not "to make money" (money follows from helping people well).

That gives you a practical filter for every feature request, refactoring idea, or architecture proposal:

> *How does this help our users (or the people building for them)?*

If the answer is "it doesn't," drop it. If it does, write the answer down in one sentence — it often reveals what the real requirement is. ("Keyboard shortcuts help because users don't have to leave the keyboard" → so they must be **fast**.)

Value has two parts:
- **Potential value:** how much it helps when it helps (saving a life vs. making someone smile).
- **Probability of value:** how many people it helps, how often.

A rarely used feature can still be very valuable (accessibility for blind users), and a feature nobody can find or use has **no value right now** — releasing matters.

## The Equation of Software Design

The book's primary law ranks possible changes:

```
                value now + future value
Desirability = ───────────────────────────────────────────
               effort of implementation + effort of maintenance

      D = (Vn + Vf) / (Ei + Em)
```

- It doesn't say a change is right or wrong; it tells you **which options are better than others**.
- "Effort" includes everything: research, discussion, coding, reviewing, testing, deploying, and fixing the bugs it introduces later.
- "Doing nothing" is also an option you can score with the same equation.

## Over time, maintenance dominates

Software usually lives for years. Future value and maintenance effort keep accumulating; value now and implementation effort are paid once. So the equation **reduces** in the long run to:

```
D ≈ future value / effort of maintenance
```

> **"It is more important to reduce the effort of maintenance than it is to reduce the effort of implementation."** — Code Simplicity

## See it in action

<div class="sim" data-sim="design-equation"><em>Interactive animation available on the website.</em></div>

The quick hack is cheaper on day one. But if its maintenance cost grows each month while the designed version's shrinks, there's a **crossover** after which the hack has cost more — and it only gets worse.

What you want: changes whose maintenance effort **decreases** over time toward zero. What you must avoid: changes whose maintenance grows faster than their value.

## Design quality should match lifetime

> **"The quality level of your design should be proportional to the length of future time in which your system will continue to help people."** — Code Simplicity

A throwaway script for this afternoon needs little design. Anything that might live for years (most software outlives the plan) deserves careful design. When in doubt, assume it will live long.

## Connecting to system design interviews

- Interviewers reward **operability and maintainability**: fewer moving parts, managed services where sensible, clear ownership — that's lowering *Em*.
- "We could add Kafka, a service mesh, and five microservices" raises *Ei* **and** *Em*; justify each with value.
- When comparing options (e.g., [fan-out on write vs read](../classic-system-design/03-news-feed.md)), explicitly mention long-term maintenance and operational cost, not just day-one effort.

## Quick check

**Q: Option A takes 2 days to build but needs a manual fix every week. Option B takes 2 weeks and needs almost no upkeep. The system will run for 3 years. Which does the equation favor?**

A: Option B. Over 3 years, A's ~150 manual fixes dwarf the extra 8 days of implementation; long-term maintenance dominates the equation.

**Q: A teammate wants to rewrite a stable module "to use the new framework." How do you evaluate it?**

A: Ask what value it brings to users (now and future) versus its full effort — including migration risk, new bugs, and learning costs. If it doesn't reduce future maintenance or add user value, the desirability is low.

**Next:** [Change & the three flaws](02-change-and-the-three-flaws.md)
