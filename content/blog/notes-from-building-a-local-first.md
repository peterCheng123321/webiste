---
title: "Notes from building a local-first legal AI tool on a Mac"
description: "Lessons from shipping a local-first legal AI workflow on Apple silicon."
date: 2026-05-03
tags:
  - local-first
  - ai
  - substack
source: substack
canonical: https://petercheng2.substack.com/p/notes-from-building-a-local-first
draft: false
---

[

![a close up of a laptop keyboard with a blurry background](https://images.unsplash.com/photo-1633185079166-510a332eb8cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMDAzMzh8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwY29kZXxlbnwwfHx8fDE3Nzc3ODgzMDl8MA&ixlib=rb-4.1.0&q=80&w=1080)

](https://images.unsplash.com/photo-1633185079166-510a332eb8cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMDAzMzh8MHwxfHNlYXJjaHwxfHxtYWNib29rJTIwY29kZXxlbnwwfHx8fDE3Nzc3ODgzMDl8MA&ixlib=rb-4.1.0&q=80&w=1080)Photo by [Tai Bui](https://unsplash.com/@agforl24) on [Unsplash](https://unsplash.com)

Most agentic AI today assumes cloud everything: cloud LLMs for the answers, cloud embedders for retrieval, cloud OCR for documents. That works fine for “summarize this article” demos. It’s the wrong default for serious legal practice — the documents are sensitive, the queries are repetitive, the cost adds up, and the latency makes the tool feel sluggish exactly when you need it to feel sharp.

I’ve been building AgentFlow, a Mac-native research and drafting tool for Chinese law practice. Over the past few weeks I’ve been replacing cloud calls with on-device equivalents one at a time. The results have been surprising enough that I want to write them down.

The short version, on a 23-file test corpus from a real labor-dispute matter:

0 cloud OCR calls (down from all of them). Estimated OCR wall time: 13s instead of 161s — a ~12× speedup. Same retrieval quality, sometimes better, using hybrid retrieval plus a reranker, both running locally. All of this on an M-series Mac, with no extra Python services beyond a single MLX sidecar.

The components are not novel. The combination is.

## Why local-first, specifically for this use case

I started where everyone starts: cloud LLM for chat, cloud OCR for documents, a small embedder for retrieval. It worked. It was also annoying. Three problems compounded on each other.

Latency you can feel. A 7-second OCR call doesn’t sound bad until you upload 40 documents and watch a progress bar for two minutes. Lawyers will close the tab.

Cost that scales with document volume. Cloud OCR per image, cloud embeddings per chunk, cloud LLM per query. A 30-document matter can rack up dozens of API calls just on intake.

Privacy posture. “Send your client’s evidence to a third-party API” is a sentence I’d rather never say to a working lawyer.

Apple Silicon changes the math. The Neural Engine, unified memory, MLX — they’re a quiet revolution in what you can do without leaving the device. So I started replacing components, one at a time.

## OCR: Apple Vision Framework, with a cloud fallback

Apple’s VNRecognizeTextRequest has shipped on every Mac since macOS 11. It supports Chinese Simplified and Traditional natively, runs in 100–500ms per page on Apple Silicon, requires zero install, and costs nothing. The quality on clean printed Chinese text is shockingly close to what you get from cloud vision-language models.

The integration is a small Swift HTTP bridge running inside the SwiftUI app process. The Go backend sends a file path; the bridge runs Vision (or PDFKit for text-native PDFs); JSON comes back. Real result on a 律师函 PNG: 746ms, full Chinese text including section headers, statute citations, and structured prose. The cloud equivalent took ~8 seconds for the same file.

The more interesting insight is that most of your “OCR” load isn’t OCR at all. Word-exported PDFs have an extractable text layer. Docx files are XML. Plaintext is plaintext. A simple file-type gate routes these to a passthrough that takes microseconds and produces 100% accurate text. On the test corpus, 43% of files needed no OCR whatsoever. The speedup doesn’t come from faster OCR — it comes from skipping OCR for nearly half the documents.

## 

The naive ingestion pipeline routes files by extension. The real world doesn’t respect extensions: PDFs that are actually HTML, HEIC files saved as JPG, screenshots saved as PDF. Routing by extension fails silently and in ways that are hard to debug.

The gate I built reads the first 4KB of each file for format detection, runs PDFKit text-layer extraction for PDF triage, and uses image dimensions plus EXIF presence to distinguish camera photos from screenshots from scans. The whole classification takes ~5 milliseconds per file and slots each document into one of eight categories: text-native PDF, scanned PDF, phone photo, screenshot, scan, mislabeled, and so on.

The gate then picks the cheapest viable engine: passthrough for things that don’t need OCR, Vision for things it can handle, and hybrid Vision-then-cloud for hard cases. On the 23-file corpus, this routing resulted in 0 cloud OCR calls — every file had a local path that worked.

## 

I’d been running multilingual-e5-small for retrieval. It’s a fine model — but Qwen3-Embedding-0.6B sits one tier higher on the multilingual MTEB leaderboard (64.3 vs ~57 for e5-small) and is substantially better on Chinese specifically (66.3 on C-MTEB). The 4-bit DWQ quantized version is 335MB on disk, comparable footprint to full-precision e5-small, but with materially better recall.

Qwen released MLX-quantized variants on Hugging Face. The mlx-embeddings library handles loading and inference. A small Python sidecar (~200 lines) hosts an HTTP /embed endpoint with idle eviction: the model frees its Metal memory after 5 minutes of inactivity, so it doesn’t sit in VRAM when no one is using it.

## Routing: three descriptions, not thirty examples

The system has an intent router that classifies each chat turn: is the user asking me to draft something? Answer from documents? Just chatting? The naive approach is to embed a few dozen example utterances per intent and do cosine similarity at query time.

I started there. It worked. Then I started adding exemplars to handle edge cases. After a while I had ~30 exemplars and the router was at 70% accuracy on a synthetic eval — and was also fundamentally brittle. There is no list of phrasings you can enumerate that covers everything users will actually type.

The fix wasn’t more exemplars. It was sharpening the descriptions of the intents themselves. Three rich English+Chinese descriptions of “when does this intent apply”, embedded once at startup. Compare incoming query embeddings against those three descriptions.

After that change, plus an LLM-router escalation path for low-confidence cases, the router went to 96% mean accuracy across five seeds × 100 queries. The remaining failures were all flagged as low-confidence and routed to a reasoning-model fallback rather than silently misfiring.

The lesson here is generalizable: when an instruction-tuned embedder is the underlying tech, you should be writing instructions, not curating training examples.

## 

The standard production pattern for RAG is well-documented but underused in practice. Step one: hybrid retrieval using BM25 plus dense embeddings fused with Reciprocal Rank Fusion, pulling a top-50 candidate set. Step two: a cross-encoder reranker scores all 50 candidates against the query. Step three: the top-K of the reranked set goes to the LLM.

Most stacks skip the reranker. That’s a mistake. Industry benchmarks show the reranker alone is worth +12 to 17 percentage points of Recall@5 over hybrid retrieval alone — the largest single-step quality improvement available in modern RAG pipelines.

I added Qwen3-Reranker-0.6B-mxfp8 to the same MLX sidecar. It’s a generative model that emits “yes” or “no” tokens at the last position; the relevance score is softmax([no, yes])[1]. The mlx-embeddings library doesn’t expose this interface properly, so I wrote a small custom inference loop using mlx-lm.

Smoke test on a Chinese labor-dispute query against five candidate chunks:

`《劳动法》第三十六条                     → 0.0046  (most relevant)`

`《劳动争议调解仒裁法》第二十七条           → 0.0036`

`民法典第五百七十七条                      → 0.0021`

`北京是中国的首都                         → 2.7e-05  (~170x lower)`

`Apples grow on trees                    → 7e-06    (~660x lower)`

The relevant statutes score hundreds of times higher than off-topic chunks. The absolute values are small because the reranker is conservative on partial matches, but the relative ordering is what counts — and that ordering is exactly right.

## Reasoning: DeepSeek API for the heavy lifts

Local-first doesn’t mean local-only. There are two places where I deliberately reach for a cloud LLM — in this case DeepSeek’s API — because the latency hit is worth the quality jump.

The first is the answer side of RAG: once retrieval has narrowed the corpus to a few highly-relevant chunks, drafting a 800-word legal memo that synthesizes 《劳动法》 with the client’s specific facts requires reasoning capacity that local 7B-class models on a 32GB Mac can’t quite match. DeepSeek-V3 handles long-context Chinese legal reasoning at a quality-per-dollar that’s hard to argue with: roughly $0.27 per million input tokens, full Chinese fluency, and reliable structured-output adherence.

The second is the router escalation path. When the embed-router’s top-1 cosine score is within 0.05 of its second choice, I treat the classification as low-confidence and escalate to DeepSeek with the three intent descriptions inlined into a small system prompt. This costs ~80–120ms and a few hundred tokens, but it’s the difference between confidently routing 96% of traffic and silently misrouting the remaining 4%.

The actual call shape is unsurprising — OpenAI-compatible chat completions, with strict timeouts and a context-window guardrail before the request is built:

`// reasoningClient wraps DeepSeek’s chat-completions endpoint.`

`// Used for: (a) RAG answer synthesis, (b) low-confidence router escalation.`

`func (c *DeepSeekClient) Complete(ctx context.Context, req ReasoningRequest) (*Answer, error) {`

`    // Hard cap: never let a single request hang the UI.`

`    ctx, cancel := context.WithTimeout(ctx, 25*time.Second)`

`    defer cancel()`

`    // Guardrail: reject before we spend a token if context is over budget.`

`    if tok := approxTokens(req.System, req.Messages); tok > c.maxContextTokens {`

`        return nil, fmt.Errorf(“context %d > limit %d; trim retrieval”, tok, c.maxContextTokens)`

`    }`

`    body := chatBody{`

`        Model:       “deepseek-chat”,       // V3 for general; “deepseek-reasoner” for hard cases`

`        Messages:    buildMessages(req),`

`        Temperature: req.Temperature,        // 0.2 for routing, 0.6 for drafting`

`        Stream:      req.Stream,`

`        MaxTokens:   req.MaxTokens,`

`    }`

`    resp, err := c.post(ctx, “/chat/completions”, body)`

`    if err != nil {`

`        // Network or 5xx → caller decides whether to retry or degrade.`

`        return nil, fmt.Errorf(“deepseek: %w”, err)`

`    }`

`    return parseAnswer(resp)`

`}`

Three small things mattered more than I expected. First, a hard 25-second context timeout on every call — a hung request will block the UI thread and is worse than a clean error. Second, a token-count guardrail that rejects requests before they’re sent if the prompt is over budget; this catches retrieval bugs early rather than burning tokens on truncated context. Third, a clean toggle between deepseek-chat (V3, fast) and deepseek-reasoner (slower, but visibly better on multi-statute reasoning chains). Most queries don’t need the reasoner; the ones that do are obvious in retrospect.

## The full picture

Here’s everything running locally on the Mac, end-to-end:

`AgentFlow (Swift/SwiftUI)`

`  ├─ Vision OCR bridge     (127.0.0.1:8099, in-process)`

`  └─ UI`

`agentflow-serve (Go subprocess)`

`  ├─ Document gate         (magic-byte file classifier)`

`  ├─ OCR engine            (Vision → cloud fallback)`

`  ├─ Intent router         (embed → LLM escalation)`

`  ├─ RAG manager           (BM25 + dense + reranker)`

`  └─ Chat handler          (DeepSeek API)`

`mlx_embed_server.py (Python subprocess)`

`  ├─ /embed   →  Qwen3-Embedding-0.6B-4bit-DWQ`

`  └─ /rerank  →  Qwen3-Reranker-0.6B-mxfp8`

Two non-local pieces remain. Chat completions still go to DeepSeek’s API — local LLMs aren’t quite there yet for Chinese legal reasoning at production quality, and DeepSeek’s quality-per-dollar is hard to beat. Cloud OCR remains as a fallback for worst-case documents: handwritten text, stamps overlapping characters, low-DPI scans. The gate decides per-file whether to invoke it. Everything else runs on the device.

## 

Cross-encoder rerankers are awkward to host locally. The mlx-embeddings library treats every model as a bi-encoder — it returns embeddings, not the yes/no logits a real cross-encoder needs. I had to drop down to mlx-lm and write the inference loop myself. Doable, but not the “drop in this model” experience I expected.

Apple Vision is great until it isn’t. It loses to cloud models on stamps, handwriting, and low-resolution scans. The hybrid path handles this — Vision first, cloud per-page on low confidence — but you can’t ship Vision-only and call it done.

Eval-driven beats intuition-driven, every time. I tried tightening the router by adding exemplars: stalled at 70%. I tried “lean only on action verbs”: regressed because I’d stripped out Chinese vocabulary. I tried sharper semantic descriptions with a 5-seed × 100-query eval harness: hit 96%, reproducibly. Without the eval, I would have shipped the worse version and assumed the router was fine.

## What’s next

Local LLM for the answer side. Qwen3 generation models in MLX are getting close. The latency profile on a 32GB M-series machine is workable for non-streaming uses; streaming will need more work.

Per-page OCR routing for mixed PDFs. The current gate operates at the file level. Mixed PDFs — some text-native pages, some scanned — should route per-page to avoid over-calling the OCR engine.

Real-data reranker eval. I built a synthetic-question eval harness but haven’t run it at scale on real matter data. The +12–17pp Recall@5 numbers are from industry datasets; my own corpus might look different.

Confidence surfacing in the UI. The gate produces a (kind, confidence, hints) tuple per file. The upload view should show it — “Detected: scanned PDF · 92% confidence · using Vision OCR” — so users understand what just happened to their documents.

---

If you’re building agentic systems where the document corpus is sensitive and latency matters, the main thing I’d offer is this: don’t reach for cloud as the default. The Apple Silicon stack is more capable than it gets credit for, and the difference between cloud-everything and local-first-with-cloud-fallback is the difference between a tool that feels like an API wrapper and a tool that feels like an app.

---

*Originally published on [Substack](https://petercheng2.substack.com/p/notes-from-building-a-local-first).*
