---
title: "Loop Engineering: How to Make an AI Coding Loop Converge"
description: "Why your /loop keeps re-walking the same ground — and the progress-ledger discipline that fixes it"
date: 2026-06-27
tags:
  - agents
  - systems
  - substack
source: substack
canonical: https://petercheng2.substack.com/p/loop-engineering-how-to-make-an-ai
draft: false
---

You can already put a coding agent in a loop. Claude Code has /loop. The ralph-loop plugin wraps a Stop hook around the same idea. The Agent SDK lets you write a while loop by hand. As Geoffrey Huntley puts it, “Ralph is a Bash loop.”

What none of those give you is convergence. Run a naive loop on a real multi-step task and you watch it re-walk the same ground: it re-derives what it already figured out, redoes finished work, retries an approach that already failed, then either spins forever or declares a confident, false “done.”

Loop engineering is the discipline that fixes that. It is not a loop runner — the runners already exist. It is the convergence layer you put on top of them. The full open-source skill pack lives at github.com/peterCheng123321/loop-engineering.

## The one insight everything hangs on

Look at what actually crosses an iteration boundary. /loop re-fires the same prompt. The ralph-loop Stop hook re-injects the same prompt — its README is blunt: “The prompt never changes between iterations.”

So across that boundary, exactly two things carry state: the prompt text, and whatever is on disk. And here is the part people miss — a skill does not auto-activate on a re-fired prompt. Any discipline you want the loop to follow every iteration has to live in the prompt text, or in a file the prompt tells the agent to read. The convergence mechanism cannot be cleverness you hold in your head; it has to be durable and external.

## The progress ledger

The fix is one file — call it progress.md — that the loop reads first and updates last, every iteration. Its header pins down the loop: a goal, an exit_condition that is a machine-checkable end state, a completion_promise that is the exact string which ends the loop, a status, an iteration count against a max_iterations ceiling, a stall_count of consecutive no-progress iterations, and a verify_cmd that proves a step or the goal.

```

---
goal: make the JS test suite pass
exit_condition: `npm test` exits 0
completion_promise: DONE
status: in_progress
iteration: 3
max_iterations: 30
stall_count: 0
verify_cmd: npm test
---

## Plan  — what's left; finished steps are never redone
- [x] fix the failing auth test
- [ ] NEXT → fix the failing parser test

## Decision log  — append-only; a failed approach is never retried
- iter 2: patched the tokenizer regex → FAILED. Next: fix the grammar instead.
```

Below the header, two sections do the heavy lifting. The Plan checklist is forward state — what is left; the agent always picks the single next unchecked step, so finished work is structurally impossible to redo. The Decision log is backward state — what has already been ruled out; it is append-only, you never delete an entry, because a failed approach that stays written down is a failed approach that never gets retried.

Reading the ledger first and doing one verified step per iteration is the whole trick. A NEXT marker in the Plan is the unambiguous hand-off, so the next iteration resumes instead of re-deriving.

One subtlety: these loops run in-session. Context accumulates until compaction — it is not fresh each iteration, which is the external Bash-loop version of Ralph. So the ledger’s job is not to reconstruct from nothing; it is to survive compaction and hand over an unambiguous next step. When in-context memory and the file on disk disagree, the file wins.

## The five invariants of a loop that converges

A robust loop is the ledger plus a few non-negotiables. Miss one and it fails in a predictable way.

### A machine-checkable exit

A task tells the loop what to do; a done-condition tells it when it is over. Phrase the goal as “X is true,” where X is a command that exits zero or non-zero. If you cannot write that command, the goal is not loop-ready — it needs human judgment each pass, and a loop is the wrong tool.

### A verification gate

A step is done only when evidence passes this iteration — a test run, a build, an observed behavior. The model’s self-report — “should work,” “looks correct” — is never evidence. Without this gate the loop checks off work it merely believes it finished, and you are back to a false done.

### Guardrails

An unbounded loop fails two ways: it spins forever, or it burns money and does damage while spinning. Set every bound before iteration one — an iteration cap, a stall cap that stops after a few consecutive no-progress iterations, a token or wall-clock budget, and an irreversible-action gate. Because the loop runs unattended, confirming before an irreversible action means denying the tool, writing status blocked, and handing off — there is no human standing by to click yes.

### Orchestration, only when you need it

Default to plain serial iteration: one step, one iteration. Fan out only when a step genuinely decomposes into independent units. When a step is itself a multi-step task, give it its own child loop with its own ledger, and never merge their counters. Over-orchestrating a simple loop just adds races and hides progress.

### Observability and escalation

A loop you cannot see fails silently. Every iteration should leave one durable line a human can read — past tense, with the verify result and the next step. And the loop must know when to stop and ask: repeated failure, genuine ambiguity the task never resolved, or an irreversible or expensive action. When a trigger fires, write status blocked and escalate. A blocked loop that asks for help beats a confident loop that is wrong — and you never fake the completion promise to escape.

## The patterns fall out of this

Once the invariants are in place, the common loop shapes are just wiring. Build-until-green is the canonical loop: exit when the tests or the build go green, and the test run itself is the evidence. Until-dry discovery fixes every lint error or migrates every call site, exiting when the discovery query finally returns empty. Fan-out-then-verify splits one step into many independent units, runs them in parallel, and then has a single gate confirm the batch. Self-pacing poll waits on CI or a long job, sleeping between checks instead of burning iterations. Budget-bounded depth caps open-ended exploration by iterations or tokens and takes the best effort it can.

## How you actually run it

The authoring step is a scaffold: give it a one-line task and it writes the initialized progress.md plus a loop prompt with the per-iteration protocol baked into the text — read the ledger first, do the single next step, verify it, record the result, never retry a logged failure, and exit only on a verified exit_condition. Then you hand that prompt to a runner: ralph-loop with a max-iterations cap and a completion promise, the same body under /loop, or a hand-rolled convergent loop in the Agent SDK.

```
/ralph-loop "Follow progress.md. \
  Read it first. Do the SINGLE next unchecked step. \
  Verify with `npm test`; on pass, check it off + log one line. \
  On fail, log it + a DIFFERENT next step. \
  Exit only when `npm test` exits 0: output <promise>DONE</promise>." \
  --max-iterations 30 --completion-promise "DONE"
```

That is loop engineering: stop building cleverness into your head, and start building it into the prompt and one file on disk. The loop that reads its own progress first is the loop that finally stops re-walking it.

The full pack — an entry skill plus six invariant skills, each with parallel Claude Code and Agent SDK treatments — is on GitHub at github.com/peterCheng123321/loop-engineering.

---

*Originally published on [Substack](https://petercheng2.substack.com/p/loop-engineering-how-to-make-an-ai).*
