# Design 2: Change, the Unknowable Future & the Three Flaws

> **In one sentence:** you can't predict the future, but you can be sure your software will have to change — so design for what you know today, keep code easy to change, and avoid both under-design and over-engineering.

> 📖 *Based on* **Code Simplicity** *by Max Kanat-Alexander (O'Reilly, 2012). Summarized and adapted in our own words.*

## The Law of Change

> **"The longer your program exists, the more probable it is that any piece of it will have to change."** — Code Simplicity

In the next five minutes, probably nothing in your system changes. Over ten years, almost everything will: requirements, users, scale, libraries, regulations, hardware. The book backs this with data from a long-lived project where files received many times more line changes over the years than they originally contained, and almost no original lines survived.

Two consequences:
1. **You don't need to predict *what* will change** — only accept that change will come.
2. Predicting specific futures is the most common and costly design mistake. The book's guidance: base decisions on **known, present-time information**, while keeping the design flexible.

Designing *for* change ≠ predicting the future. Eating today makes any tomorrow better; you don't need to know what tomorrow holds.

## The three flaws

The book names three mistakes designers make when coping with change, from most to least common:

### 1. Writing code that isn't needed
YAGNI ("You Ain't Gonna Need It"). Code written "for later" usually has to be redesigned when the real need appears, and meanwhile it rots, confuses readers, and causes bugs.

> **Rule:** Don't write code until you actually need it, and remove code that isn't being used.

*Example:* adding an `is_active` column "for a future disable feature" that nothing reads. Years later people set it, nothing happens, someone writes code that half-uses it, bugs appear — and the eventual real feature needs a different design anyway.

### 2. Not making the code easy to change (rigid design)
Two causes:
- **Too many assumptions about the future** — e.g., a year-long upfront spec, three years of building to it, and users whose needs changed entirely in the meantime.
- **Too little design** — e.g., one 3,000-line file with copy-pasted validation and hard-coded strings that becomes impossible to extend (say, to accept updates by email instead of only a web form).

> **Rule:** Design based on what you know now, not on what you think will happen — without excluding future possibilities.

### 3. Being too generic (over-engineering)
Building a plug-in framework nobody asked for, or treating everything as "just bytes" so errors can't say "bad image." Over-generic code is still never generic enough for the *actual* future, handles specifics poorly, and is mostly unneeded code (flaw #1 again).

> **Rule:** Be only as generic as you know you need to be right now.

| Flaw | Smell | Fix |
|------|-------|-----|
| Unneeded code | "We'll need this later" | Delete it; add it when needed |
| Rigid design | Every change touches many places; big upfront specs | Small changes, real design on each, refactor as you go |
| Too generic | Frameworks, plug-ins, configs nobody uses | Solve today's concrete problem cleanly |

## Incremental development and design

The book's remedy for all three flaws: build the system **piece by piece**, and **improve the design before each new piece** so it fits naturally.

<div class="sim" data-sim="pipeline" data-title="Building a calculator incrementally" data-steps="Plan addition only|Build addition|Refactor for subtraction|Add subtraction|Refactor for multiplication|Add multiplication|Refactor for division|Add division" data-labels="The simplest useful piece|Working, released, tested|Make the next step easy|Still small, still clean|Design improves each round|Builds on addition|Now almost no work needed|Done — with a design that fits"><em>Interactive animation available on the website.</em></div>

- **Incremental development:** deliver the system in small working steps.
- **Incremental design:** before each step, reshape the existing design so the next step is easy.
- Order steps by **what's simplest next**; split big features into small logical steps.

## Connecting to system design

- **Start simple, evolve with evidence:** a monolith with a good module structure → split services when a real scaling or team boundary appears. Say this in interviews: *"Here's v1; here's how it evolves at 10× load."*
- **Avoid speculative generality:** don't add multi-region active-active, plug-in architectures, or a generic workflow engine unless requirements demand it.
- **Avoid rigid choices:** prefer reversible decisions (standard protocols, replaceable components) for the parts most likely to change.

## Quick check

**Q: A PM says "customers might want to use other email providers someday, so make the sender pluggable." No customer has asked. What does the book suggest?**

A: Don't build the plug-in system now — be only as generic as you know you need. Keep the email code clean and isolated so swapping or adding a provider is easy *when* there's a real need.

**Q: How is "designing for change" different from "predicting the future"?**

A: Designing for change means keeping code simple, small, and easy to modify so *any* future change is cheap. Predicting the future means building specific features or abstractions for a guessed future — which usually turns out wrong.

**Next:** [Defects, small changes & DRY](03-defects-small-changes-and-dry.md)
