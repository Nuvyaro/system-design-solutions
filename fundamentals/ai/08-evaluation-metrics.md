# Evaluation Metrics: Precision, Recall, Thresholds & LLM Evals

> **In one sentence:** metrics tell you how often your model is right in the ways that matter — and the decision threshold lets you trade catching more positives against raising more false alarms.

## Everyday analogy

A smoke detector. Set it very sensitive and it catches every fire — but also goes off when you make toast (**high recall, low precision**). Set it very tolerant and it never bothers you — but may miss a real fire (**high precision, low recall**). The threshold is the sensitivity dial.

## See it in action

<div class="sim" data-sim="threshold"><em>Interactive animation available on the website.</em></div>

Drag the threshold. Items to the right are flagged as positive. Watch precision and recall change in opposite directions.

## The confusion matrix

| | Actually positive | Actually negative |
|---|---|---|
| **Predicted positive** | True positive (TP) | False positive (FP) |
| **Predicted negative** | False negative (FN) | True negative (TN) |

- **Precision** = TP / (TP + FP) → "Of what we flagged, how much was right?"
- **Recall** = TP / (TP + FN) → "Of all real positives, how many did we catch?"
- **F1** = harmonic mean of precision and recall.
- **Accuracy** is misleading with imbalance: if 0.1% of transactions are fraud, "never fraud" is 99.9% accurate and useless.

### Choose the threshold from costs
- Fraud: a missed fraud costs $500, a false decline costs $5 → favor recall.
- Auto-removing posts: a wrong removal hurts trust → favor precision for automatic action, send the uncertain middle to human review.

## Ranking & retrieval metrics

| Metric | Measures |
|--------|----------|
| **Recall@k** | Did the relevant items appear in the top k? (retrieval) |
| **Precision@k** | How many of the top k are relevant? |
| **MRR** | How high is the first relevant result? |
| **NDCG@k** | Are the most relevant items ranked highest? |
| **AUC** | How well the model separates positives from negatives across all thresholds |
| **Log loss / calibration** | Are predicted probabilities trustworthy? (critical for ads, fraud) |

## Evaluating LLM outputs

There's often no single right answer, so use a mix:
1. **Code-based checks** — valid JSON, unit tests pass, exact match on facts. Cheapest and most reliable.
2. **LLM-as-judge** — another model grades against a rubric (faithfulness, helpfulness). Calibrate against human labels; watch for position and length bias.
3. **Human evaluation** — gold standard for nuance; expensive, so sample.
4. **Online signals** — thumbs up/down, regenerations, task completion, A/B tests.

## Offline vs online

- **Offline** (before launch): held-out datasets, fast iteration, no user risk.
- **Online** (after launch): A/B tests on real users — the source of truth. Track **guardrail metrics** (latency, complaints, safety) so a "win" doesn't hide a harm.

## Where it shows up

[LLM Evaluation & Guardrails](../../ai-system-design/10-llm-evaluation-guardrails.md), [Content Moderation](../../ai-system-design/07-content-moderation.md), [Fraud Detection](../../ai-system-design/08-fraud-detection.md).

## Quick check

**Q: A cancer screening model must not miss cases. Optimize precision or recall?**

A: Recall — missing a real case is far worse than a false alarm that leads to a follow-up test.

**Q: Your LLM judge prefers the new prompt, but users don't. Likely cause?**

A: The judge isn't aligned with users — often verbosity bias (it rewards longer answers) or an eval set that doesn't reflect real traffic. Calibrate the judge with real user preferences.
