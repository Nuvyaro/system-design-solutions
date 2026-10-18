# Reliability 7: Chaos Engineering, Game Days & DR Drills

> **In one sentence:** chaos engineering deliberately injects failures — killed pods, slow networks, lost zones — in a controlled way to find weaknesses before real disasters do, and DR drills prove that your recovery plan actually works.

**Level:** Advanced · **You'll learn:** the chaos experiment method, what failures to inject, tools (Chaos Mesh, Litmus, cloud fault injection), game days, region-evacuation drills, and how to stay safe.

## See it in action

<div class="sim" data-sim="pipeline" data-title="A chaos experiment" data-steps="Steady state|Hypothesis|Limit blast radius|Inject failure|Observe|Abort or continue|Learn & fix" data-labels="Define normal: error rate < 0.1%, p99 < 300 ms|'Killing one API pod causes no user-visible errors'|Staging first; one pod; 5 minutes; abort button ready|Chaos Mesh PodChaos: pod-kill|Dashboards, traces, alerts|Stop immediately if SLOs are breached|Fix findings; automate the experiment"><em>Interactive animation available on the website.</em></div>

## The method

1. **Define steady state** with metrics users care about (error rate, latency, orders/minute).
2. **Hypothesize** that steady state continues during a specific failure.
3. **Minimize blast radius:** start in staging, small scope, short duration, clear abort criteria and an abort button.
4. **Inject** the failure.
5. **Observe** and compare to steady state.
6. **Learn:** fix weaknesses, then re-run — eventually automate experiments in CI or on a schedule.

You're not trying to break things for fun; you're **testing assumptions** ("we have 3 replicas, so a pod loss is fine") that are often wrong (the 3 replicas were on one node; the client had no retries; the alert didn't fire).

## What to inject

| Layer | Failure | What it tests |
|-------|---------|---------------|
| Pod / process | Kill pods, crash containers, OOM | Replicas, readiness, graceful shutdown, client retries |
| Node | Drain/terminate nodes | PDBs, anti-affinity, rescheduling speed |
| Network | Latency, packet loss, partitions, DNS failures | Timeouts, retries, circuit breakers, fallbacks |
| Dependency | Database failover, cache flush, third-party API down | Degradation paths, connection handling |
| Resources | CPU/memory stress, disk full | Autoscaling, limits, alerts |
| Zone / region | Block all traffic to an AZ; evacuate a region | Multi-AZ capacity, DR failover runbooks |
| Time / config | Clock skew, expired certificates, bad config push | Validation, rollback, alerting |
| People | On-call engineer unreachable; key credentials missing | Escalation, break-glass access, documentation |

## Tools

- **Chaos Mesh** and **LitmusChaos** — Kubernetes-native experiments as YAML (CRDs).
- **AWS Fault Injection Service**, **Azure Chaos Studio** — cloud-level faults (AZ power loss simulation, API errors).
- **Toxiproxy** — network faults between services in tests.
- Netflix's **Chaos Monkey** — the original: randomly terminate instances in production.

Example experiments from [`examples/reliability/k8s/chaos-experiments.yaml`](examples/reliability/k8s/chaos-experiments.yaml) (validated against the official Chaos Mesh CRD schemas):

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: kill-one-api-pod
  namespace: notes-staging
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces: [notes-staging]
    labelSelectors:
      app: notes-api
---
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: slow-redis
  namespace: notes-staging
spec:
  action: delay
  mode: all
  selector:
    namespaces: [notes-staging]
    labelSelectors:
      app: redis
  delay:
    latency: "300ms"
    jitter: "50ms"
  duration: "5m"
```

## Game days

A scheduled session where a team practices responding to a simulated incident:
- A facilitator injects failures (or announces a scenario: "us-east-1 is gone").
- The on-call team responds using real runbooks, dashboards, and roles (see [Incident response](20-incident-response-and-postmortems.md)).
- Observers note gaps: missing dashboards, outdated runbooks, slow access requests.
- End with a short postmortem and action items.

## DR drills: prove your RTO and RPO

| Drill type | What you do | Frequency |
|------------|-------------|-----------|
| **Tabletop** | Walk through the DR plan in a meeting; find gaps on paper | Quarterly |
| **Restore test** | Restore backups into an isolated environment; verify data; time it | Weekly/monthly (automated) |
| **Component failover** | Fail over the database to its replica; promote; fail back | Quarterly |
| **Region evacuation** | Shift all production traffic to the DR region for hours | 1–2× per year for critical systems |

Record the **actual** RTO and RPO achieved and compare to targets. Common discoveries: insufficient quota in the DR region, a secret or certificate only present in the primary, a hard-coded endpoint, a forgotten dependency, a runbook step nobody has permission to perform.

## Safety rules

- Start in staging; move to production only with mature monitoring and a tested abort.
- Small blast radius, limited duration (experiments end on their own — note `duration: 5m`).
- Notify stakeholders; avoid peak hours and freeze periods at first.
- Never run chaos without the ability to see impact in real time.
- Have an owner on hand who can stop the experiment instantly.

## Quick check

**Q: Your service has 3 replicas, yet killing one pod caused errors for 30 seconds. Name two likely causes.**

A: No readiness probe or graceful shutdown (traffic still routed to the dying pod), or clients without retries/timeouts. Also possible: all replicas were on the same node, or the remaining two couldn't handle the load.

**Q: Why run a region-evacuation drill instead of trusting the DR plan?**

A: Plans rot: dependencies change, quotas and secrets drift, people leave. Only an actual failover proves the RTO/RPO and reveals hidden single points of failure.

**Next:** [DevSecOps & supply-chain security](22-devsecops-and-supply-chain-security.md)
