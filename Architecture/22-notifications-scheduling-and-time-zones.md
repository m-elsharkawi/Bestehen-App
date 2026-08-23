# Bestehen / App — Notifications, Scheduling, and Time Zones

> **Stage:** 22 of 28  
> **Status:** Architecture decision record and implementation handoff  
> **Decision owner:** Scheduling & Notifications  
> **Baseline:** Bestehen-App `main` at `07adb6494d064e33b6f18b26fe2fba1717534ea8`; Bestehen-Shaping `main` at `9f37ad78fdd101b3c9cb8782ddc54d12dbce1fdc`  
> **Scope:** Conceptual domain, calendar, job, transport, privacy, accessibility, cost, and validation contracts; no production code, schema, provider configuration, or product/design edit

## 1. Purpose and scope

This stage fixes the smallest sufficient architecture for dates, preparation schedules, time zones, quiet hours, reminder selection, caps, delivery, suppression, permission, and deletion. Notifications protect a concrete preparation action or planning decision; they never exist merely to create engagement. Push is optional convenience. The complete plan, urgency state, due obligations, milestones, logistics, and controls remain available in-app even when notification permission is absent, denied, revoked, unsupported, offline, late, or failed.

The launch baseline is deterministic scheduling inside the accepted modular Next.js/Node/PostgreSQL/pg-boss deployment, plus a reviewed in-app notification centre and optional standards-based Web Push sent directly to the browser-selected push service with Web Push encryption and VAPID. There is no notification SaaS, new database, realtime platform, routine email-reminder channel, native app, engagement model, or AI-written copy. The existing narrow service worker gains only an isolated push-display/click handler; installability remains optional and loaded-work continuity does not depend on push.

This document owns scheduling and notification meaning. It does not change evidence, capability, Readiness, mocks, coaching precedence, content eligibility, timers, account identity, or data-rights truth. Date never changes Readiness. A missed day, late message, provider failure, browser restriction, accessibility failure, or network fault never becomes learner failure and creates no debt.

## 2. Inputs, authority, and continuity

### 2.1 Immutable source snapshot

All required sources were read from GitHub at immutable refs before deciding.

| Repository / path | Blob SHA | Use |
|---|---|---|
| Bestehen-App `prompts/architecture/22_define_notifications_scheduling_and_time_zones.txt` | `c6608e4ed2c1eb11c753c55ed053dbfd1af78545` | Binding Stage-22 contract |
| Bestehen-Shaping `app/28-bestehen-app-product-specification.md` | `18ae80cc2fd63cecd76c297c3e56d44a68367856` | Highest product authority; date/reminder contract |
| Bestehen-Shaping `app/02-complete-learner-journey.md` | `3c536176154a8239aeafc0697acd947280130142` | Goal, booked, exam and return states |
| Bestehen-Shaping `app/06-daily-coaching-engine.md` | `3cd869cd337dd3a878c27f35e1e8b5dad0c4c7bb` | Daily action precedence and rescheduling |
| Bestehen-Shaping `app/14-review-and-spaced-repetition.md` | `fa9b65e92cd1511e00e106a199eb6fbc06273a69` | Due-obligation grouping and no backlog |
| Bestehen-Shaping `app/17-ready-to-book-logic.md` | `9e3e8b24faefe885d5b10409725619d0d0d84e6d` | Booking gates remain separate from dates |
| Bestehen-Shaping `app/22-user-controls-vs-coach-autonomy.md` | `27f33cd56a09df27952e15bb3dfd0e077b89633c` | Learner schedule/notification control |
| Bestehen-Shaping `app/23-exam-date-and-urgency.md` | `5942ed811bcbaa5baaf1dd55079b8971d34b1d01` | Normative date modes, milestones, caps, tone |
| Bestehen-Shaping `app/26-platform-accessibility-nonfunctional.md` | `8137091683941b0d55f3d4fb90af3c402b8371e5` | Optional permission, accessibility, resilience |
| Bestehen-App `Design/DESIGN-HANDOFF.md` | `417a6820037e045e2dd9f29afc42b9f2e94fd638` | Learner control, prohibitions, design issue |
| Bestehen-App `Design/Bestehen-02-Mobile-Screens.dc.html` | `0a9f2d3ea982c3197f399941b57defd9869d2428` | Goal/date surface and planning-only copy |
| Bestehen-App `Design/Bestehen-04-Flows-Handoff.dc.html` | `7120b05a2272c31e5896e4313a7007935f5d0aed` | Flow examples and notification open-decision note |
| Bestehen-App `Architecture/00-architecture-shaping-plan.md` | `b263c5e7b3bccc0450ddd17aa0cc007432d672b7` | Stage routing and later owners |
| Bestehen-App `Bestehen_App_Architecture_Checklist.md` | `f70db29124f1198f683c905c13e50b133a81229e` | 24 Stage-22 checks initially open |
| Bestehen-App `Architecture/05-data-ownership-persistence-and-schema-evolution.md` | `bb6df811ec9010de556d1719f22e31bb8ca3190e` | Persistence, IANA zone facts, retention |
| Bestehen-App `Architecture/08-coaching-engine-and-session-state-machines.md` | `02c5e1ee5967bad976eda49ab4813a768eda5bd3` | Deterministic priorities and session planning |
| Bestehen-App `Architecture/12-api-contracts-jobs-events-and-idempotency.md` | `c640da01d6eb6d71a5e2ea7a0dcf19147d6d7528` | Versioned commands, pg-boss, receipts |
| Bestehen-App `Architecture/13-frontend-application-and-design-system-architecture.md` | `7da94f122fa86412b0d1a12b84c123645693efb4` | Server/browser state and shared UI |
| Bestehen-App `Architecture/14-responsive-accessibility-browser-and-device-architecture.md` | `362068924a6942eb955dcc132fb4c94da122597b` | Contextual permission and browser support |
| Bestehen-App `Architecture/20-account-local-first-profile-sync-export-and-deletion.md` | `9a1aa2d5fea31ff0bdccfc4561806bb870511ab6` | Account optional, sync merge, export/delete |
| Bestehen-App `Architecture/21-offline-checkpointing-recovery-conflicts-and-timing-integrity.md` | `1216f98f5489119b4d8114804ac87936bc78ddd4` | Local continuity, service worker, clocks |
| Bestehen-App `Architecture/adr/README.md` | `53cd7fc6e235fee02a542c739b5e167afbbdabb5` | ADR convention and next number |

Required Stages 05, 08, 12, 13, 14, 20, and 21 are present, accepted, and compatible. Stage 22 refines their declared scheduling boundary without reopening PostgreSQL/pg-boss, server authority, local outbox, tombstone dominance, capability permission, or timer integrity.

### 2.2 Authority and conflict reconciliation

Stage-27 precedence is binding: **validity/fairness → direct evidence → independent Written/Oral risk → uncertainty resolution → due repair/retention → progression/coverage → preference**. The date, urgency, schedule, notification permission, transport, click, and learner override can change priority or delivery only. They cannot change evidence truth.

`Design/DESIGN-HANDOFF.md §7 item 4` and `Design/Bestehen-04-Flows-Handoff.dc.html` call notification tone/frequency open because only two examples were drawn. Higher-authority `app/23-exam-date-and-urgency.md §§5.1–5.11`, retained by final specification §13.3, subsequently settles types, controls, caps, quiet hours, ignored-reminder suppression, and the copy contract. Stage 22 implements those settled semantics with reviewed templates; it does not treat the older design note as an owner blocker and does not edit Design.

`Design/Bestehen-02-Mobile-Screens.dc.html` shows one exact date control. Product authority requires No date, Target month, Exact planned date, Booked exact date, and Post-exam. The implementation must extend the same semantic surface without copying the illustrative single-field example as the whole domain.

### 2.3 Current official technical evidence

Mutable facts were rechecked on **2026-08-23**:

