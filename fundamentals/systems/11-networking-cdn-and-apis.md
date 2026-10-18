# Networking, CDNs & API Design

> **In one sentence:** a request travels from the user through DNS, a CDN, load balancers and services — and good API design makes that journey fast, predictable, and safe to retry.

## Everyday analogy

Sending a package: you look up the address (**DNS**), drop it at the nearest post office (**CDN edge**), it moves through sorting centers (**load balancers / gateways**) to the right desk (**service**). A clear, standard label format (**API contract**) means every post office knows what to do with it.

## See it in action: the life of a request

<div class="sim" data-sim="pipeline" data-steps="Browser|DNS lookup|CDN edge|Load balancer|API gateway|Service|Database" data-labels="Type a URL|Name to IP address|Static files served nearby|Pick a healthy server|Auth, rate limit, route|Business logic|Read or write data"><em>Interactive animation available on the website.</em></div>

## The pieces

| Piece | What it does | Interview notes |
|-------|--------------|-----------------|
| **DNS** | Translates `example.com` → IP | Cached with TTLs; can route by geography (GeoDNS) |
| **CDN** | Caches static/media content at edge locations near users | Cuts latency from ~150 ms to ~20 ms and offloads origin; use for images, video, JS/CSS |
| **TCP + TLS** | Reliable, encrypted connection | Handshakes cost round trips → keep connections alive, use HTTP/2 or HTTP/3 |
| **Load balancer / gateway** | Spreads load, auth, rate limits | See [Load Balancing](02-load-balancing.md) |

## Choosing a communication style

| Style | Best for | Notes |
|-------|----------|-------|
| **REST (HTTP + JSON)** | Public APIs, CRUD | Simple, cacheable, universal |
| **gRPC (HTTP/2 + Protobuf)** | Service-to-service | Fast, typed, streaming; less browser-friendly |
| **GraphQL** | Clients needing flexible data shapes | Avoids over-fetching; caching and cost control are harder |
| **WebSocket** | Two-way real time (chat, games) | Stateful connections |
| **Server-Sent Events (SSE)** | Server → client streams (LLM tokens, live scores) | Simple over HTTP |
| **Long polling** | Fallback real-time | Higher overhead |
| **Webhooks** | Notify another system of events | Sign payloads, retry, make receivers idempotent |

## API design checklist

- **Resources & verbs:** `POST /v1/orders`, `GET /v1/orders/{id}`; version in the path or header.
- **Pagination:** cursor-based (`?cursor=abc&limit=20`), not offset, for large/changing lists.
- **Idempotency:** `Idempotency-Key` header on POSTs with side effects.
- **Errors:** consistent shape; 4xx = client problem, 5xx = server problem; 429 with `Retry-After`.
- **Async operations:** return `202 Accepted` + a job ID; poll or receive a webhook.
- **Security:** authentication (OAuth/JWT), authorization per resource, input validation, rate limits.

## Where it shows up

[Video Streaming](../../classic-system-design/08-video-streaming.md) (CDN), [Chat System](../../classic-system-design/04-chat-system.md) (WebSockets), [Conversational Assistant](../../ai-system-design/04-conversational-assistant.md) (SSE streaming).

## Quick check

**Q: Why serve images from a CDN instead of your servers?**

A: Edge caches are physically closer (lower latency), absorb most of the traffic (cheaper, protects origin), and handle spikes.

**Q: Your chat app needs the server to push messages instantly. REST polling every second — good idea?**

A: No — it wastes requests and still adds up to a second of delay. Use WebSockets (two-way) or SSE (server → client).
