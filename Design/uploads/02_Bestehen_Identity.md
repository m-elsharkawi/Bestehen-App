**BESTEHEN**

Identity

Brand, product voice and exam-coach experience

| **BRAND**        | Bestehen                                            |
|------------------|-----------------------------------------------------|
| **SUB-PRODUCTS** | Bestehen / Corpus · Bestehen / App                  |
| **IDENTITY**     | Personal exam coach                                 |
| **CORE OUTCOME** | Build confidence through measurable exam readiness. |

| **Bestehen should feel like a calm, sharp coach who knows the exam, knows your weaknesses, and always knows the next highest-value move.** |
|--------------------------------------------------------------------------------------------------------------------------------------------|

This document defines how Bestehen should look, sound and behave. It is
intended to guide product design, copy, UX decisions, generated
feedback, dashboards and future branding work.

# 1. Brand Idea

Bestehen means “to pass” in German. The name deliberately focuses on
outcome rather than general language study. The brand promise is not
that the learner will become a perfect German speaker; it is that their
preparation will be focused, measurable and aligned with the B1 exam
they intend to pass.

| **Bestehen = the place where German learning is organized around the question: “What improves my chances of passing?”** |
|-------------------------------------------------------------------------------------------------------------------------|

## 1.1 Brand architecture

| **Name**          | **Role**                                     | **Audience**                                                           |
|-------------------|----------------------------------------------|------------------------------------------------------------------------|
| Bestehen          | Umbrella brand and shared identity.          | Everyone interacting with the project.                                 |
| Bestehen / Corpus | Exam intelligence and data-gathering system. | Primarily internal/developer/admin; potentially research-facing later. |
| Bestehen / App    | Learner-facing exam coach.                   | People preparing for a German certificate, initially TELC B1.          |

The slash naming convention should remain functional and understated.
“Corpus” and “App” are descriptors, not separate brands competing with
Bestehen. Consumer-facing experiences can usually lead with simply
“Bestehen” unless the distinction matters.

# 2. Positioning

## 2.1 Category

Bestehen should position itself as an exam coach, not as a generic
language-learning app, textbook replacement, flashcard system, AI tutor,
or mock-exam library. It may use capabilities from all of those
categories, but the organizing identity is coaching toward exam
readiness.

## 2.2 Core positioning statement

| **Bestehen is a personal German exam coach that learns where you lose points, trains the skills that matter most, and shows when you are ready to pass.** |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------|

## 2.3 What makes the positioning distinctive

- Outcome-first: the product is organized around passing, not course
  completion.

- Evidence-led: the learning priorities are informed by a large exam
  corpus rather than only a generic CEFR syllabus.

- Adaptive: the coach responds to the learner’s mistakes, evidence and
  target date.

- Exam-native from A1 onward: the learner grows through exam-shaped
  tasks instead of waiting until B1 to begin exam preparation.

- Readiness-centered: progress is expressed in exam-relevant terms
  rather than abstract XP.

# 3. Audience and Mindset

The primary learner has a concrete certification goal. They may care
about German in general, but they are willing to optimize their study
around the exam. They value efficiency, clarity and confidence more than
a broad “language journey.”

| **Learner thought**                           | **Bestehen response**                                                                      |
|-----------------------------------------------|--------------------------------------------------------------------------------------------|
| “I do not know what I should study today.”    | Here is the highest-value session based on your current readiness.                         |
| “I keep getting this type of question wrong.” | Here is the actual weakness behind those lost points, followed by a focused repair.        |
| “Am I getting closer to B1?”                  | Here is the evidence, the current readiness estimate and the areas still below safe range. |
| “I am A1; real B1 tasks are too hard.”        | Use the same exam-shaped thinking with assistance and progressively remove the help.       |
| “I have limited time.”                        | Prioritize the work with the highest expected impact on exam performance.                  |

# 4. Personality

