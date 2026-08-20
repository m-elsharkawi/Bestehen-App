**BESTEHEN**

Product Overview

Bestehen / Corpus + Bestehen / App

| **STATUS**       | Foundational product concept                                                               |
|------------------|--------------------------------------------------------------------------------------------|
| **UMBRELLA**     | Bestehen                                                                                   |
| **PROJECTS**     | Bestehen / Corpus · Bestehen / App                                                         |
| **PRIMARY GOAL** | Help an A1 German learner become ready to pass the TELC B1 exam through exam-led learning. |

| **Bestehen teaches German backwards from the exam: attempt, diagnose, repair, retry, remember.** |
|--------------------------------------------------------------------------------------------------|

This document captures the shared product idea before detailed
architecture or implementation planning. It defines what Bestehen is,
why it exists, how Corpus and App fit together, and the core learning
philosophy that future decisions should preserve.

# 1. Executive Summary

Bestehen is a personal German exam-preparation system designed around
one explicit outcome: passing the TELC B1 exam. It is not intended to
reproduce a traditional language course or optimize for broad language
mastery first. Instead, it teaches the German knowledge, exam strategy,
and practical skills that most directly improve exam performance.

The concept is split into two connected projects. Bestehen / Corpus
builds the evidence base by gathering and structuring a large body of A2
and B1 German exam material from official and unofficial sources.
Bestehen / App uses that evidence to act as an adaptive exam coach: it
evaluates the learner, chooses what to practice, diagnoses mistakes,
delivers targeted repair, and estimates exam readiness over time.

| **Product thesis: learn German through exam preparation, not learn German first and prepare for the exam later.** |
|-------------------------------------------------------------------------------------------------------------------|

# 2. The Problem

A learner starting around A1 but targeting a B1 certificate faces two
overlapping problems: they must improve their German substantially, and
they must learn how the target exam behaves. Traditional courses usually
prioritize general language progression; dedicated exam-prep products
usually assume the learner is already close to B1. Bestehen is intended
to bridge that gap.

- Traditional A1 → A2 → B1 curricula can spend significant time on
  material that is not equally valuable for the target exam.

- Exam-prep products often become useful only after the learner already
  has sufficient German to understand B1-level tasks.

- Generic learning metrics such as XP, streaks, units completed, or
  vocabulary count do not answer the question the learner actually cares
  about: “Am I ready to pass?”

- Mistakes are often treated as isolated wrong answers instead of
  evidence that should shape future practice.

- Public exam material exists across many providers and unofficial
  collections, but it is fragmented and rarely converted into a
  structured source of learning intelligence.

# 3. The Product Idea

Bestehen approaches the target exam as the organizing structure for
learning. The learner repeatedly encounters exam-shaped tasks at an
appropriate difficulty, receives help when needed, and gradually loses
that assistance as competence grows. Grammar, vocabulary, listening,
writing, and speaking are introduced because they solve real exam
problems rather than because they happen to be the next chapter in a
textbook.

## 3.1 Core learning loop

| **Stage** | **What happens**                                                                                                                 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------|
| Observe   | Bestehen uses the exam corpus to understand recurring task patterns, topics, vocabulary, grammar, difficulty and exam strategy.  |
| Attempt   | The learner completes an exam-shaped activity appropriate to the current level and target skill.                                 |
| Diagnose  | The system determines why points were lost: vocabulary, grammar, comprehension, production, strategy, or repeated error pattern. |
| Repair    | A short targeted explanation or micro-practice addresses only the weakness that blocked performance.                             |
| Retry     | A fresh but equivalent task tests the same skill without simply repeating the original answer.                                   |
| Remember  | The learner model records the result and reintroduces the weakness later through adaptive review.                                |

| **Never teach something simply because it belongs to B1 German. Teach it because it helps the learner earn B1 exam points.** |
|------------------------------------------------------------------------------------------------------------------------------|

## 3.2 Progression from A1 to B1

The exam shape remains visible from the beginning, while the level of
assistance changes. An A1 learner should not be thrown directly into
unassisted B1 material. Instead, Bestehen progressively removes training
wheels.