- W3C Push API is a current Working Draft and defines browser-selected push services, service-worker delivery, subscription refresh/deactivation, encrypted payloads, and push-service visibility of timing/frequency/size metadata: https://www.w3.org/TR/push-api/
- RFC 8030 is the Standards Track Web Push protocol; acceptance by a push service is not proof that the learner saw a notification. RFC 8291 defines payload encryption and RFC 8292 VAPID application-server identification: https://www.rfc-editor.org/rfc/rfc8030.html, https://www.rfc-editor.org/rfc/rfc8291.html, https://www.rfc-editor.org/rfc/rfc8292.html
- The Notifications Standard defines system notification behaviour: https://notifications.spec.whatwg.org/
- Apple documents standards Web Push for macOS Safari 16+ and iOS/iPadOS 16.4+ **Home Screen web apps**; this platform condition must be stated, never hidden: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- Current browser guidance requires explicit learner action before permission, secure context, and no repeated unsolicited prompt: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
- IANA tzdb is mutable civil-time data; current published release is `2026c` and rules can change after political decisions: https://www.iana.org/time-zones
- PostgreSQL 18 uses IANA zone names and stores time-zone-aware instants internally in UTC: https://www.postgresql.org/docs/current/datatype-datetime.html
- ECMAScript Temporal is a Stage-4 draft with explicit wall-clock/exact-time separation and DST disambiguation semantics: https://tc39.es/proposal-temporal/, https://tc39.es/proposal-temporal/docs/timezone.html
- Firebase Cloud Messaging is currently a no-cost product, but would add a Google control plane: https://firebase.google.com/pricing
- OneSignal currently lists Free at USD 0/month, Growth from USD 19/month plus USD 0.004 per Web Push subscriber; pricing and plan limits are mutable: https://onesignal.com/pricing
- The already-selected SES Frankfurt Essentials list price recorded by Stage 20 is USD 0.16 per 1,000 recipients for the first 10 million. Routine reminder email is not selected: https://aws.amazon.com/ses/pricing/

These facts inform a replaceable transport decision. Browser support, provider terms, pricing, and tzdb releases are rechecked before release and at every supported-browser/provider review.

## 3. Architecture decisions

| ID | Decision and default | Alternatives and rejection | Consequence, fallback, review trigger | ADR |
|---|---|---|---|---|
| `ARCH-S22-D01` | One Scheduling & Notifications module owns date/schedule/notification preferences, occurrences, caps, templates, endpoints, delivery intents and status. Planning owns the recommended action; Measurement owns Readiness; Evidence owns validity. | Screen-local alarms diverge and cannot dedupe devices. Coaching-owned delivery mixes truth and transport. A separate notification microservice adds operations without isolation need. | One deterministic owner in the modular monolith. Rebuild projections from facts. Split only after measured isolation/throughput or independent security ownership. | ADR-0030 |
| `ARCH-S22-D02` | Preserve the exact date lifecycle: `no_date`, `target_month`, `exact_planned`, `booked_exact`, `exam_completed`, `outcome_pending`, `passed`, `not_passed_or_partial`. Target month stays a range. Date and Readiness are orthogonal. | Inventing a mid-month day creates false precision. One nullable datetime loses booking/completion meaning. Date-adjusted Readiness is false. | Date changes enqueue planning/schedule recomputation only. Evidence/Readiness facts do not change. Passed date alone never proves attendance. | ADR-0030 |
| `ARCH-S22-D03` | A schedule is a versioned local-calendar preference in one confirmed IANA planning zone. Store local rule and zone plus each resolved UTC instant, offset, tzdb release and resolution policy. | UTC-only recurrence drifts after DST. Fixed offset cannot follow rule changes. Client-only alarms cannot dedupe or work across account devices. | Future unsent occurrences are re-resolved on zone/rule/tzdb change; history remains pinned. In-app plan remains when scheduling is unavailable. | ADR-0030 |
| `ARCH-S22-D04` | Travel never silently changes the scheduling zone. A device-zone mismatch offers Keep / Switch. Until resolved, suppress any proactive push whose instant is quiet in either known zone; in-app planning continues. Booked exam venue zone/time is independent and never silently follows travel. | Silent follow-device can create overnight/duplicate sends. Never adapting makes travel unusable. Per-device global zones create contradictory multi-device plans. | Learner chooses. If no choice, pressure decreases, not increases. Review only with usability evidence; no fingerprint or location history. | ADR-0030 |
| `ARCH-S22-D05` | Generate bounded future occurrences from reviewed reasons, group obligations, apply Stage-27 ordering, caps, quiet hours, ignored suppression and channel preference, then enqueue UTC send jobs. Every job revalidates current generation at execution; stale jobs cancel. | Infinite cron per learner cannot encode DST/caps/content changes. Per-obligation jobs cause storms. A marketing journey engine owns engagement rather than product truth. | PostgreSQL fact + pg-boss job commit atomically; a rolling horizon is operational tuning in `notification-schedule-policy/v1`. Foreground recompute is fallback. | ADR-0030 |
| `ARCH-S22-D06` | A logical intent is unique by learner, reason group, semantic occurrence and policy generation. Caps count logical intents, not endpoints. Account learners have at most one explicitly selected primary push endpoint; all devices still receive the in-app equivalent. | Broadcasting to every endpoint duplicates pressure. Timestamp dedupe fails after timezone change. Provider “exactly once” is not credible. | Unique constraints and browser tag/collapse replace duplicate attempts; permanent primary failure leaves in-app truth, never fans out silently. | ADR-0030 |
| `ARCH-S22-D07` | Reviewed, versioned templates render action + reason + commitment from allow-listed structured facts. No AI/model writes or selects engagement copy. Lock-screen default is minimized and contains no weakness, score, Readiness, exact exam date, access need, response, transcript, or raw audio. | Model-generated copy drifts into nagging and costs per send. Free text leaks sensitive state. Generic engagement copy has no preparation purpose. | Full detail is available after authenticated/open App view. Template rollback is pointer change; unknown major suppresses push and keeps in-app safe fallback. | ADR-0030 |
| `ARCH-S22-D08` | Launch transport is in-app plus opt-in direct standards Web Push using RFC 8030/8291/8292 and browser-selected services. No FCM/OneSignal/email/SMS reminder dependency. | In-app only is cheapest but misses useful background reminders. FCM/OneSignal add identifiers, terms, SDK/control plane and managed engagement features not needed. Email requires account/contact and exposes mailbox metadata/content. | Existing app/DB/worker pays only ordinary compute/bandwidth. Turn push off without losing behaviour. Add a provider only after measured direct-delivery/ops failure and privacy/cost review. | ADR-0030 |
| `ARCH-S22-D09` | Permission is contextual after an explicit “Enable reminders on this browser” action. Denied/unsupported/revoked is terminal until learner action/settings change; no onboarding prompt or repeated coercion. iOS Home Screen prerequisite is explained. | Prompt on arrival harms trust and often gets blocked. Require PWA excludes learners. Treat permission as account/core gate violates architecture. | In-app equivalent and schedule editing remain. Capability is normalized without full UA/fingerprint. Stage 25 tests current/current-previous browser/AT paths. | ADR-0030 |
| `ARCH-S22-D10` | Delivery acknowledgement means only protocol/provider acceptance, never display, reading, understanding or completed preparation. “Ignored routine” is a conservative scheduling signal only after a successfully accepted/surfaced routine intent has no related learner action before the next routine decision; failures never count. | Click/open analytics as learning evidence is false. Escalation after delivery failure punishes technology. Always infer ignore from no click creates pressure. | After three consecutive routine ignores, suppress the next routine push and ask in-app to change/disable. No backlog, penalty, mastery or Readiness effect. | ADR-0030 |
| `ARCH-S22-D11` | Endpoints/keys/date metadata are sensitive, owner-scoped, minimized, exportable without secrets, revocable and deletable. Delivery detail has 30-day raw operational retention; minimum idempotency/dedupe tombstones retain only non-content metadata for the accepted 90-day horizon. | Keep full logs forever aids debugging but profiles habits. Delete immediately prevents abuse/audit/dedupe. Push payload detail at provider expands exposure. | Deletion revokes endpoints first and tombstones late jobs. Stage-20 live deletion and disclosed ≤91-day backup residual remain. Stage 23 may shorten/tighten. | ADR-0030 |
| `ARCH-S22-D12` | Product caps, milestones and tone are immutable contract defaults; mutable empirical/operational values carry policy version, provenance, effective date, validation, monitor and rollback. Validation covers DST, travel, caps, dedupe, deletion, permissions and accessibility. | Scattered flags make silent engagement optimization possible. Hard-coded provider behaviour blocks exit. | No pass probability, streak, guilt, routine Corpus/AI call, raw-audio retention, or learner-data-to-Corpus path exists. Review via superseding product/ADR decision. | ADR-0030 |