The coach should feel competent, calm, practical and specific. It should
never feel childish, theatrical or falsely certain. The emotional tone
should make the learner feel oriented rather than entertained.

| **Trait**      | **What it means**                                                 | **What it is not**                                           |
|----------------|-------------------------------------------------------------------|--------------------------------------------------------------|
| Focused        | Always connects feedback to exam performance and the next action. | Obsessive, stressful or only interested in scores.           |
| Diagnostic     | Explains the reason behind mistakes and patterns.                 | Overly academic or filled with grammar jargon.               |
| Encouraging    | Recognizes meaningful progress and makes improvement visible.     | Empty praise, confetti for trivial actions, or cheerleading. |
| Direct         | States weaknesses clearly and prioritizes them.                   | Harsh, judgmental or discouraging.                           |
| Evidence-based | Distinguishes observed performance from uncertain estimates.      | Pretending an AI score is an official prediction.            |
| Efficient      | Respects the learner’s time and teaches narrowly.                 | Rushed, shallow or unwilling to explain when needed.         |

| **The desired feeling: “My coach understands exactly where I am, why I am losing points, and what I should do next.”** |
|------------------------------------------------------------------------------------------------------------------------|

# 5. Voice and Tone

## 5.1 Voice principles

- Use simple, precise language. Prefer short explanations with one clear
  reason and one clear next action.

- Speak like a coach beside the learner, not an examiner above them.

- Use exam vocabulary naturally: readiness, pass range, section, task,
  points, evidence, weakness, retry, mock exam.

- Keep advanced grammatical terminology optional. Explain the practical
  pattern first.

- Be transparent when an evaluation is approximate or evidence is
  limited.

- Celebrate improvement in terms of capability: “You are now handling
  appointment vocabulary reliably,” not merely “Great job!”

## 5.2 Tone by situation

| **Situation**       | **Tone**                | **Example**                                                                                                                 |
|---------------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Daily start         | Confident and orienting | “Your biggest opportunity today is Speaking. We’ll spend 12 minutes there, then review two recurring mistakes.”             |
| Wrong answer        | Diagnostic, neutral     | “You understood the topic, but missed the restriction ‘nur werktags’. This is a scanning error, not a vocabulary gap.”      |
| Weak performance    | Clear but constructive  | “Speaking is still below the current pass range. Interaction is the main blocker, so it stays your top priority this week.” |
| Improvement         | Specific and earned     | “Listening: dates and times moved from inconsistent to reliable across the last four attempts.”                             |
| Uncertain readiness | Transparent             | “Current estimate: 58%. Confidence is still low because we have little timed speaking evidence.”                            |
| Mock exam pass      | Measured confidence     | “You cleared the pass range in this mock. Repeat it under similar conditions before treating this as stable readiness.”     |

## 5.3 Language to avoid

- Overpromising: “You will definitely pass.”

- Generic positivity: “Amazing! You’re crushing it!” when there is no
  meaningful evidence.

- Childlike game language as the main interaction model: “Collect 20
  gems to unlock grammar.”

- Shame or pressure: “You should know this by now.”

- Unnecessary academic complexity: long explanations of terminology when
  the learner only needs the usable pattern.

- Artificial certainty from AI-generated scoring.

# 6. Product Language System

Words used repeatedly in the interface shape the product identity.
Bestehen should favor coaching and exam-performance language over course
and game language.

| **Prefer**                      | **Avoid as the primary concept** | **Reason**                                                                   |
|---------------------------------|----------------------------------|------------------------------------------------------------------------------|
| Readiness                       | XP / level points                | Readiness maps directly to the goal.                                         |
| Today’s plan / Today’s training | Lesson                           | The coach chooses a useful session rather than advancing a textbook chapter. |
| Weakness / opportunity          | Failed skill                     | Keeps the diagnosis practical without labeling the learner.                  |
| Repair                          | Remedial lesson                  | Signals a narrow intervention that fixes a blocker.                          |
| Retry                           | Repeat                           | Emphasizes transfer to a fresh task.                                         |
| Evidence                        | AI score                         | Signals that the estimate is grounded in observed performance.               |
| Pass range                      | Win / complete                   | Matches the actual target outcome.                                           |
| Mock exam                       | Boss level / challenge           | Keep exam simulations serious and recognizable.                              |

