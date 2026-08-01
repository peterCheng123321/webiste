---
title: Building a fault-tolerant LLM gateway
description: What broke, what we measured, and how failover plus latency-based routing held 99.9% uptime on a real product path.
date: 2026-03-02
tags:
  - backend
  - llm
  - systems
draft: false
---

When you put an LLM in a user-facing product path, the hard part is rarely the prompt. It is **everything around the call**: timeouts, provider outages, cost spikes, and the fact that “smart” failures look like hang time to the user.

This note is from building a gateway in front of multiple providers for a real counseling-adjacent product surface — not a toy chat demo.

## The shape of the problem

- Requests arrive from a distributed front (SSE + serverless).
- Tools run asynchronously; the user must not block on a single vendor.
- Cross-tenant leakage is unacceptable (vector search, logs, caches).
- Token spend has to stay bounded when a provider degrades.

## What we shipped

**Failover.** If provider A errors or exceeds a latency SLO, route to B without the client knowing.

**Latency-based A/B.** Prefer the healthy low-latency path when both are up; keep a small traffic share on the secondary so you notice when it dies.

**Caching with composite keys.** Dropped a large share of redundant database hits without serving stale tenant data.

**Defense in depth.** Row-level security plus middleware so even a bad query plan cannot cross tenants.

## Numbers that mattered

| Signal | Result |
|--------|--------|
| Uptime on the gateway path | **99.9%** |
| Redundant queries | **~40%** reduction |
| Concurrent users on the async path | **50+** without blocking |

## Takeaways

1. Treat providers as **unreliable dependencies**, not “the AI.”
2. Measure **p95 latency and error class**, not only average success.
3. Security is part of reliability: a correct answer for the wrong tenant is a severity-one bug.

If you are designing a similar layer, start with a boring state machine (open / half-open / closed) and only then add clever routing. Clever without fail-closed defaults will hurt you in production.