| **Mode**               | **Typical experience**                                                                                                 | **Purpose**                                                             |
|------------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| Assisted exam training | Simpler A1/A2 language, translations, vocabulary previews, hints, slower or replayable audio, guided writing/speaking. | Learn through the shape of exam tasks without being overwhelmed.        |
| Guided exam training   | A2 to early-B1 language, fewer hints, limited assistance, more realistic task length and time pressure.                | Bridge language acquisition and exam performance.                       |
| Exam mode              | Authentic B1 difficulty, exam-like constraints, timed tasks, no learning assistance during the attempt.                | Measure readiness and build reliable performance under exam conditions. |

# 4. Bestehen / Corpus

Bestehen / Corpus is a separate data project whose purpose is to build
the largest reasonably trustworthy A2/B1 German exam corpus available to
the system. It is not limited to TELC, because a broad corpus provides
far more evidence about how German is tested at these levels. TELC
remains the target signal and should receive the strongest weighting
where format-specific conclusions are drawn.

## 4.1 Source philosophy

- Include official practice and model exams from established examination
  providers.

- Include reputable educational and exam-preparation material.

- Include unofficial exams, PDFs, forums, shared documents, teacher
  resources, archives and other collections when the material appears
  credible enough to provide useful evidence.

- Do not assume that public accessibility grants redistribution rights.
  Authenticity and usage rights are separate attributes.

- Track provenance, confidence, duplication and rights metadata for
  every source.

## 4.2 Two independent source scores

| **Dimension**             | **Question it answers**                                                                 | **Example**                                                                        |
|---------------------------|-----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| Authenticity / confidence | How likely is this material to represent genuine or realistic A2/B1 exam practice?      | A structurally accurate unofficial B1 mock may score high despite weak provenance. |
| Usage rights              | Can the exact original text, audio, image or question be redistributed inside Bestehen? | A free PDF may still be reference-only if reuse rights are unclear.                |

## 4.3 Corpus responsibilities

- Discover and ingest documents, web pages, audio and other exam assets.

- Extract exam structure, sections, tasks, questions, choices, answer
  keys and relevant media relationships.

- Deduplicate mirrors and near-identical exams so repeated uploads do
  not distort frequency analysis.

- Classify level, provider style, task type, topic, tested skill,
  vocabulary, grammar, difficulty and distractor pattern.

- Score source confidence and TELC relevance.

- Expose structured evidence that the learning engine can use to
  prioritize what matters.

## 4.4 Corpus vs. exercise bank

The corpus is evidence; the exercise bank is what the learner practices.
They should not be treated as the same thing. Real or reference exam
items teach Bestehen what gets tested. The App should primarily serve
original exercises that reproduce the same skill, reasoning pattern and
difficulty without depending on verbatim redistribution of source
material.

| **Real exams define what we teach. Original exercises provide how we practice it.** |
|-------------------------------------------------------------------------------------|

# 5. Bestehen / App

Bestehen / App is the learner-facing exam coach. Its job is to convert
the Corpus, the learner’s history and the target exam into the best next
training decision. The App should feel complete as a product: reading,
language elements, listening, writing, speaking, review, mock exams and
readiness all belong to the target experience.

## 5.1 Core capabilities

| **Capability**       | **Role in the product**                                                                                         |
|----------------------|-----------------------------------------------------------------------------------------------------------------|
| Diagnostic           | Establish the learner’s starting state without forcing an A1 learner through a full B1 exam.                    |
| Daily coaching plan  | Choose the highest-value activities for the available time based on weakness, exam importance and review needs. |
| Exam-shaped practice | Train all relevant exam skills from assisted A1/A2 activities through realistic B1 tasks.                       |
| Mistake memory       | Turn individual wrong answers and weak responses into persistent learner-model signals.                         |
| Targeted repair      | Teach the smallest useful concept needed to fix a performance problem.                                          |
| Adaptive review      | Revisit recurring weaknesses using spaced and evidence-driven practice.                                         |
| Writing evaluation   | Judge task fulfillment and B1 exam usefulness rather than rewriting everything into advanced German.            |
| Speaking coach       | Simulate exam interaction, evaluate communication and give practical B1-level repair.                           |
| Mock exams           | Measure performance under increasingly realistic constraints.                                                   |
| Readiness model      | Estimate how close the learner is to the safe pass range and explain what is holding them back.                 |

## 5.2 The daily experience

A typical session should feel like a coach-led mission rather than a
lesson sequence. A possible 20–30 minute session may contain:

1.  A short review of recurring mistakes or due memory items.

