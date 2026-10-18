# System Design Interview Scoring Rubric (Junior → Staff)

> How interviewers typically evaluate a system design interview, and what each level looks like. Use it to grade your own practice sessions — record yourself or ask a friend to score you.

<div class="sim" data-sim="pipeline" data-title="Signals by level" data-steps="Junior|Mid-level|Senior|Staff+" data-labels="Working design with guidance; knows the building blocks|Complete design independently; justifies choices|Drives the session; deep trade-offs; failure modes unprompted|Frames trade-offs as business decisions; spots hidden requirements; simplifies"><em>Interactive animation available on the website.</em></div>

## The six dimensions

| Dimension | What the interviewer asks themselves |
|-----------|--------------------------------------|
| **1. Problem exploration** | Did they clarify the right things and scope sensibly? |
| **2. Estimation & constraints** | Did they find the numbers that matter and use them? |
| **3. High-level design** | Does the design meet all functional requirements end to end? |
| **4. Depth & trade-offs** | Can they go deep on the hardest parts and compare alternatives? |
| **5. Reliability & operations** | Do they handle failures, scaling, monitoring, security? |
| **6. Communication** | Clear, structured, collaborative; responsive to hints and pushback? |

For AI system design add: **7. ML/AI judgment** — problem framing as an ML task, data & labels, evaluation, model choice, cost/latency in tokens, safety.

## Level expectations

| Dimension | Junior | Mid-level | Senior | Staff+ |
|-----------|--------|-----------|--------|--------|
| Exploration | Needs prompting to ask questions | Asks core questions | Proposes scope and defaults confidently | Uncovers hidden requirements (compliance, cost, org constraints) |
| Estimation | Rough numbers with help | Correct numbers | Numbers drive decisions | Spots the one constraint that dominates the design |
| High-level design | Mostly complete with hints | Complete, sensible components | Clean, minimal, well-justified | Simplest design that works; knows what *not* to build |
| Depth | Knows what components do | Explains one deep dive well | Several deep dives with alternatives and trade-offs | Connects trade-offs to product/business impact; evolution over time |
| Reliability/ops | Mentions replication | Handles main failure cases | Proactively covers failures, hot spots, consistency, observability | Operability, migration paths, team ownership, cost |
| Communication | Follows interviewer's lead | Structured, checks in | Drives the session, handles pushback well | Teaches; aligns stakeholders; disagrees constructively |

## Score sheet (copy for practice)

Rate 1–4 (1 = missing, 2 = weak, 3 = solid, 4 = excellent):

| Dimension | Score | Notes |
|-----------|-------|-------|
| Problem exploration | | |
| Estimation | | |
| High-level design | | |
| Depth & trade-offs | | |
| Reliability & operations | | |
| Communication | | |
| AI judgment (AI roles) | | |

**Typical bar:** mid-level ≈ mostly 3s; senior ≈ 3s with several 4s, including depth and reliability; staff ≈ 4s on depth, trade-offs, and communication.

## Red flags that sink otherwise good interviews

- Designing before understanding the problem.
- Can't explain why a component is there.
- Refuses to change a design when shown a flaw — or changes everything at the first hint.
- No consideration of failure at all.
- For AI roles: no evaluation plan; "the model will handle it" for security or correctness.

## Green flags interviewers remember

- "Here are two options; I'll pick B because of our read-heavy workload, accepting slower writes."
- "Let me sanity-check this with numbers."
- "If this component fails, users would see X; we mitigate with Y."
- "What I'd build first is the simple version; here's how it evolves at 10× scale."
- For AI: "We'll measure it with…" before "We'll use model X."

## How to practice with this rubric

1. Pick a problem from this repo; read only the interview question.
2. Set a 45-minute timer and talk out loud (use the site's **Practice mode**).
3. Score yourself honestly with the sheet above, then read the solution.
4. Write down the one dimension to improve next time.
5. Repeat with a friend playing interviewer, using the follow-up questions as pushback.