## 4. Ownership, components, and boundaries

| Component | Owns | Must not own |
|---|---|---|
| Goal/Date aggregate | Date-mode facts, target month/range, planned/booked date, exam venue zone/time if known, completion/outcome transition | Readiness, attendance inference from elapsed date, official result inference |
| Schedule Preference aggregate | Days, local window/start, duration, quiet hours, planning IANA zone, zone mode, snooze/change-this-week, mock window | Coach priority, evidence, timer elapsed facts |
| Notification Preference aggregate | Global enabled, per-type opt-in, primary channel/endpoint, privacy detail mode, permission observations | Browser permission itself, engagement score, learner ability |
| Coaching & Planning | Current recommended action/reason, Stage-27 priority, due obligations, urgency projection | Transport, cap bypass, Readiness mutation |
| Occurrence projector | Local-calendar occurrences, milestone transitions, grouping candidates, resolved instants and expiry | Learner evidence or model-generated copy |
| Policy/cap engine | Eligibility, priority, bundling, one/day and rolling-seven limits, ignored suppression, quiet hours | Activity goals, streaks, marketing segmentation |
| Template registry | Reviewed locale/template versions and allow-listed slots | Arbitrary learner/provider/model prose |
| Delivery intent/outbox | One logical send decision, target channel, generation, idempotency, expiry | Proof of human receipt or task completion |
| pg-boss worker | Revalidate, dispatch, retry within expiry, record protocol outcome | Recompute truth from stale payload, bypass tombstones/caps |
| Web Push adapter | RFC encryption/VAPID and browser endpoint response normalization | Learner ID as provider topic, persistent engagement profile |
| Service worker push handler | Verify same-origin signed intent envelope, show minimized reviewed notification, navigate to safe route | Generic API caching, learner truth, raw audio, background coaching |
| In-app notification centre | Accessible current actions, reasons, schedule state and controls | Hidden dependence on push permission |
| Data Rights | Export, endpoint revocation, purge orchestration, restore suppression | Soft-delete-only lifecycle |
| Operations/Governance | Tzdb/template/policy/key releases, de-linked measures, incident controls | Manual semantic edits, copy experimentation for opens |
| Corpus | Asynchronous approved intelligence only | Learner date, schedule, endpoint, delivery, profile or notification data |

The accepted deployment remains one modular application plus worker against PostgreSQL/pg-boss. R2 has no notification role. IndexedDB may hold the current in-app projection and queued learner preference command under Stage 21; it never stores VAPID private keys, provider credentials, raw audio, or a second authoritative schedule.

~~~mermaid
flowchart LR
  G[Goal and date facts] --> P[Coaching and planning]
  E[Evidence and Readiness projections] --> P
  R[Review obligations] --> P
  S[Schedule and notification preferences] --> O[Occurrence projector]
  P --> O
  T[Template and policy releases] --> O
  O --> C[Grouping caps quiet-hours suppression]
  C --> I[Logical delivery intent]
  I --> N[In-app notification centre]
  I --> Q[PostgreSQL plus pg-boss]
  Q --> W[Web Push adapter]
  W --> B[Browser-selected push service]
  B --> SW[Origin service worker]
  SW --> U[Minimized system notification]
  U --> N
  D[Data Rights tombstone] --> C
  D --> Q
  D --> W
~~~

## 5. Schedule, date, and notification model

The following is explanatory pseudotype, not production schema.

~~~text
DatePlanV1 =
  | { mode: "no_date" }
  | { mode: "target_month"; yearMonth; planningZoneId }
  | { mode: "exact_planned"; localDate; planningZoneId }
  | { mode: "booked_exact"; localDate; examZoneId; localStartTime?: PlainTime;
      venueLabel?: minimized reference }
  | { mode: "exam_completed"; completedLocalDate; priorPlanRef }
  | { mode: "outcome_pending"; expectedResultLocalDate?: PlainDate }
  | { mode: "passed"; reportedOutcomeRef }
  | { mode: "not_passed_or_partial"; reportedOutcomeRef }

SchedulePreferenceV1 = {
  scheduleId; learnerScopeId; version; enabled;
  selectedWeekdays[]; preferredLocalStart?: PlainTime;
  preferredLocalWindow?: { start: PlainTime; end: PlainTime };
  usualDurationMinutes; optionalMockWindow?;
  quietHours: { start: PlainTime = 21:00; end: PlainTime = 08:00 };
  planningZoneId: IanaZoneId;
  zoneChoice: "confirmed_local" | "fixed";
  temporaryOverrides[]; policyVersion; updatedAt
}

NotificationPreferenceV1 = {
  version; globalEnabled; enabledTypes[];
  pushEnabled; primaryPushEndpointId?;
  lockScreenDetail: "minimized" | "action_only_opt_in";
  locale; ignoredRoutineCount; ignoredPolicyVersion
}

NotificationOccurrenceV1 = {
  occurrenceId; semanticKey; localDate; localTimeOrWindow;
  planningZoneId; resolvedInstant; resolvedOffset;
  tzdbRelease; dstResolution; reasonCandidates[];
  scheduleVersion; datePlanVersion; planningProjectionVersion
}

DeliveryIntentV1 = {
  intentId; learnerScopeId; occurrenceId; groupedReasonCodes[];
  type; priority; templateReleaseId; templateDataHash;
  localCapDate; rollingWindowKey; channel;
  state; scheduledInstant; expiresAt;
  policyVersion; endpointVersion?; generation; idempotencyKey
}
~~~

### 5.1 Persisted facts versus derived projections

