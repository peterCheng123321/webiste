# Personal site directions

Research only. Captured 11 November 2026. No application code in this change.

Peter Cheng is an Analyst at Deloitte China Technology & Transformation. His work is agentic systems and applied AI: LLM orchestration, RAG, and backend. This note does not add project outcomes, client names, or metrics.

The rebrand note chose idea B as the base: a project told as problem, architecture, and result, plus a text assistant that answers only from the site. [The X post](https://x.com/RajveeerrSingh/status/2107166753533120729) names [rajveers.com](https://rajveers.com/). Fetched the same day, the post showed about 10.2k views, 102 likes, and 110 bookmarks. The 25 October 2026 guideline supplies the coal, black, and white material system, glass on navigation only, and the four motion timings. Where a lock below differs from that guideline, the lock wins. The green period after Deloitte is one of those differences: it is not used.

The pages below were opened in a 1440×900 desktop browser. Each note covers layout, the first screen, how work is shown, interaction and motion, how the brand shows up, and how that fits these locks.

## Locked

| Decision | Locked choice |
| --- | --- |
| Font | Geist sans. Geist Mono only where mono is actually needed. Chinese fallback: PingFang SC, then Noto Sans SC. |
| Name | “Peter Cheng · 程钟泉” in the nav, title, footer, and social preview. |
| Line | “I build agentic systems that bring AI into real business processes.” |
| Title | “Analyst, Deloitte China Technology & Transformation.” |
| Appearance | Follows the system setting. Dark and light are both required. |
| Work in v1 | One public project: an anonymized AI agent case study (agentic system, LLM orchestration, RAG, backend). No client names. No invented metrics. Course Scheduler, ATS, IMU collector, and Library VR stay off the site. Blog posts stay drafts. |
| Language | English, a Chinese toggle, and a full Chinese version of the pages. |
| Contact | Email, LinkedIn, GitHub. No form. |
| Also in v1 | PeterOS, the page peel into PeterOS, the Shanghai day clock, a résumé PDF, and a text assistant. The assistant answers only from approved site content, says when it does not know, and is built against a provider seam with no live API key. |
| Mark | The PC core already in Figma, including the small size and the favicon. |
| Icons | Lucide, monochrome. Project screenshots are the only color imagery. |
| Domain | petercheng.dev. |
| Motion | The four families, at the guideline timings. Feel is judged later, on a preview. |

---

## Three directions

| Direction | What a visitor meets first | What carries the brand | Place in v1 |
| --- | --- | --- | --- |
| Quiet index | The locked name, title, and positioning line | Geist, space, and one next step into the case study | The shell, in both themes |
| Diagram case study | The problem, then one picture of the system | A monochrome diagram, plus a color screenshot where it is evidence | The one public project |
| Measured notebook | A dated list of notes | The archive, including unfinished work | Held. Posts stay drafts. |

---

## 1. Quiet index

A short page. The name, the title, the positioning line, and the way into the one case study are visible together. PeterOS, the clock, the résumé, and the assistant are on the page. They do not replace that sentence.

### Paco Coursey — [paco.me](https://paco.me/)

![Paco Coursey homepage: a narrow text column, an italic lede, and three short lists for Building, Projects, and Writing](images/paco.png)

**What is good.** The page is a document. The name is a modest heading. One sentence says what he does, a second says where he did it, and the page splits into Building, Projects, and Writing. Every item is a name plus one sentence. Underlined links are the only strong affordance. There is no card chrome and no visible motion.

**Fit.** This is the light-theme reading column: about 60–72 characters, Geist sans, the locked name, then the title and the positioning line. The index lists one project, not three columns of work. Contact is the three links, with no form and no “Now” essay. The same column has to work on the coal field when the system is dark. Chinese text uses PingFang SC, then Noto Sans SC, with the tracking on Latin type dropped for CJK.

### Emil Kowalski — [emilkowal.ski](https://emilkowal.ski/)

![Emil Kowalski homepage: name, role, a Today paragraph, and a Projects list of one-line descriptions](images/emil.png)

**What is good.** Name, role, a short Today, then Projects and Writing as stacks. Each project is a name and one line. His essay [You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations) is the motion check: give an animation a purpose, skip it on actions people repeat all day, keep ordinary interface motion under about 300ms, use ease-out when something enters or leaves, and honor reduced motion.

**Fit.** The four families stay at the guideline timings: 120ms for color and border, 280ms for navigation, 320ms for the mobile disclosure, 360ms for the project transition, and the PC resolve inside a 900ms maximum (240ms yield, 480ms settle). Reduced motion is instant. His essay is the reason those numbers stay short, and the reason the page peel and the PC mark have to stay interruptible. Feel, including whether the mark plays on load, waits for a preview. The course banner across his page is his business. Writing stays in draft, so his writing list is not a v1 block.

### Rauno Freiberg — [rauno.me](https://rauno.me/)

![Rauno Freiberg homepage: a large sentence over a yellow circle, with the edge of a Devouring Details panel visible](images/rauno.png)

**What is good.** One sentence fills the viewport. A yellow circle is the only chromatic decision, and it sits behind the type. The next surface is already peeking in, so the page admits it is one panel in a series. Craft studies live beside the biography. The sentence does not wait on them.

**Fit.** The first screen can be this confident and still be Geist: “Peter Cheng · 程钟泉”, the title line, and the positioning sentence, readable before anyone peels into PeterOS. The circle’s job is already taken by the Figma PC core, in white on coal or coal on white, including the small nav size and the favicon. The peel is the second surface, as his next panel is. Glass, if the nav uses it, stays on that nav in both themes. Yellow, and any other accent, stays out. There is no green period.

---

## 2. Diagram case study

v1 has one public project. It is an anonymized agent case study: agentic system, LLM orchestration, RAG, and backend. Opening it shows the problem, a small diagram, what Peter was responsible for, and the limit of the claim. The words of that page are still his to write. The shape is not.

### Om Jaiswal — [omjaiswal.dev/engineer](https://omjaiswal.dev/engineer)

![Om Jaiswal engineer page: a dark case study with a left-to-right service diagram and two decision notes under it](images/om-engineer.png)

**What is good.** The page is a case study. It states the problem, what he owned, then a diagram with a one-sentence caption. Decisions sit under the picture as claims with reasons. “Read this diagram as text” means the picture is not the only explanation. The order is problem, constraints, architecture, decisions, trade-offs, implementation, result.

**Fit.** Use that order for the one case study, in both themes. Keep the text alternative, the left-to-right flow, and a cap around seven nodes. Nodes are neutral. Labels and line style carry what his purple dots carry. Geist Mono is available for those labels if the label is genuinely a token or a step name; the prose stays Geist sans. No client name, no borrowed metric, and no second public project beside it. A screenshot of the work, if one is approved, stays in its real colors. Lucide icons on the page stay monochrome.

### Anthropic, “Building effective agents” — [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents)

The older `/engineering/building-effective-agents` path redirected here on 11 November 2026. The article is dated 19 December 2024 and says the tooling landscape has changed since.

![Anthropic essay section Workflow Routing: one small diagram, a caption, and a when-to-use note](images/anthropic-routing.png)

**What is good.** Each workflow gets one diagram, one caption, and a short note on when to use it. Prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer share one drawing grammar. The prose also says when not to use the pattern.

**Fit.** One grammar for this case study: the same shapes, a caption, and a sentence of limitation. Draw it in the theme’s neutrals. The green boxes and the colored Out node are the kind of hue the lock removed, including the old Deloitte period. These drawings are public patterns, not a description of Peter’s project.

### Sam Rose — [samwho.dev/load-balancing](https://samwho.dev/load-balancing/)

The essay is dated 10 April 2023 and was updated 25 October 2026.

![Sam Rose load-balancing essay: a serif title, a plain explanation, and the start of a step-through visualization](images/samwho-balancing.png)

**What is good.** He starts from one load balancer and one server, names the rate and the cost, and only then asks the reader to press play. The homepage is a portrait. The brand shows up in the essays, where a picture and a paragraph take turns.

**Fit.** The case study can start from the simplest true picture of the agent, then add orchestration, retrieval, and the backend. The playable simulation and the color-per-concept words stay on his site. Color in v1 is for a real project screenshot. A still diagram plus a caption does the explaining. His serif title is not the face; the page is Geist, with the Chinese fallback when the toggle is on.

### Rajveer Singh — the reference — [rajveers.com](https://rajveers.com/)

The site the post links to. Two screens, because the post is three ideas at once.

![Rajveer Singh homepage: a painted lake above a serif headline, with an Ask control at the corner](images/rajveers-home.png)

![The AI me project page: a contents rail, a cover, metadata chips, and prose about sourced answers](images/rajveers-ai-me.png)

**What is good.**

- **Architecture writing.** Each job gets a “How it fits together” sentence, then a page. The project page has a contents rail, a metadata line, and prose that includes refusals. The [evals essay](https://rajveers.com/blog/evals-that-keep-an-agent-honest) describes questions against the real model, retrieval gated in CI, a versioned prompt, and a trace under each answer.
- **The ask box.** “The AI me” answers in his voice with sources. When the site is silent it says so and offers to pass the question on. It can also move the page, change the theme, and speak.
- **The lake.** The first screen is a WebGL scene. Full screen, a phone can be the rod. The [lake essay](https://rajveers.com/blog/a-lake-that-never-makes-the-page-wait) says the text paints first.

**Fit.**

| From the post | For petercheng.dev |
| --- | --- |
| Architecture on every project | The one case study. A sentence on the index, one diagram on the page, same grammar in English and Chinese. |
| An AI you can type to | In v1. Text only. It answers from approved site copy, in the language the visitor is reading, and says when that copy does not contain the answer. The provider seam is real. No live API key ships. |
| An AI that acts on the page, or talks | Voice stays out. The peel, the theme, and navigation stay human controls. The system setting chooses dark or light. |
| A lake you fish with a phone | Out. The first screen is the name and the positioning line. PeterOS is entered by the page peel. The Shanghai day clock and the résumé PDF sit with the page, not in front of it. |

His serif, emoji, and pill chrome are his. v1 is Geist, Lucide, and the PC core.

---

## 3. Measured notebook

A dated archive. It is the wrong first release while the posts are drafts, and it is the right place for them to wait.

### Maggie Appleton — [maggieappleton.com](https://maggieappleton.com/)

![Maggie Appleton homepage: a large serif sentence, a role line, and the start of a garden split into Essays and Notes](images/maggie.png)

**What is good.** One sentence, then a role line. The garden separates Essays, Notes, and Patterns, so a visitor can tell how finished an idea is. The page marks 2026.

**Fit.** The case study is the finished piece. Draft posts stay drafts, which is the same honesty as her split between essays and notes. v1 does not open a garden, and it does not use her serif or her illustrated mark. The Chinese toggle is a full second version of the pages, not a notes layer.

### Hamel Husain — [hamel.dev](https://hamel.dev/)

![Hamel Husain blog: a short bio, a teaching block, and a dated list of evals essays](images/hamel.png)

**What is good.** The homepage is a blog of dated claims about how to measure agents. A visitor can see what he argued, and when.

**Fit.** That standard is why the case study ships without an invented number, and why the assistant has to admit a gap. The course banner and the newsletter are not the first screen. Contact is email, LinkedIn, and GitHub.

### Eugene Yan — [eugeneyan.com](https://eugeneyan.com/)

![Eugene Yan homepage: a one-line introduction, four things he does, and a dated Latest list](images/eugene.png)

**What is good.** A one-line introduction, four destinations, and a dated list. Prototypes are labeled as explorations and point at a repository or a demo.

**Fit.** PeterOS can stay on the site as an instrument without being filed as a second project, the way his prototypes are filed apart from his job. The newsletter box is not the contact row. Unpublished posts stay off the index until they are no longer drafts.

---

## Recommendation

Ship the quiet index and the one diagram case study, in Geist, in both themes, following the system setting. The first screen is “Peter Cheng · 程钟泉”, the title, and “I build agentic systems that bring AI into real business processes.” The only public project is the anonymized agent case study. PeterOS (by the page peel), the Shanghai day clock, the résumé PDF, and the text assistant are part of that same v1; the assistant has no live key, quotes approved copy, and says when it does not know. Blog posts, Course Scheduler, ATS, the IMU collector, and Library VR stay off. The lake, voice, and a page-driving agent stay off. Motion uses the four families at the written timings.

---

## Open decisions for Peter

1. **Motion feel.** The four families and their timings are set. How they feel, including the page peel beside them and whether the PC mark moves on load, is judged on a preview.
2. **Case-study wording.** The slot is set: one anonymized agent system, covering orchestration, RAG, and backend, with no client name and no invented metric. The problem, the diagram’s labels, and what the page is allowed to say are not written yet. The assistant can quote only copy that has been approved, in English and in Chinese.
3. **Chinese wording.** The toggle and a full Chinese version of the pages are set. The Chinese of the positioning line, the title, the case study, and the assistant’s refusals is not.
