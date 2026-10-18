# Design 6: Testing & the Six Laws on One Page

> **In one sentence:** you only know your software works to the extent you've accurately tested it — and the six laws of software design fit on a single page you can carry into every decision.

> 📖 *Based on* **Code Simplicity** *by Max Kanat-Alexander (O'Reilly, 2012). Summarized and adapted in our own words.*

## The Law of Testing

> **"The degree to which you know how your software behaves is the degree to which you have accurately tested it."** — Code Simplicity

Or, more bluntly: **unless you've tried it, you don't know that it works.**

What a test really tells you:
- **A precise question and an expected answer.** "When a first-time user presses Save with an empty title, the app shows 'Title is required'." Vague tests ("does it work?") give vague knowledge.
- **Accuracy matters.** A test that passes when the software is broken (or fails when it's fine) gives false knowledge.
- **You must observe results.** Failures need to be visible and specific.
- **Recency and environment matter.** A test from last month on your laptop says less about production today than a test from 5 minutes ago in a production-like environment.
- **Change invalidates knowledge.** Once you change code, you no longer know that it — or anything connected to it — still works. Hence automated tests run on every change.

This is the foundation for the CI pipeline in the [DevOps track](../devops/11-ci-cd-with-github-actions.md) (unit tests, manifest validation, smoke tests after deploy), for [restore drills](../devops/16-backup-and-restore.md) (a backup is untested until restored), for [DR drills and chaos experiments](../devops/21-chaos-engineering-and-dr-drills.md) (failover is untested until performed), and for [LLM evals](../ai-system-design/10-llm-evaluation-guardrails.md) (a prompt change is untested until the eval suite runs).

<div class="sim" data-sim="pipeline" data-title="What 'tested' really means" data-steps="Precise question|Expected answer|Run it|Observe result|Accurate?|Recent & realistic?|Re-run after every change" data-labels="Exact situation and input|Specific, checkable outcome|Automated where possible|Failures must be visible and specific|No false passes or false failures|Same version, production-like environment|Any change resets your knowledge"><em>Interactive animation available on the website.</em></div>

## The six laws (from the book)

| # | Law | In practice |
|---|-----|-------------|
| 1 | **The purpose of software is to help people.** | Judge every change by how it helps users |
| 2 | **The Equation of Software Design:** D = (Vn + Vf) / (Ei + Em), which over time reduces to Vf / Em | Reducing maintenance effort beats reducing implementation effort |
| 3 | **Law of Change:** the longer a program exists, the more likely any part of it must change | Keep code easy to change; don't predict specifics |
| 4 | **Law of Defect Probability:** defect chance is proportional to the size of the change | Make small changes; reuse; don't change without reason |
| 5 | **Law of Simplicity:** ease of maintenance is proportional to the simplicity of individual pieces | Keep each piece simple, consistent and readable |
| 6 | **Law of Testing:** you know how software behaves only to the degree you've accurately tested it | Test precisely, often, and after every change |

The book's two-sentence summary: reducing maintenance effort matters more than reducing implementation effort, and maintenance effort is proportional to the system's complexity.

## Key rules (paraphrased)

- Everyone who writes software is a designer; design decisions should be made by individuals with authority, not committees.
- Design quality should match how long the software will help people.
- Don't predict the future; decide based on what you know now.
- Avoid the three flaws: unneeded code, rigid design, over-generic design. Develop and design incrementally.
- The best design handles the most change in the environment with the least change in the code.
- Fix only problems you have evidence for; don't optimize prematurely.
- Keep each piece of information in one place (DRY).
- Be "stupid, dumb simple" for your audience; be consistent; make code readable; name things well; comment *why*.
- Simplicity requires design — continuously.
- Complexity comes from expanding purpose, more people, unnecessary change, bad technologies, misunderstanding, poor design, and reinventing wheels.
- Judge technologies by survival potential, interoperability, and attention to quality.
- When things get complex, look for the real problem underneath; ask "what problem are we solving?"; draw it on paper.
- Simplify in small steps; wrap unfixable complexity; rewrite only under strict conditions.

## Self-check for any design or pull request

- [ ] What user problem does this solve, and how much does it help?
- [ ] Will this make future maintenance easier or harder?
- [ ] Am I writing anything we don't need yet? Is it more generic than required?
- [ ] Is this the smallest change that solves the problem?
- [ ] Is every piece simple and consistent with the rest? Would a newcomer understand it?
- [ ] Is any knowledge duplicated?
- [ ] Do I have evidence for the problem I'm fixing?
- [ ] How do I *know* it works — what precise tests prove it?

**Next:** [Applying Code Simplicity to system design](07-applying-simplicity-to-system-design.md)