| Class | Persisted authority | Derived/rebuildable |
|---|---|---|
| Learner-entered date status, schedule, quiet hours, notification opt-in, snooze, primary endpoint choice | Versioned owner facts | Current urgency band, next milestones, suggested schedule |
| Browser/device zone observation | Short-lived capability observation with coarse IANA ID and time | Mismatch prompt; never location history |
| Exact milestone transition | Product rules + DatePlan version | Candidate occurrence; target month uses first day only for conservative planning |
| Coaching reason/action | Planning source cut | Notification group candidate |
| Delivery intent and terminal dispatch receipt | Durable operational/idempotency record | Display/click summaries; never evidence |
| Readiness | Measurement projection only | Notification may reference a minimized reason but cannot calculate/change it |
| Validity | Evidence Ledger exactly `valid`, `partially_valid`, `pending`, `interrupted`, `not_counted` | No transport-derived validity |
| Client Readiness state | Exactly `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, `stale_contradicted` | No date-derived seventh state |

Missing component estimate remains absent, never zero. Written and Oral remain independent. Safe remains distinct from Ready to Book. No probability field, event, template slot, model, or hidden calculation is introduced.

### 5.2 Date and milestone rules

| Mode | Horizon source | Milestones | Notification consequence |
|---|---|---|---|
| No date | None | None | Planned-study/review/mock/weekly reminders only when configured and useful |
| Target month | First day of month for conservative band transition; UI retains full month range | 60/30/21/7 relative to earliest plausible day | “Target month is approaching”; never exact-day/countdown claim |
| Exact planned | Exact local calendar date in planning zone | 60/30/21/7 | Action-specific milestone if useful; weaker commitment language |
| Booked exact | Exact local date in exam zone; optional exact local start | 60/30/21/7, eve/day logistics | Booked-period cap and factual logistics; date still does not alter Readiness |
| Date needs update / passed without completion | No inferred attendance | One in-app clarification | Cancel stale urgency push; ask once in-app Taken / Rescheduled / Not taken |
| Exam completed / outcome pending | Completion fact, optional expected-result date | None | Cancel preparation urgency; at most one enabled gentle outcome follow-up |
| Passed | Outcome fact | None | Stop TELC B1 preparation notifications |
| Not passed/partial | Outcome fact and learner opt-in to a new goal | New date plan only after explicit choice | Preserve history; no automatic campaign or reset |

## 6. Calendar, time-zone, and DST contract

### 6.1 One civil-time vocabulary

- A **plain date** is a calendar fact without an instant: target month, exam local date, weekday schedule.
- A **plain local time/window** expresses learner intent such as Tuesday 18:30.
- An **IANA zone ID** supplies civil-time rules; a numeric offset or abbreviation is never a recurring-zone identity.
- An **instant** is the UTC job/delivery point produced from local date + local time + zone + resolution policy.
- Historical occurrence rows retain the zone, offset, tzdb release and resolved instant actually used. A later tzdb release never rewrites what happened.
- Future unsent occurrences are replaceable projections. A schedule/date/zone/tzdb/policy change increments generation, cancels old queued intents and resolves replacements.
- Retention expiry and job leases use server time. Attempt elapsed timing remains Stage-21 monotonic/server-anchor truth and is not reused as scheduling authority.

Server resolution uses the pinned PostgreSQL/IANA time-zone release through a small Calendar port. Client preview uses standards Temporal semantics where supported or a pinned compatible adapter, but the server returns the authoritative resolved occurrence. Differences fail safely to “schedule updating” and suppress external delivery; the in-app plan is still available.

### 6.2 DST resolution

For an ordinary recurring local time:

1. Build the intended local calendar occurrence first.
2. If the local time exists once, choose it.
3. If a forward transition skips it, apply Temporal/RFC-5545-compatible **later** resolution (move by the gap). If that exits the learner’s allowed window or enters quiet hours, skip external delivery; do not create makeup debt.
4. If a backward transition repeats it, choose the **earlier** instant exactly once. The semantic occurrence ID is unchanged, so the later duplicate cannot send.
5. Explicit exam logistics with a known venue/start preserves the exam’s published local time and zone. If it is ambiguous or changed by the organizer, require clarification instead of guessing.
6. Record `normal`, `gap_shifted_later`, `overlap_earlier`, `zone_change_suppressed`, or `invalid_requires_clarification`.

### 6.3 Worked time-zone/DST examples

| Example | Input | Resolution | Learner-visible result |
|---|---|---|---|
| Berlin spring gap | Sunday 2026-03-29 02:30, `Europe/Berlin` | 02:30 does not exist; resolve later to 03:30 CEST. If configured window ends 03:00, suppress | No duplicate/makeup. In-app action remains |
| Berlin autumn overlap | Sunday 2026-10-25 02:30, `Europe/Berlin` | Choose first 02:30 (CEST) once; semantic key blocks second 02:30 (CET) | One reminder only |
| Berlin → New York travel | Confirmed zone Berlin; device reports New York | Show Keep Berlin / Switch to New York. Until choice, any instant quiet in either zone is suppressed | No surprise overnight push; schedule truth is not silently changed |
| Multi-device mismatch | Account primary endpoint in Berlin; tablet seen in Cairo | Device observation cannot mutate learner schedule. Push remains only to explicit primary endpoint; Cairo device shows local in-app display and mismatch action | No two-zone duplicate |
| Target October | `target_month=2026-10`, planning zone Berlin | Milestone bands are conservatively calculated from 2026-10-01; display remains “October” | No invented exact exam date |
| Booked exam abroad | Learner in Berlin; exam booked 09:00 `Europe/Paris` | Logistics use Paris exam zone/date; ordinary study schedule stays confirmed planning zone | Travel cannot shift the exam start |
| Tzdb update | Future government rule changes after jobs projected | Activate new tzdb release; increment generation; re-resolve unsent occurrences; dispatch checks generation | Old jobs cancel; sent history is unchanged |
| Clock manually changed | Device wall clock moves | Server occurrence remains authoritative; browser zone mismatch may be observed | No cap reset or duplicate from client clock |

## 7. Reminder selection, grouping, caps, deduplication, and suppression

### 7.1 Supported reviewed reasons

Only these reason families may create proactive coaching intents: planned study, grouped high-value due review, decision-useful scheduled/recommended mock, 60/30/21/7 horizon transition that changes action, booked exam logistics, optional meaningful weekly coaching summary, and one gentle post-exam outcome follow-up. Security/account notifications remain separately governed and cannot be relabelled to bypass coaching caps.

Several candidates for the same local date become one intent. Within the message, the reason order follows Stage-27 precedence. The notification renderer cannot invent a more urgent claim than the accepted planning source cut. No individual mistake, flashcard, item, unanswered notification, or missed day becomes its own push.

### 7.2 Cap and deduplication matrix

| Situation / candidate | Daily cap | Rolling seven local-calendar days | Group/dedupe rule | Suppression/expiry |
|---|---:|---:|---|---|
| Normal preparation, all proactive coaching candidates | 1 | normally 4 | One logical intent merges planned action + due review + milestone/mock when compatible | Quiet hours, disabled type, stale plan, no useful action, three-ignore rule |
| Booked exam within 21 days | 1 preparation/urgency | up to 6 only when enabled and each is scheduled/high-value | Same merge; urgency does not manufacture a daily message | Same; passed/completed/rescheduled cancels |
| Exam eve/day logistics | May add 1 logistics intent, maximum total 2 that local day | Logistics exception does not erase other rolling counts | Logistics remains distinct only when combining would hide time-critical practical action | Expire at event/window; never deliver stale after exam |
| Due reviews | Shares ordinary cap | Shares ordinary cap | Bundle obligations; never one per item/mistake or “17 overdue” | Collapse after absence; reschedule by review value |
| Mock preflight + scheduled mock | Each counts; normally group when same useful window | Shares cap | Same mock commitment key; optional preflight at most one day earlier | Missed mock returns to planning queue, not daily resend |
| 60/30/21/7 milestone | Shares cap | Shares cap | One per date-plan version + milestone; suppress push if learner already saw current in-app change | Date change cancels old milestone |
| Weekly summary | Shares cap | Shares cap | Only when meaningful; cannot displace a higher-priority action | Empty/noisy summary produces no intent |
| Post-exam follow-up | At most one total per completion episode when enabled/useful | No repeated polling | Unique completion episode key | Result recorded, disabled, expiry, or delete |
| Security/account | Separate security policy | Separate security policy | Cannot carry coaching/engagement content | Provider/security contract |
| Multi-device | Logical cap remains one | Logical cap remains one | One primary push endpoint; in-app card keyed identically across devices | Endpoint switch atomically retires old primary generation |

The cap calendar uses the confirmed planning zone; booked exam logistics uses the exam zone for eve/day classification. The persisted logical intent consumes the cap before any provider attempt, so retries and endpoint response duplication cannot create another count. A cancelled-before-dispatch intent no longer counts only when the same transaction safely replaces it with the identical semantic occurrence; cap history is otherwise conservative.

### 7.3 Ignored-reminder behaviour

`ignoredRoutineCount` is not evidence, motivation, success, analytics value, or a user-visible reprimand. It advances only when:

- the reason is a routine planned-study reminder;
- the transport was accepted by the push service or the in-app reminder was actually surfaced;
- the reminder was not affected by a delivery/permission/technical fault;
- before the next routine scheduling decision there was no relevant `start`, `done`, `not_today`, `snooze`, `change_schedule`, or `turn_off` action.

A mere provider acceptance is not proof of display, so any ambiguity biases toward **not** increasing pressure. Explicit schedule action resets or resolves the counter. After three consecutive qualifies-as-ignored routine reminders, the next routine push is `suppressed_ignored`; the next in-app visit asks neutrally whether to change days/time or turn reminders off. Major enabled booked-exam milestone/logistics messages may still occur within caps because their purpose differs. Routine pushes remain reduced if the learner never returns. There is no missed-notification backlog.

## 8. Delivery and suppression state model

~~~mermaid
stateDiagram-v2
  [*] --> Candidate
  Candidate --> Suppressed: disabled / no useful action / privacy or owner rule
  Candidate --> Grouped: eligible reason
  Grouped --> Suppressed: cap / quiet hours / ignored / unresolved zone
  Grouped --> Scheduled: resolved instant + current generation
  Scheduled --> Cancelled: plan/date/zone/template/endpoint/delete generation changed
  Scheduled --> Dispatching: due + execution revalidation passed
  Dispatching --> Accepted: push service accepted
  Dispatching --> Retryable: bounded transient response before expiry
  Retryable --> Dispatching: same intent and idempotency key
  Retryable --> Expired: useful window ended
  Dispatching --> FailedPermanent: invalid/expired endpoint or hard fault
  Accepted --> Expired: no learner action before relevance ends
  Accepted --> Actioned: open/start/snooze/change/disable
  FailedPermanent --> [*]
  Suppressed --> [*]
  Cancelled --> [*]
  Expired --> [*]
  Actioned --> [*]
~~~

A provider `201/202`/equivalent means accepted for delivery, not displayed, read, understood, or acted upon. No state is called “delivered to learner” without a browser-level signal, and even a click is not learning evidence. Retry uses the same logical intent and short useful TTL. Late success after cancellation/deletion is discarded and the endpoint is reconciled.

### 8.1 Scheduling and dispatch sequence

~~~mermaid
sequenceDiagram
  participant L as Learner
  participant A as App/API
  participant S as Scheduling owner
  participant DB as PostgreSQL/pg-boss
  participant W as Web Push adapter
  participant P as Browser push service
  participant SW as Service worker

  L->>A: save schedule/date/zone/permission choice (operation ID + expected version)
  A->>S: owner command
  S->>DB: commit fact + new generation + recompute job
  DB-->>S: durable receipt
  S->>S: project local occurrences; group; apply caps/quiet/suppression
  S->>DB: commit logical intent + due job atomically
  DB->>W: due intent
  W->>DB: recheck owner/tombstone/generation/cap/expiry/endpoint
  alt current and eligible
    W->>P: encrypted minimized payload + VAPID + TTL/topic
    P-->>W: accepted / transient / permanent
    P-->>SW: best-effort push
    SW->>SW: verify envelope; replace by semantic tag
    SW-->>L: reviewed minimized notification
  else stale/deleted/disabled
    W->>DB: cancel/suppress without send
  end
  L->>A: open / snooze / change / turn off
  A->>S: idempotent action command
~~~

## 9. Background jobs, stale cancellation, and retry

- Occurrences are projected for a bounded rolling horizon; the exact horizon and scan batch are operational parameters in `notification-schedule-policy/v1`, not product behaviour. There is no unbounded per-learner cron or one job per item.
- Any accepted change to DatePlan, SchedulePreference, NotificationPreference, primary endpoint, relevant Planning projection, template/policy release, tzdb release, goal completion, or deletion increments the affected generation and enqueues one coalescible recompute.
- Fact change and recompute job commit atomically. Projection output and delivery intent use unique semantic keys. A duplicate job returns the same effect.
- The due worker re-fetches learner scope state, deletion tombstone, generation, permission/endpoint status, cap ledger, quiet-hours resolution, template availability and expiry. The queued payload is never trusted as current truth.
- Retry is bounded by the intent’s useful expiry and provider `Retry-After`; no retry crosses exam time, quiet-hour boundary, completion, cancellation, or template/key revocation. There is no next-day makeup.
- Web Push `TTL` is no later than useful expiry. RFC 8030 topic/replacement and Notifications `tag` use a non-identifying semantic hash so a browser replaces duplicates without exposing learner or weakness identity.
- Permanent endpoint status deactivates that endpoint. The App does not silently select another device, re-prompt permission, fall back to email, or escalate frequency. It retains the in-app equivalent.
- Worker outage: the in-app projection remains current on next open. Jobs that become stale expire/cancel; recovery never floods a backlog.
- Database outage: no external send is attempted from an unaudited memory queue. Local schedule editing may queue safely under Stage 21, with honest “changes waiting to sync.”
- Tzdb/template/policy/key activation is staged, shadow-diffed and rollbackable. A release can be stopped without rewriting facts.

## 10. Transport, provider, and cost alternatives

| Alternative | Capability/browser reality | Privacy/security/rights | Cost and operations (2026-08-23) | Portability/exit | Decision |
|---|---|---|---|---|---|
| **In-app only** | Works whenever App opens; complete behaviour, no system permission | Smallest exposure | No incremental provider fee; ordinary App/DB reads | Permanent fallback | Required for all learners, but optional push adds useful background convenience |
| **Direct standards Web Push** | Service worker + Push/Notifications; iOS/iPadOS requires Home Screen web app; browser-selected push service controls delivery | RFC payload encryption; provider still sees endpoint/timing/frequency/size; VAPID secret server-only | No notification SaaS list fee; existing compute/DB/bandwidth and browser endpoint quotas; maintainer compatibility/key/abuse duty | Standards subscriptions, adapter and endpoint deletion; turn off without changing domain | **Selected launch external transport** |
| Firebase Cloud Messaging | No-cost product and strong cross-platform SDK/control plane | Adds Google project, SDK, identifiers/terms and another processor/control plane; web still follows browser constraints | FCM currently no cost; setup, data governance and migration labor remain | Export domain facts; replace adapter/subscriptions | Rejected: no capability needed beyond direct Web Push |
| OneSignal | Managed Web Push, UI, analytics/journeys | Adds contact/subscription records and engagement-oriented features; DPA/region/retention review required | Free USD 0; Growth from USD 19/month + USD 0.004/Web Push subscriber; prices/limits mutable | Export/delete subscriptions; replace SDK/worker and resubscribe may be required | Rejected: caps/templates already domain-owned; adds cost/control plane |
| Existing SES email | Broad mailbox reach for accounts | Email address required; mailbox/subject/body metadata persists; risk of sensitive details and deliverability/support | Stage-20 SES Essentials currently USD 0.16/1k recipients plus ordinary related charges | Existing SMTP adapter; alternate EU-capable SMTP | Not a launch coaching reminder channel; retained for identity/security email only |
| SMS/native mobile push | High salience, phone number or native apps required | Larger identity/provider/platform surface | Per-message/native build/store/ops costs | Channel-specific migration | Rejected: launch is responsive web and no need is measured |
| Browser-local alarm only | Potentially simple client experience | Device-local | No provider fee | Poor | Rejected: web background scheduling is not a reliable universal alarm, cannot enforce server caps or account dedupe |

### 10.1 Cost measures and upgrade triggers

Measure de-linked: eligible intents, suppressed reasons, accepted/transient/permanent provider outcomes, endpoint churn, retry work, bytes, pg-boss lag, template/zone generation rebuilds, primary-device switches, opt-in/disable support burden, and total compute/maintainer time. Do not optimize opens, streaks, days active, precise behaviour history, or notification-derived learning outcomes.

Keep direct Web Push while cap correctness, expiry, deletion, supported-browser release evidence and maintainer burden remain acceptable. Consider managed delivery only when, for three release windows after ordinary adapter/retry/index tuning, measured endpoint/vendor variation causes a Stage-24 reliability objective to fail or support/maintenance time exceeds a documented managed alternative’s total cost. Selection then requires DPA/region/retention/accessibility/security review, export/delete drill, standards-compatible domain boundary and a superseding ADR. A native channel requires measured web limitation that materially harms useful preparation, not install growth.

Cheapest fallback is in-app only. The service can disable Web Push globally or by affected browser endpoint without changing schedules, in-app milestones, planning, evidence or Readiness. Cost may never remove pass-critical Writing/Oral evidence, accessibility, recovery, data rights, or honest scheduling.

## 11. Permission, privacy, security, and failure contract

### 11.1 Permission lifecycle

~~~mermaid
stateDiagram-v2
  [*] --> Unsupported
  [*] --> NotRequested
  NotRequested --> ExplainerShown: learner opens reminder settings
  ExplainerShown --> BrowserPromptPending: explicit Enable action
  BrowserPromptPending --> GrantedUnregistered: browser grants
  BrowserPromptPending --> Denied: browser denies/dismisses
  GrantedUnregistered --> Registered: endpoint stored and primary confirmed
  Registered --> Revoked: browser permission/subscription removed
  Registered --> EndpointExpired: permanent endpoint response
  Registered --> Disabled: learner turns push off
  EndpointExpired --> ExplainerShown: learner explicitly repairs
  Revoked --> ExplainerShown: learner explicitly repairs
  Denied --> ExplainerShown: learner chooses help/settings
  Disabled --> ExplainerShown: learner enables again
~~~

Rules:

1. Do not request on arrival, onboarding, goal/date entry, diagnostic, sign-in, or an unrelated click.
2. Show an App-owned explanation of value, frequency, privacy, primary-device behaviour, in-app equivalent and how to disable. Only the explicit Enable control invokes the browser prompt.
3. Denied/dismissed/unsupported does not loop. Show concise settings/help and retain full in-app behaviour.
4. iOS/iPadOS explains that Web Push is available to Home Screen web apps on supported versions; adding to Home Screen is optional and not a core gate.
5. A successful subscription is registered using an idempotent operation and then explicitly selected as the primary reminder browser. Switching primary increments endpoint generation and cancels old-target jobs.
6. Browser `pushsubscriptionchange`, endpoint expiration, permission revocation and site-data clearing are reconciled. A lost guest browser may be unrecoverable under Stage 20; no fingerprint recovers it.
7. Unsubscribe is local + server command. Local failure shows precise retry; server deletion/tombstone prevents further sends.

### 11.2 Permission/privacy/failure matrix

| Situation | Stored/observed state | Learner experience / recovery | Truth consequence |
|---|---|---|---|
| Permission unsupported | Normalized unsupported reason; no full UA | In-app reminders/settings; honest platform note | None |
| Permission not requested/denied | State only; no repeated prompt | Full in-app plan; enable/help only by learner action | None |
| iOS not Home Screen | Capability limitation | Explain optional Home Screen requirement; do not block | None |
| Endpoint accepted by provider | Accepted protocol status, no claim of human display | In-app state remains; no “you saw this” | None |
| Push late/duplicate | Same semantic tag, TTL and current-generation check | Replace/suppress; stale click lands on current safe action | No missed-day penalty or backlog |
| Provider/worker/browser outage | Retryable/permanent/expired neutral reason | Current in-app action; optional retry/repair | Technical fault cannot count as ignored or learner failure |
| Schedule/date/zone changed | New owner version/generation | Old job cancelled; future occurrence recomputed | Historical evidence/Readiness unchanged |
| Three routine ignores | Scheduling-only counter | Suppress next routine push; next in-app visit offers change/off | No shame, score, mastery or evidence change |
| Deletion | Scope tombstone; endpoint revoke/purge tasks | Access revoked now; proof names remaining bounded backup residual | Late jobs cannot resurrect/send |
| Security/key incident | Disable affected key/adapter; revoke generation | In-app only; learner may explicitly resubscribe after recovery | No learning consequence |
| Accessibility failure | Release/support fault | In-app equivalent and accessible repair/help | Never learner failure |

### 11.3 Security controls

- Treat endpoint URL, `p256dh`, auth secret, VAPID private key, exam date/time, schedule and delivery metadata as sensitive. Endpoint material is encrypted at rest using the Stage-23 key-management control when selected, never placed in logs/analytics/URLs/export, and returned only as redacted channel status.
- VAPID private keys live only in the server secret boundary. Key release is versioned; rotation overlaps old sending only for a bounded migration, because subscriptions bind the application-server key. Learners are asked to resubscribe only when needed.
- Subscription creation/deletion and preference actions require same-origin authenticated/guest scope, CSRF/origin protection, object authorization, expected version and stable operation ID. An endpoint cannot be attached to another learner merely by knowing its URL.
- Push payload is encrypted and minimized. It carries an opaque short-lived intent locator, template release and non-identifying display fields; never a session token, learner ID, score, weakness, Readiness label, exact booked date by default, response, transcript, access/medical data, Corpus data, or raw audio.
- Notification click navigates to an allow-listed same-origin route and re-fetches current authorized state. Stale locators cannot open deleted/other-learner data. No sensitive data appears in query/referrer.
- Provider rate limiting and abuse are bounded per endpoint/scope/key. Unknown endpoint host schemes, oversized keys/payloads, redirects, template majors and response classes fail closed.
- The browser push service necessarily observes metadata described by W3C even with encrypted payloads. This is disclosed in plain language and reviewed under Stage 23; no legal-compliance claim is made.
- Corpus receives no learner data and no notification path. There is no AI call per occurrence/send. Raw audio remains ephemeral, absent from scheduling, push, logs, backup and export.

### 11.4 Accessibility

- Reminder settings, date modes, zone mismatch, permission explainer, primary-browser selection, quiet-hours controls, schedule exceptions, suppressed state and recovery are keyboard-operable, correctly labelled, preserve errors, reflow at 320 CSS px / 400% desktop, support 200% text zoom, and do not rely on color/motion.
- Date controls expose textual mode and format guidance, not placeholder-only or unlabeled calendar widgets. Target month remains announced as a month/range; booked/planned distinction is text.
- Quiet hours crossing midnight are explained in plain language. Zone choice shows city/region plus current offset for comprehension but persists the IANA ID; abbreviations alone are forbidden.
- System notification copy uses short reviewed language and the correct locale/direction. In-app holds the full accessible reason/action/commitment and control alternatives.
- Permission error/status uses a polite live region only on meaningful change. No repeated prompt, timer tick, countdown, streak, guilt, vibration dependence, sound-only meaning, auto-focus steal, or time-limited inaccessible action.
- Every push action has the same in-app control. “Not today,” “Snooze,” “Change this week,” “Turn off,” and “Use this browser” remain available without gestures or precision pointing.
- Stage 25 must test configured behaviour, not trust provider/browser claims: current/current-previous Chrome/Edge/Safari/Firefox where supported, macOS/iOS/Android/Windows coverage, VoiceOver/NVDA/TalkBack paths, permission denied/revoked, Home Screen limitation, duplicate replacement, reflow/zoom/reduced motion and stale-click recovery.

## 12. Versioned API, state, and compatibility boundary

Explanatory HTTP names below establish semantics, not production route code.

| Command/query | Contract and idempotency | Result states |
|---|---|---|
| Update DatePlan | Stable operation ID + expected owner version; validates date/mode/zone; increments schedule generation | accepted, conflict with current value, invalid date/zone, deletion in progress |
| Update SchedulePreference | Full semantic patch with expected version; offline queue permitted for ordinary edit | accepted, conflict requiring field choice, blocked incompatible, queued locally |
| Update NotificationPreference | Explicit type/global/privacy changes; opt-out tombstone dominates stale enable | accepted, already applied, conflict, deletion in progress |
| Register PushEndpoint | Explicit permission proof observation + subscription keys + endpoint generation; endpoint hash uniqueness inside owner scope | registered, already registered, unsupported, permission mismatch, invalid |
| Select primary endpoint | Expected notification version; atomically retire prior primary generation | selected, conflict, endpoint inactive |
| Revoke PushEndpoint | Stable op; local unsubscribe best effort plus server tombstone | revoked, already revoked, retry local cleanup |
| Query current notification projection | Source cut + policy/template/date/schedule versions; includes in-app equivalents and neutral channel status | current, rebuilding, channel unavailable, upgrade required |
| Notification action | Intent ID + action ID + stable op; re-fetches current plan | opened/current action, stale replaced by current action, snoozed, changed, disabled |
| Delivery worker envelope | Intent/generation/template/key/endpoint major + idempotency | accepted, transient, permanent endpoint, expired, stale, deleted |

Compatibility:

- Independent majors for `date-plan`, `schedule-preference`, `notification-preference`, `occurrence`, `delivery-intent`, `template`, `schedule-policy`, `web-push-adapter`, and `tzdb-release`.
- Additive optional fields are preferred. Unknown consequence-bearing mode, reason, cap class, template major, time-zone resolution or endpoint contract fails external delivery closed while in-app shows a reviewed generic current action or update requirement.
- Old clients may read safe text but cannot guess a new mode/cap. Offline edits preserve their outbox and receive an explicit conflict/upgrade result.
- Template releases are immutable, locale-reviewed and checksum-addressed. Policy/tzdb/key activation uses shadow projection, fixture diff, approver, effective time, monitor and rollback target.
- Date/schedule corrections create new owner versions and cancel/recompute future occurrences. Sent/terminal operational history is not rewritten.

## 13. Retention, export, deletion, and data rights

| Data class | Retention/default | Export | Delete |
|---|---|---|---|
| DatePlan and schedule facts/history | Active goal + meaningful history until learner deletes; post-exam truth retained with Progress | Human-readable and machine versions, local date/zone/status and corrections | Live purge with learner scope; de-linked aggregate only if irreversibly unlinked |
| Notification preferences/zone choices | Current + bounded correction/audit needed for control | All settings and current channel status | Purge/tombstone; stale enable cannot replay |
| Push endpoint/keys | Only while enabled/repairable; remove promptly on revoke/permanent expiry | Redacted browser/channel/created/last-success/primary status, never endpoint/keys | Revoke/deactivate and purge server/provider-controllable copies |
| Occurrences/intents | Current/future while useful; terminal detail 30 days | Understandable recent reminder history/reasons/status, no secret | Purge learner link/content; deletion tombstone blocks late jobs |
| Minimal idempotency/dedupe receipt | 90 days or producer retry horizon under Stage 05/12; strip template data/content | Only learner-understandable operation status | Purge/de-link after orchestration and ≤91-day restore-suppression window |
| Operational metrics/logs | 30-day raw default; longer only irreversibly de-linked aggregate | Not ordinary export unless needed to explain learner operation | Remove learner link; no session replay/payload |
| Template/policy/tzdb releases | Non-personal governance history | Referenced versions in manifest | Not learner personal data; no learner mapping remains |

Stage-20 deletion applies: access and active delivery stop first; live DB, endpoint, job, cache/local-reachable and provider-controlled data purge idempotently; restore replay honours the deletion journal; shared backups expire under the disclosed maximum 91-day window. A permanently offline/lost device and already displayed notification cannot be remotely erased, and exported files remain learner-controlled. The UI states these limits without claiming “immediate, total, no backup.”

Guest and account learners have the same export/delete right while they possess authority. Local-only/offline export may be incomplete and says so. Export never contains VAPID/subscription/auth keys, provider secrets, restricted content bytes, raw audio, another learner, model prompts, precise access inferences, or a pass probability.

## 14. Operations, validation, and release gates

### 14.1 Deterministic test catalogue

| Test family | Required proof |
|---|---|
| Date lifecycle | Every transition, target-month range, past date clarification, repeated reschedule, passed-date non-attendance, post-exam cancellation |
| Truth separation | Dates/sends/clicks/misses cannot change five validity or six Readiness states; Written/Oral independent; absent not zero; no probability |
| Caps/property tests | Permute candidates/retries/devices/time zones; one/day, 4/7, booked 6/7 and eve/day max two always hold; security class cannot carry coaching |
| Group/dedupe | Many due items/milestone/mock/study become one proper group; duplicate/reordered jobs/endpoints yield one logical intent |
| DST/tzdb | Gaps/overlaps, non-hour shifts, cross-midnight quiet hours, target-month boundary, tzdb activation/rollback, server/client disagreement |
| Travel/multi-device | Keep/switch/suppress ambiguity, fixed exam zone, primary endpoint switch, stale old endpoint, no duplicate |
| Jobs/failure | Crash at fact/job/intent/dispatch/receipt; stale generation, retry-after, TTL expiry, backlog recovery, DB/worker/provider outage |
| Permission/browser | Explicit gesture, denied/dismissed/revoked/expired, secure context, iOS Home Screen limitation, service-worker/key rotation |
| Security/privacy | Cross-learner endpoint attack, CSRF/origin, secret/log scan, payload minimization, stale click, endpoint host validation, rate/abuse |
| Export/delete | Complete redacted export; delete race with due/retry/provider callback; restore suppression; no post-delete send/resurrection |
| Accessibility | Keyboard/AT/reflow/zoom/locale, status announcements, quiet-hours/zone comprehension, in-app parity, no color/sound/motion-only state |
| Copy | Every reason/template locale reviewed; action + value + commitment; no streak/guilt/we-miss-you/arithmetic-only countdown/sensitive default |
| Cost/exit | Direct push off switch, in-app-only continuity, key/provider adapter replacement, subscription recovery, unit cost/maintainer measures |

Release blocks on any cap bypass, duplicate logical push, external delivery after opt-out/delete/completion, quiet-hour surprise, stale milestone, sensitive payload/log leak, inaccessible in-app equivalent/permission route, notification-derived learner penalty, date-derived Readiness change, or inability to disable Web Push without losing planning.

### 14.2 Monitors and runbooks

Operate de-linked dashboards for due-job lag by coarse class, stale-generation cancellation, cap/suppression reasons, provider response class, endpoint expiry, tzdb/template/policy/key version, no-post-delete-send proof, and maintainer/cost units. No learner response, exact date, raw schedule, endpoint, weakness, Readiness, transcript, raw audio, accessibility inference, or cross-context tracking ID enters metrics.

Runbooks:

1. **Push provider/browser incident:** stop affected adapter/key/endpoint class; leave in-app current; expire rather than flood; communicate neutral channel state.
2. **Tzdb change:** pin candidate release, diff representative and all near-term future occurrences, approve, activate generation, cancel old jobs, monitor, rollback pointer if needed.
3. **Template defect/sensitive copy:** revoke release immediately, cancel unsent intents, use reviewed minimized fallback, incident-review any sent exposure.
4. **VAPID key compromise:** disable key generation, stop sends, rotate server secret, require explicit resubscription where binding requires it; never silently fall back channel.
5. **Cap/dedupe defect:** global external-send kill switch; preserve in-app plan; reconcile terminal intents; no makeup sends.
6. **Deletion failure:** access/endpoints remain revoked, purge retries continue, proof names incomplete target; restore journal prevents resurrection.

## 15. Alternatives and simplest sufficient baseline

The do-nothing external baseline—only the in-app plan—is valid and is the permanent safe fallback. Direct Web Push is selected because it adds one useful capability without outsourcing schedule/cap/copy truth. It is deliberately thinner than a marketing platform: no segments, journeys, campaigns, “optimal send time,” A/B copy, per-open scoring, re-engagement automation, or analytics warehouse.

A device-local alarm is not a reliable cross-browser web contract and cannot enforce account-level caps/dedupe. Email and SMS add identity/exposure and are unnecessary for launch. Native/PWA installation cannot be required; the existing web-app manifest/Home Screen experience may enable iOS push when the learner chooses it, but installability remains separate from core use.

A later provider must implement the same Delivery port, consume already-decided logical intents, and return only normalized transport outcomes. It cannot own targeting, urgency, caps, copy, learner segments, date logic, evidence, or Readiness. Provider export/deletion and subscription migration must be drilled before activation.

## 16. Relationship to earlier and later stages

### Earlier contracts preserved

- Stage 05: PostgreSQL authority, pg-boss jobs, IANA zone/offset occurrence facts, 30/90-day operational bounds and backup/deletion journal.
- Stage 08: deterministic coaching and Stage-27 precedence select the action; notifications do not re-plan.
- Stage 12: stable operation IDs, atomic fact+job, versioned discriminated states, idempotent retry and stale worker rejection.
- Stage 13: one semantic UI and bounded browser state; no framework reopening.
- Stage 14: contextual optional permission, capability-based support, WCAG 2.2 AA and no global UA gate.
- Stage 20: account-optional first use, schedule owner merge, stale opt-out dominance, one learner scope, export/delete and provider portability.
- Stage 21: narrow service worker, IndexedDB pre-receipt outbox, foreground-first recovery, deletion tombstones, no raw-audio sync/cache and timer/scheduling separation.

### Downstream requirements

| Stage | Must preserve / receives |
|---|---|
| 23 Security/privacy/legal | Endpoint/key/date/schedule classification, minimized payload, browser push-service metadata disclosure, retention/delete contract; may tighten, not weaken. Jurisdiction-specific DPA/subprocessor/legal wording remains its owner. |
| 24 Observability/operations | De-linked delivery/cap/job/tzdb/template/cost signals; must not convert opens into engagement success or learner evidence. Defines concrete SLO thresholds below fixed release blockers. |
| 25 Testing/release | Full permission/browser/AT/Home Screen/DST/travel/dedupe/delete matrix and configured-service-worker evidence. |
| 26 Deployment/operations | Secret/tzdb/template/policy rollout, pg-boss sizing, kill switch, restore/delete proof and current cost recheck. No provider change without ADR. |
| 27 Validation | Cross-scenario precedence; urgency/notifications never outrank truth or create learner penalty. |
| 28 Consolidation | Retain ADR-0030, exact invariants, provider exit, open deferrals and traceability. |

Dependencies introduced: a server-side Calendar port with pinned IANA/tzdb lineage; a Web Push adapter with VAPID/encryption; a reviewed template registry; one explicit primary endpoint; cap/dedupe ledger; and contextual service-worker push handling. No new paid provider or datastore is introduced.

Dependencies removed/rejected: notification SaaS, FCM requirement, routine email/SMS, native app, infinite cron, browser-local alarm authority, broadcast-to-all-devices, AI copy, engagement journeys, per-item reminders, open-derived learning evidence, streaks and nagging.

## 17. ADR

Created:

- `Architecture/adr/ADR-0030-deterministic-local-calendar-scheduling-and-replaceable-standards-web-push.md` — **Accepted**. It fixes civil-time recurrence, deterministic grouping/caps/dedupe, one primary endpoint, in-app parity, direct standards Web Push, reviewed minimized templates, permission/data-rights boundaries and provider exit.

No earlier ADR is superseded.

## 18. Decisions made

1. Scheduling & Notifications is one module in the modular monolith; no new service/store.
2. Date lifecycle and Readiness remain orthogonal; target month stays a range and passed date never implies attendance.
3. Schedule intent is local-calendar + confirmed IANA zone; UTC is a resolved job instant, not recurrence truth.
4. DST gaps resolve later within the allowed window; overlaps choose earlier exactly once; zone/tzdb changes regenerate unsent jobs.
5. Travel is explicit Keep/Switch; ambiguous quiet-hour sends suppress.
6. Bounded occurrence projection + pg-boss uses atomic facts/jobs, generation revalidation, idempotency, TTL and stale cancellation.
7. Fixed product types, caps, ignored suppression, quiet hours and Stage-27 grouping are deterministic.
8. One logical intent counts once and an account has one explicit primary push endpoint; in-app parity exists on all devices.
9. Launch uses in-app + optional direct RFC Web Push, not FCM/OneSignal/email/SMS/native.
10. Permission is contextual and learner-initiated; denied/unavailable causes no consequence or repeated prompt.
11. Templates are reviewed/versioned/minimized; no AI, sensitive lock-screen detail, engagement copy, streak or arithmetic-only countdown.
12. Protocol acceptance is not human delivery and notification behaviour is never evidence.
13. Endpoint/date/schedule/delivery data is minimized, exportable, revocable and deleted under Stage-20 truth; raw audio and Corpus are absent.
14. Current official/browser/provider/pricing/tzdb facts are release-rechecked; in-app-only is the permanent exit.

## 19. Risks, assumptions, and validation evidence needed

| Risk/assumption | Evidence or trigger | Owner |
|---|---|---|
| Direct Web Push reliability varies by browser/vendor/network | Stage-25 matrix and Stage-24 coarse outcome/SLO; managed provider only after sustained measured failure | 24/25/26 |
| iOS Home Screen requirement reduces opt-in | Usability/support evidence; keep in-app complete, never require install | 25 |
| One primary endpoint may surprise multi-device learners | Test explicit selection/switch copy and endpoint status comprehension | 25 |
| Tzdb changes can move near-term occurrences | Candidate diff, pinned release, rollback and near-term regression fixtures | 26 |
| Ignored inference can be wrong | Bias toward suppression/no counter, qualitative usability review; never use as evidence | 24/25 |
| Lock-screen minimization may reduce action clarity | Accessibility/privacy usability test; opt-in action-only detail without weakness/score/date | 23/25 |
| Push service is a processor/metadata observer | Jurisdiction-specific legal/DPA/subprocessor review; plain disclosure | 23 |
| VAPID rotation may require resubscription | Key-rotation drill across supported browsers and in-app-only fallback | 25/26 |
| Rolling projection horizon/batch size unknown | Load/job-lag evidence; tune policy without changing cap/date semantics | 24/26 |
| Provider pricing/support is mutable | Recheck official docs before provisioning and every release/provider review | 26 |

## 20. Open questions and intentional deferrals

No owner question blocks Stage 22.

Intentionally deferred:

- Jurisdiction-specific legal basis, DPA/subprocessor wording, encryption/KMS implementation and exact post-revocation retention may be tightened by Stage 23.
- Concrete alert/SLO/error-budget values and measured upgrade thresholds belong to Stage 24; the semantic release blockers here are fixed.
- Current/current-previous device/browser/AT evidence, install/Home Screen guidance and configured service-worker acceptance belong to Stage 25.
- Exact DDL, HTTP route names, Temporal-compatible implementation package, pg-boss batch/horizon/backoff values, VAPID secret store and deployment runbooks belong to implementation/Stage 26 inside the fixed contracts.
- Adding email, managed push, native app, per-device multi-primary delivery, detailed lock-screen content or a new reminder family requires measured evidence and, when consequential, a superseding ADR/product decision.

## 21. Definition of done

- [x] Every required GitHub input was read at an immutable ref; prerequisite continuity and design/product reconciliation are recorded.
- [x] Schedule/date/notification model covers all date modes, quiet hours, travel, target range, milestones and post-exam.
- [x] Delivery/suppression state diagram and scheduling sequence exist.
- [x] Cap/dedupe matrix fixes one/day, rolling-seven, booked-period, eve/day exception, grouping and ignored suppression.
- [x] Time-zone/DST semantics and worked examples fix gaps, overlaps, travel, multi-device, target month, exam zone and tzdb update.
- [x] Transport/provider/cost alternatives select direct standards Web Push with in-app-only fallback and provider exit.
- [x] Permission/privacy/failure contract covers browser support, security, retention, export, deletion, accessibility and neutral faults.
- [x] Data/API/state/ownership/versioning, operations, validation, risks, downstream handoff and deferred implementation choices are explicit.
- [x] Exact five validity and six Readiness states, independent Written/Oral truth, absent-not-zero, no probability, no learner-data-to-Corpus and ephemeral raw audio are preserved.
- [x] ADR-0030 is consequential, accepted and indexed.
- [x] No shaping, Design, earlier architecture, production code, schema, endpoint implementation, provider configuration or owner decision was changed.
