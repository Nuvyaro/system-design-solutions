# How LLMs Generate Text (Tokens, Prefill, Decode, KV Cache)

> **In one sentence:** an LLM reads your whole prompt at once, then writes the answer one token at a time, each time predicting the most likely next piece of text.

## Everyday analogy

A super-powered autocomplete. First it reads the entire message you've typed so far (fast, all at once). Then it suggests the next word, adds it, looks again, suggests the next word… until it decides to stop. To avoid re-reading everything from scratch each time, it keeps notes about what it already read — that's the **KV cache**.

## See it in action

<div class="sim" data-sim="token-generation"><em>Interactive animation available on the website.</em></div>

Watch the two phases: **prefill** processes all prompt tokens in parallel, then **decode** produces output tokens one by one while the KV cache grows.

## Key ideas

### Tokens
Text is split into **tokens** (sub-word pieces): "unbelievable" → "un", "believ", "able". Roughly **1 token ≈ 4 characters ≈ 0.75 English words**. Pricing, context limits, and speed are all measured in tokens.

### The transformer, in one paragraph
Each token becomes a vector. Layers of **attention** let every token look at all earlier tokens to gather context ("it" → which noun?), followed by feed-forward layers. The final layer outputs a probability for every possible next token.

### Sampling
- **Temperature** controls randomness: 0 = always pick the top token (deterministic); higher = more creative/varied.
- **Top-p / top-k** limit choices to the most likely tokens.

### Two phases of inference

| Phase | What happens | Bottleneck | Determines |
|-------|--------------|------------|------------|
| **Prefill** | Process all prompt tokens in parallel | GPU compute | **Time to first token (TTFT)** |
| **Decode** | Generate one token per step | GPU memory bandwidth (reading all weights each step) | **Time per output token** |

### The KV cache
For every processed token, each layer stores its attention **keys and values**. Next steps reuse them instead of recomputing → huge speedup. But it uses memory: for a 70B model, ~0.3 MB per token. A 100k-token context ≈ 30 GB just for one conversation's cache. **KV cache memory usually limits how many users a GPU can serve at once.**

### Context window
The maximum tokens (prompt + output) the model can attend to. Bigger windows allow long documents, but cost more and can dilute attention — retrieval (RAG) is often better than stuffing everything in.

## Why this matters for system design

- Latency = TTFT + (output tokens × time per token). Long answers are slow; **stream** tokens to the user.
- Cost scales with tokens in and out → trim prompts, cache common prefixes (system prompts), pick smaller models when possible.
- Serving efficiency depends on **batching** many users per GPU — see [LLM Serving & Batching](04-llm-serving-and-batching.md).

## Quick check

**Q: A user sends a 50k-token document and asks for a 100-token summary. Which phase dominates latency?**

A: Prefill — processing 50k input tokens; the 100-token decode is short by comparison.

**Q: Why do long conversations get more expensive per message?**

A: Each new message re-sends the whole history as input tokens (unless prefix caching reuses it), and the KV cache grows with context length.
