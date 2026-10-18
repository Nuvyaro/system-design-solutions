# Reliability 6: Incident Response, On-Call & Postmortems

> **In one sentence:** when things break, a clear process — declare, assign roles, mitigate first, communicate, then learn through a blameless postmortem — turns chaos into a fast, calm recovery.

**Level:** Intermediate · **You'll learn:** severity levels, incident roles, the incident lifecycle, mitigation-first thinking, runbooks, communication, blameless postmortems, and healthy on-call.

## See it in action

<div class="sim" data-sim="pipeline" data-title="Incident lifecycle" data-steps="Detect|Triage & declare|Assemble roles|Mitigate|Communicate|Resolve|Postmortem|Follow-ups" data-labels="Alert, customer report, or anomaly|Assign severity; open an incident channel|Incident commander, ops lead, comms lead|Stop the bleeding: rollback, failover, scale, disable feature|Status page + internal updates on a schedule|Service healthy and stable; monitor|Blameless review within a few days|Tracked action items that prevent recurrence"><em>Interactive animation available on the website.</em></div>

## Severity levels (example)

| Severity | Definition | Response |
|----------|------------|----------|
| **SEV1** | Major outage or data loss/security breach affecting many customers (checkout down, region lost) | Page immediately, all hands, exec + customer comms, updates every 30 min |
| **SEV2** | Significant degradation or a key feature down for some customers | Page on-call, incident commander, updates hourly |
| **SEV3** | Minor impact, workaround exists | Handle in business hours |
| **SEV4** | No customer impact (internal tooling, near miss) | Ticket |

When unsure, **declare higher** — downgrading is cheap, delayed escalation is expensive.

## Incident roles

| Role | Responsibility |
|------|----------------|
| **Incident Commander (IC)** | Coordinates, decides, keeps the timeline, does *not* debug |
| **Operations / tech lead** | Leads investigation and mitigation with subject-matter experts |
| **Communications lead** | Status page, customer support, stakeholders |
| **Scribe** | Records actions and timestamps in the incident channel/doc |

In small teams one person may hold several roles — but someone must explicitly be IC.

## Mitigate first, root-cause later

During an incident the goal is to **restore service**, not to understand everything:
- Recent deploy? **Roll back** (see [rollouts](06-kubernetes-workloads.md)).
- Region or zone failing? **Fail over** (see [High availability](17-multi-region-high-availability.md)).
- Overload? **Scale up, shed load, enable rate limits**, disable expensive features via flags.
- Bad data? Stop the writer, restore from **point-in-time backup** (see [Backup & restore](16-backup-and-restore.md)).
- Dependency down? Degrade gracefully (cached data, queue writes for later).

Investigate the root cause once users are no longer affected.

## Runbooks

A runbook is a step-by-step guide for a known situation, linked from the alert:

```markdown
# Runbook: notes-api high error rate
1. Check the deploy dashboard: was there a release in the last 30 min? → `kubectl rollout undo deployment/notes-api -n notes-prod`
2. Check Redis/DB health panels. Redis down? → readiness fails → pods drop out. See "Redis failover" runbook.
3. Check the error logs: `kubectl logs -n notes-prod deploy/notes-api --since=15m | grep ERROR | head`
4. Still unclear after 15 min → escalate to SEV2, page the database on-call.
Rollback is always safe: v(n-1) is compatible with the current schema (expand/contract migrations).
```

Keep runbooks **somewhere that survives the outage** (not only on a wiki hosted in the failed region).

## Communication

- One incident channel per incident; pinned summary with current status, impact, IC name, next update time.
- Customer status page: what's affected, what we're doing, next update time — honest and plain-language.
- Regular cadence even with no news ("still investigating, next update in 30 minutes").

## Blameless postmortems

Within a few days of any SEV1/SEV2 (and interesting near misses), write a postmortem. **Blameless** means focusing on how the system and process allowed the failure, not on who made a mistake — people hide information when they fear blame.

```markdown
# Postmortem: Checkout errors, 2026-10-12 (SEV2, 42 min)
## Summary          — what happened, impact (users, revenue, data), duration
## Timeline         — UTC timestamps: first error, detection, declare, mitigation, resolved
## Root cause(s)    — technical + contributing factors (why tests/alerts didn't catch it)
## What went well   — fast rollback, clear comms
## What went poorly — 18 min to detect; runbook outdated
## Action items     — owner + due date + ticket for each
   - Add burn-rate alert on checkout SLO (owner: A, due: 10/20)
   - Canary deploys for payment-service (owner: B, due: 11/01)
```

Track action items to completion and review postmortems in a regular meeting to spread lessons.

## Key metrics

- **MTTD** (time to detect), **MTTA** (to acknowledge), **MTTR** (to recover/resolve).
- Incidents per month by severity; repeat incidents (same root cause) — the best signal that follow-ups aren't happening.

## Healthy on-call

- Rotations with primary + secondary; handoff notes each shift.
- Fewer than ~2 actionable pages per shift is a common target; fix noisy alerts aggressively.
- Compensation/time off for out-of-hours pages; no one is on-call alone without training (shadowing first).
- **Game days** to practice (see [Chaos engineering & DR drills](21-chaos-engineering-and-dr-drills.md)).

## Quick check

**Q: An incident starts 10 minutes after a deploy. You suspect the deploy but aren't sure. What do you do first?**

A: Roll back. Rolling back a suspected release is fast and low-risk; investigate after service is restored. (This is why releases must stay backward compatible.)

**Q: Why should the incident commander avoid debugging?**

A: Debugging consumes full attention; the IC's job is coordination — tracking who is doing what, making decisions, ensuring communication. Without that, efforts duplicate and stakeholders are left in the dark.

**Next:** [Chaos engineering & DR drills](21-chaos-engineering-and-dr-drills.md)