# 7. Readiness Identity

Readiness is not only a metric; it is the visual and conceptual center
of Bestehen. The dashboard should continuously translate the learner’s
activity into an answer to “How close am I to passing?”

- Make the pass threshold visually explicit without implying certainty.

- Show separate dimensions when one can block the overall result,
  especially written vs. oral performance.

- Show movement over time, but avoid rewarding tiny noisy changes as if
  they were meaningful gains.

- Surface the top causes of the current score immediately beside the
  number.

- Distinguish assisted evidence from realistic timed evidence.

- When evidence is weak, show uncertainty rather than filling the gap
  with confidence theater.

| **Readiness should feel like a coach’s assessment, not a game progress bar.** |
|-------------------------------------------------------------------------------|

# 8. Visual Direction

The visual identity should reinforce calm competence and measurable
progress. Bestehen should feel closer to a modern coaching/productivity
tool than a colorful children’s language game, while still being
welcoming enough for daily use.

| **Element**        | **Recommended direction**                                                                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Primary palette    | Deep ink/navy for authority and focus; a clear green for progress and “safe range”; warm off-white backgrounds for comfort.                                 |
| Status colors      | Green for safely on track, amber for attention/uncertainty, restrained red for pass-critical risk. Avoid turning the screen into a traffic-light dashboard. |
| Typography         | Modern sans-serif with strong legibility. Clear hierarchy, generous spacing, and little decorative typography.                                              |
| Shapes             | Simple cards, subtle rounding, thin dividers and restrained elevation. Avoid cartoon bubbles or heavily playful components.                                 |
| Data visualization | Readable bars, trends and evidence markers. Charts should explain readiness rather than decorate the dashboard.                                             |
| Motion             | Use sparingly to show state change or progress. Avoid celebration animations for routine interactions.                                                      |
| Imagery            | Minimal. Prefer functional illustrations, exam artifacts or abstract progress/structure motifs over mascots.                                                |

## 8.1 Working palette

| **Token**      | **Hex**  | **Role**                                                   |
|----------------|----------|------------------------------------------------------------|
| Deep Ink       | \#14213D | Primary text, navigation, strong surfaces.                 |
| Bestehen Green | \#2A9D6F | Progress, selected state, brand accent.                    |
| Deep Green     | \#1D6F50 | Accessible accent text and strong positive states.         |
| Warm Paper     | \#F7F4EE | Primary light background / calm study surface.             |
| Mist           | \#EDF0F4 | Secondary panels and structural separation.                |
| Risk Red       | \#B64B4B | Use only for genuinely important risk or incorrect states. |

This palette is a recommended starting direction, not a locked design
system. The important identity principle is the balance: serious enough
to feel credible, warm enough to invite daily use, and restrained enough
that readiness data remains the focus.

# 9. Coach Behavior

The coach identity must affect system behavior, not just copy. A
coaching product takes responsibility for prioritization. The learner
should not have to browse a large catalog every day and guess what
matters.

| **Coach behavior**     | **Product implication**                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------------------------|
| Prioritizes            | Default home action is a recommended plan, not a content library.                                            |
| Explains decisions     | The learner can see why today’s activity was selected.                                                       |
| Keeps memory           | Recurring mistakes influence future plans automatically.                                                     |
| Adapts pressure        | Assistance decreases as readiness grows and as the exam approaches.                                          |
| Knows the target       | TELC-specific weighting and task behavior matter more near the final stages.                                 |
| Challenges selectively | The system should sometimes target uncomfortable weak areas instead of optimizing only for engagement.       |
| Reassesses             | Mock results and new evidence can move priorities materially, even if that interrupts a comfortable routine. |

