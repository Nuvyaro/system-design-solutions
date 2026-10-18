# AI 17. Design an LLM Gateway (AI Gateway for a Company)

## Interview question

> Your company has 40 teams building LLM features on several providers (hosted APIs plus self-hosted open models). Costs are exploding, API keys are scattered, an outage at one provider took down three products, and nobody knows which team spends what. Design a central LLM gateway.

## Clarifying questions

| Question | Assumed answer |
|----------|----------------|
| Traffic | 20M LLM calls/day, peak 1,500 req/s, mostly streaming |
| Providers | 3 hosted API providers + an internal inference platform |
| Must add latency? | < 20 ms overhead (excluding the model) |
| Features | Unified API, routing/fallback, caching, quotas/budgets, cost attribution, logging, guardrails hooks |
| Data policy | Some teams handle PII; certain data may only go to approved providers/regions |

## Requirements

**Functional:** one API (OpenAI-compatible style) for all models; virtual keys per team/app; routing rules and automatic fallback; exact and semantic caching; rate limits in tokens and dollars; usage/cost dashboards; request logging with redaction; policy enforcement (which data may go where).
**Non-functional:** highly available (it's now a critical dependency), low overhead, streaming-safe, secure secret handling, multi-region.

## Estimation

- 1,500 req/s peak; average stream duration ~8 s → **~12,000 concurrent open streams**. Gateways must be async/event-driven (one thread per stream won't scale).
- Logs: 20M calls × ~8 KB (prompt + response, redacted/truncated) ≈ **160 GB/day** → object storage + sampled indexing.
- Token accounting: 20M × ~3,500 tokens ≈ 70B tokens/day of metering events.

## API

```http
POST /v1/chat/completions
Authorization: Bearer vk_team-search_prod_…        # virtual key, not a provider key
{ "model": "smart-default", "messages": [...], "stream": true, "metadata": { "feature": "query-rewrite" } }
```
`smart-default` is an **alias** resolved by routing policy (e.g., provider A's large model, fallback provider B, then internal model).

## High-level design

```mermaid
flowchart LR
  APPS[Team services] --> GW[Gateway nodes<br/>async proxy, streaming]
  GW --> AUTH[Virtual keys & policies<br/>cached config]
  GW --> RL[(Token/$ rate limiter<br/>Redis)]
  GW --> CACHE[(Exact + semantic cache)]
  GW --> ROUTE{Router<br/>aliases, weights,<br/>health, cost, region}
  ROUTE --> P1[Provider A]
  ROUTE --> P2[Provider B]
  ROUTE --> P3[Internal inference platform]
  GW --> GRD[Guardrail hooks<br/>PII redaction, injection checks]
  GW --> EV[[Usage events]]
  EV --> METER[(Metering & cost DB)] --> DASH[Dashboards, budgets, alerts]
  EV --> LOGS[(Request logs<br/>redacted, sampled)]
  SEC[(Secrets vault<br/>provider keys)] --> GW
```

## Deep dive 1: routing and fallback

- **Aliases** decouple apps from vendors: teams ask for `fast`, `smart`, `vision`, or a pinned model; platform owners change mappings without code changes.
- **Policies:** weighted splits (A/B tests, gradual migrations), region pinning for data residency, "PII → only approved providers", cost-based routing (cheapest model that meets a capability tag).
- **Health-aware fallback:** track error rates, timeouts, and latency per provider/model (circuit breakers). On 429/5xx/timeouts before the first token, retry on the next provider in the chain. **After streaming has started, don't silently switch** — return an error event so the client can decide.
- **Request normalization:** translate the unified schema into each provider's format (messages, tool calls, structured output) and back.

## Deep dive 2: quotas, budgets, and cost attribution

- Limits in **tokens per minute and dollars per day/month** per virtual key, team, and feature — request counts are meaningless when one request can be 100× another.
- Pre-check with an *estimated* cost (prompt tokens counted locally + max_tokens), then **reconcile** with actual usage from the provider response.
- Every call emits a usage event: team, app, feature, model, input/output/cached tokens, latency, cost → streaming aggregation → chargeback dashboards and budget alerts at 50/80/100%.

## Deep dive 3: caching

| Cache | Key | Hit rate | Risk |
|-------|-----|----------|------|
| **Exact** | hash(model + params + messages) | Low–medium (retries, popular prompts) | Safe |
| **Provider prompt caching / prefix caching** | Stable prompt prefix | High for long system prompts | Requires stable prefix ordering |
| **Semantic** | Embedding similarity of the query (+ tenant + permissions) | Medium for FAQ-like traffic | Wrong answers for "similar but different" questions → high thresholds, opt-in per feature |

Never share cache entries across tenants or permission scopes; skip caching for non-deterministic creative tasks and tool-calling turns.

## Deep dive 4: security and compliance

- Provider keys live only in the vault/gateway; apps get revocable **virtual keys** with scopes.
- Optional **PII redaction** before sending to external providers; reversible tokenization if the answer must contain the data.
- Request/response logging with redaction, retention limits, and access control; per-team opt-outs.
- Hooks for input/output guardrails (see [Evaluation & Guardrails](10-llm-evaluation-guardrails.md)).

## Deep dive 5: being a critical dependency

- Stateless gateway nodes behind load balancers in multiple regions; config cached locally (keeps working if the control plane is down).
- Fail-open vs fail-closed per feature: if Redis (rate limiting) is down, allow traffic with local limits rather than block everything.
- Overhead budget: async I/O, connection pooling to providers, no blocking calls in the hot path (usage events are emitted asynchronously).

## Trade-offs

| Choice | Pro | Con |
|--------|-----|-----|
| Central gateway | Visibility, control, cost savings | New single point of failure → must be highly available |
| Unified API | Easy provider switching | Lowest-common-denominator risk for new provider features → allow pass-through |
| Semantic caching | Big savings on repetitive traffic | Can return subtly wrong answers |
| Retry before first token only | Safe fallback | Mid-stream failures still surface to clients |

## Follow-up interview questions

**Q: A provider has a 30-minute outage. What happens?**
A: Circuit breakers open after error-rate thresholds; aliases fail over to the next provider/model in each chain; quality-sensitive features may switch to degraded modes; dashboards show the shift; when health checks pass, traffic gradually returns.

**Q: How do you stop a buggy agent loop from spending $50k overnight?**
A: Per-key dollar budgets with hard caps, per-request max tokens, anomaly alerts on spend velocity, and automatic key suspension when a budget is exceeded.

**Q: How do you migrate a team from model X to model Y safely?**
A: Run their eval suite on both models, shadow-route a slice of traffic (log Y's answers without returning them), then shift a weighted percentage via the alias while watching quality, latency, and cost metrics.