2.  A focused exam-style challenge selected for the learner’s current
    priorities.

3.  A diagnosis explaining where points were lost and why.

4.  A brief repair activity for the blocking vocabulary, grammar,
    comprehension or strategy issue.

5.  A fresh retry that checks whether the repair transferred.

6.  An updated readiness view and a concise coaching takeaway.

# 6. Learner Model and Knowledge Model

Bestehen should not rely on a fixed textbook curriculum. Internally, it
should maintain a structured model of the knowledge and behaviors that
influence B1 exam performance. Corpus items, generated exercises and
learner mistakes all connect to that model.

| **Area**         | **Examples of tracked nodes**                                                                                    |
|------------------|------------------------------------------------------------------------------------------------------------------|
| Vocabulary       | Housing, appointments, travel, work, services, health, scheduling, common exam verbs and synonym groups.         |
| Grammar          | Word order, subordinate clauses, connectors, modal verbs, cases, prepositions, tense usage, relative structures. |
| Reading skills   | Scanning, inference, synonym recognition, matching, detail extraction, distractor rejection.                     |
| Listening skills | Numbers, dates, announcements, gist, detail, speaker intention, noise/speed tolerance.                           |
| Writing          | Task coverage, register, structure, clarity, connectors, grammatical control, useful exam phrases.               |
| Speaking         | Interaction, task completion, fluency, repair, turn-taking, planning language, comprehensibility.                |
| Exam strategy    | Time management, elimination, recognizing distractors, handling unknown words, using preparation time.           |

# 7. Readiness as the Primary Metric

Readiness is the central product metric and must be more than an
attractive percentage. It should be derived from observed performance
across exam-relevant skills, recent evidence, difficulty, assistance
used, time constraints and mock-exam results. It should become more
reliable as the learner generates more evidence.

- Show written and oral readiness separately where useful; a strong area
  should not hide a pass-critical weak area.

- Show confidence or evidence quality when the estimate is still
  uncertain.

- Explain the largest factors holding the score down and the best
  opportunities to improve it.

- Use realistic “pass range” language rather than promising an exam
  result.

- As the exam approaches, weight realistic, timed and unassisted
  evidence more heavily than assisted practice.

| **The App should answer three questions every day: Where am I? What is holding me back? What should I do next?** |
|------------------------------------------------------------------------------------------------------------------|

# 8. Complete Product, Phased Implementation

Bestehen should be designed as one complete product rather than five
incomplete product versions. Implementation may still be phased to
reduce engineering risk, but the architecture, data model and product
decisions should anticipate the full experience from the start.

| **Principle**                   | **Meaning**                                                                                                                      |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Complete target experience      | Reading, listening, language elements, writing, speaking, review, mock exams and readiness are all part of the intended product. |
| Incremental engineering         | Individual capabilities can be built and validated in controlled phases before the next capability is connected.                 |
| Shared foundations first        | The learner model, skill taxonomy, exercise model, evidence model and corpus interfaces should avoid section-specific dead ends. |
| Later phases deepen, not rescue | Later work should improve accuracy, content scale, adaptivity and polish rather than finally making the product concept whole.   |

# 9. Product Principles

- Exam readiness is the objective function. Features should justify
  themselves through their contribution to passing.

- Teach from evidence. The corpus should influence priorities rather
  than relying only on a hand-authored curriculum.

- Diagnose before teaching. A wrong answer is a signal to understand,
  not merely something to mark red.

- Repair narrowly. Prefer a five-minute intervention that fixes the
  specific blocker over a generic forty-minute lesson.

- Practice transfer, not memorization. Retries should be fresh tasks
  that require the same underlying skill.

- Adapt assistance, not the goal. The learner may start at A1, but the
  system always points toward B1 exam performance.

- Be honest about uncertainty. Readiness is an evidence-based estimate,
  not a guarantee.

- Avoid artificial gamification as the primary motivation. The
  meaningful reward is visible movement toward the pass range.

# 10. Current Product Definition

| **Bestehen is an adaptive German exam coach that teaches German through exam preparation and continuously tells the learner how close they are to passing TELC B1.** |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|

Bestehen / Corpus builds the evidence. Bestehen / App turns that
evidence into coaching. Together they form one system whose goal is not
to complete a conventional German curriculum, but to make the learner
measurably ready for the target exam.