# 10. Gamification Boundary

Bestehen can still use motivational mechanics, but they should support
the exam-coach identity rather than replace it. A streak may encourage
consistency; it should not become more important than the learner’s
readiness. Small milestones can be useful, but they should correspond to
meaningful capability.

- Good: “7 days of preparation completed” as a secondary consistency
  signal.

- Good: milestone when Speaking crosses and sustains the estimated pass
  range.

- Good: showing a weakness moving from “unstable” to “reliable.”

- Avoid: currencies, loot, lives, cartoon rewards or artificial level
  gates as the main motivation loop.

# 11. Tagline and Messaging Territory

## 11.1 Recommended primary line

| **Train for the exam. Know when you’re ready.** |
|-------------------------------------------------|

## 11.2 Supporting lines

- Your personal German exam coach.

- Learn what the exam actually rewards.

- Turn mistakes into points.

- From A1 to exam-ready, one weakness at a time.

- Stop guessing what to study next.

## 11.3 Internal product sentence

| **Bestehen is an adaptive exam coach that teaches German through exam preparation and continuously tells the learner how close they are to passing.** |
|-------------------------------------------------------------------------------------------------------------------------------------------------------|

# 12. Example Product Copy

| **Moment**          | **Example**                                                                                                                         |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Home                | “B1 Readiness: 43%. Speaking is currently the biggest blocker. Today’s 24-minute plan focuses there first.”                         |
| After reading task  | “6/10. Two misses came from synonym recognition; one came from overlooking a time restriction. We’ll repair both before the retry.” |
| Repair prompt       | “You are losing points when the same idea is expressed with different words. Let’s train that pattern for four minutes.”            |
| Speaking feedback   | “You completed the task, but interaction dropped when you disagreed. Practice two ways to respond and propose an alternative.”      |
| Readiness change    | “Written readiness is stable at 64%. Oral readiness rose to 55%, but we still need more timed evidence.”                            |
| Exam recommendation | “Your recent evidence is consistently above the estimated pass range. It is reasonable to start planning a real exam date.”         |

# 13. Identity Guardrails

- Bestehen is an exam coach first. New features should strengthen
  diagnosis, prioritization, practice, feedback or readiness.

- Do not drift into a generic “learn German” catalog unless the content
  clearly supports the exam journey.

- Do not hide difficult feedback behind cheerful UI. The coach can be
  kind and still say that a section is not ready.

- Do not make the learner interpret raw analytics. Translate evidence
  into a practical next action.

- Do not let the Corpus brand overwhelm the learner experience. Corpus
  is the intelligence behind the coach, not something every learner
  needs to understand.

- Do not use TELC branding in a way that implies official affiliation.
  TELC is the target exam; Bestehen remains its own product identity.

- Do not treat readiness as a promise. It is a model whose confidence
  should grow with realistic evidence.

# 14. Identity in One Page

| **Question**                           | **Answer**                                                                           |
|----------------------------------------|--------------------------------------------------------------------------------------|
| What is Bestehen?                      | A personal German exam coach.                                                        |
| What does it optimize for?             | Readiness to pass the target B1 exam.                                                |
| How does it teach?                     | Through exam-shaped practice, diagnosis, targeted repair, retry and adaptive memory. |
| How should it feel?                    | Calm, competent, direct, evidence-based and practical.                               |
| What is the primary progress language? | Readiness, pass range, strengths, blockers and evidence.                             |
| What should it not feel like?          | A generic course, an arcade game, a textbook, or an overconfident AI tutor.          |
| What does Corpus contribute?           | The evidence base that helps the coach understand what exams repeatedly test.        |
| What is the promise?                   | Train for the exam. Know when you’re ready.                                          |
