# ADR-0030: Deterministic local-calendar scheduling and replaceable standards Web Push

- **Status:** Accepted
- **Date:** 2026-08-23
- **Owner:** Architecture Stage 22 — Notifications, Scheduling, and Time Zones
- **Decision IDs:** `ARCH-S22-D01`–`ARCH-S22-D12`
- **Supersedes:** None
- **Superseded by:** None

## Context

Bestehen reminders exist only to protect a concrete preparation action or planning decision. All date/urgency/scheduling behaviour must remain in-app; push is optional convenience. Product authority fixes No date, Target month, Exact planned date, Booked exact date and post-exam lifecycle; 60/30/21/7 milestones; editable 21:00–08:00 local quiet hours; normal maximum one proactive coaching notification/day and normally four/rolling seven; booked-within-21-days maximum one/day and up to six/rolling seven; one additional useful exam-eve/day logistics notification; obligation bundling; suppression after three consecutive ignored routine reminders; and no streak, guilt, “we miss you,” generic engagement or arithmetic-only countdown copy.

Scheduling is civil-time state, while delivery jobs use exact instants. DST gaps/overlaps, travel, target-month ranges, exam venue time, tzdb changes, stale jobs and multiple account devices can otherwise create drift, duplicates or overnight messages. Browser push permission and delivery vary: iOS/iPadOS Web Push requires a supported Home Screen web app; push services are browser-selected; encrypted payloads still expose timing/frequency/size metadata; provider acceptance does not prove display or learner action.

Prior architecture already selects a modular Next.js/Node application, PostgreSQL/pg-boss authority, a narrow service worker, IndexedDB pre-receipt continuity, account-optional use, owner-specific merge, deletion tombstones, deterministic Coaching/Evidence/Readiness, WCAG 2.2 AA and no learner data to Corpus. A marketing notification platform, second database, native app or AI copy engine would add coupling without a measured requirement.

## Decision

1. **Single owner and truth boundaries.** Scheduling & Notifications is one module in the accepted modular monolith. It owns DatePlan, SchedulePreference, NotificationPreference, calendar occurrences, caps, templates, endpoints, delivery intents and transport outcomes. Planning owns recommended actions; Evidence owns exactly `valid`, `partially_valid`, `pending`, `interrupted`, `not_counted`; Measurement owns exactly `evidence_building`, `not_ready`, `borderline`, `safe`, `ready_to_book`, `stale_contradicted`. Dates and sends cannot change either.
2. **Date lifecycle.** Preserve `no_date`, `target_month`, `exact_planned`, `booked_exact`, `exam_completed`, `outcome_pending`, `passed`, and `not_passed_or_partial`. A target month remains a range and uses its first day only for conservative milestone planning. A passed date does not infer attendance. Date never changes Readiness; Written and Oral stay independent; missing remains absent, not zero.
3. **Local-calendar scheduling.** Persist local weekday/date/time/window, confirmed IANA planning zone, quiet hours and learner overrides. Persist each resolved UTC instant with offset, tzdb release and resolution policy. Numeric offsets/abbreviations are not recurrence identities. Historical occurrence resolution is immutable; future unsent occurrences are replaceable projections.
4. **DST and travel.** Normal DST gap resolves later by the gap only if still inside allowed window/quiet rules; otherwise external delivery skips without debt. Overlap chooses the earlier instant once, enforced by semantic occurrence ID. A device-zone mismatch never silently changes the schedule: the learner chooses Keep or Switch. Until resolution, any push quiet in either known zone suppresses. A booked exam’s known venue zone/time remains separate.
5. **Deterministic projection and jobs.** A bounded rolling projector combines current date/schedule/preferences, Planning reasons, reviewed templates and policy. It groups obligations, applies Stage-27 precedence, fixed caps, quiet hours, ignored suppression and channel selection before atomically writing one logical intent and pg-boss job. Any owner/policy/template/tzdb/endpoint/deletion change increments generation. The due worker revalidates generation, tombstone, cap, quiet, endpoint and expiry; stale work cancels. Retry uses the same intent/idempotency key and cannot cross useful TTL/quiet/completion/delete boundaries.
6. **Logical dedupe and primary endpoint.** A logical intent is unique by learner, grouped reason, semantic occurrence and policy generation. Caps count intent, never send attempts/endpoints. Each account has at most one explicitly selected primary push endpoint; other devices retain the identical in-app notification. Endpoint switching atomically retires the old generation. Browser topic/tag uses a non-identifying semantic hash to replace duplicates.
7. **Reviewed minimized copy.** Immutable locale-reviewed templates render allow-listed action, reason and commitment facts. No model generates or selects routine copy. Default system-notification content excludes weakness, score, Readiness, exact exam date, access need, response, transcript, raw audio and Corpus data. The authenticated in-app view carries the full current reason and controls.
8. **Transport baseline.** Launch external transport is direct standards Web Push using Push/Notifications/Service Worker APIs, RFC 8030 delivery, RFC 8291 encryption and RFC 8292 VAPID against browser-selected push services. It reuses existing application/DB/worker infrastructure. There is no FCM, OneSignal, routine email/SMS, native app or provider journey dependency. In-app-only is the permanent zero-channel fallback.
9. **Contextual permission.** Request permission only after an explicit learner “Enable reminders on this browser” action following an App explanation of purpose, frequency, privacy, primary-device behaviour, platform limitation and opt-out. Denied/dismissed/unsupported/revoked does not repeat or affect learning. iOS/iPadOS Home Screen requirements are disclosed; installability is never a core gate.
10. **No delivery fiction or engagement inference.** Provider acceptance is transport status only, never proof of display/read/understanding/completion. Click/open is not learning evidence. A routine ignore is a conservative scheduling-only signal after an accepted/surfaced routine intent has no related action before the next decision, excluding every technical ambiguity. After three qualifying consecutive ignores, suppress the next routine push and ask neutrally in-app to change/disable. No backlog, pressure escalation, learner penalty, mastery effect or Readiness effect exists.
11. **Data rights and security.** Endpoint URL/keys, VAPID key, date, schedule and delivery metadata are sensitive. Authorize per learner/guest scope; protect commands with origin/CSRF, expected version and operation ID; keep VAPID private keys server-only; encrypt/minimize endpoint material; exclude secrets and sensitive content from logs/export/payload. Revoke endpoints and tombstone jobs first on opt-out/deletion. Raw delivery detail defaults to 30 days; stripped idempotency/dedupe receipts follow the accepted 90-day retry horizon; deletion/backup truth remains Stage 20’s live purge and disclosed maximum 91-day restore-suppression window.
12. **Versioning and validation.** Independently version date, schedule, preference, occurrence, delivery, template, policy, Web Push adapter, VAPID key and tzdb releases. Mutable operating parameters have provenance, effective date, evidence, monitor and rollback. Unknown consequential majors suppress external send while preserving in-app safe state. Release tests cover date lifecycle, DST/non-hour changes, travel, tzdb updates, caps, grouping, duplicate/reordered work, endpoint switches, permission/browser/AT states, payload/security, deletion races and provider exit. There is structurally no pass probability, streak, engagement journey, learner-data-to-Corpus path or raw-audio retention.

## Consequences

### Positive

- Civil-time intent survives DST and political rule changes without UTC drift or rewritten history.
- Caps and dedupe are enforced before transport and across retry/device changes.
- Push can be disabled globally or per browser without losing any planning, urgency, due action, milestone, logistics or control.
- One primary endpoint prevents multi-device pressure; in-app state remains coherent everywhere.
- Browser/vendor/provider differences and failures cannot become learner failure or missed-day debt.
- Reviewed minimized templates preserve product tone, privacy and deterministic rollback without per-send AI cost.
- The standards adapter and App-owned domain make provider exit straightforward.
- Existing PostgreSQL/pg-boss/service-worker infrastructure is sufficient; no new paid provider/store is required.

### Negative / trade-offs

- Direct Web Push leaves browser-vendor compatibility, VAPID rotation, endpoint lifecycle and abuse operations with the maintainer.
- One primary push endpoint may require explanation for multi-device learners.
- iOS/iPadOS learners without a Home Screen web app receive only in-app behaviour.
- Server/calendar and browser preview tzdb versions can temporarily disagree; safe behaviour is external-send suppression.
- Minimized lock-screen copy may be less specific than an opted-in detailed notification.
- Conservative ignored inference suppresses rather than maximizing opens.
- Tzdb/template/policy generation and delivery ledgers add bounded relational/job state.

## Alternatives considered

1. **In-app only.** Simplest and permanent fallback. It satisfies all product behaviour but omits useful background convenience, so direct Web Push is additive and optional.
2. **Client/browser local alarms.** No universal reliable web background alarm, no server caps/account dedupe, vulnerable to clock/eviction. Rejected.
3. **Broadcast push to every account device.** Increases reach but duplicates pressure and cap ambiguity. Rejected for one explicit primary endpoint plus all-device in-app state.
4. **UTC-only recurrence or fixed offsets.** Simple jobs but drift across DST and rule changes. Rejected for local calendar + IANA zone + resolved instant.
5. **Silent follow-device zone.** Convenient during travel but can create overnight/duplicate sends and mutate multi-device truth. Rejected for explicit Keep/Switch with ambiguous-send suppression.
6. **Infinite per-learner cron / job per obligation.** Cannot safely encode versioned grouping/caps/DST and creates storms. Rejected for bounded projection and semantic intents.
7. **Firebase Cloud Messaging.** Currently no-cost and capable, but adds a Google control plane/SDK/processor without a missing launch capability. Retained as a future adapter alternative only after evidence.
8. **OneSignal.** Managed push/journeys/analytics could reduce some transport labour; current Free/Growth pricing is mutable and domain-owned caps/copy make most features unnecessary. Adds contact/subscription/engagement surface. Rejected.
9. **Routine SES email.** Existing identity transport is available but requires an account/email and exposes persistent mailbox metadata/content. Rejected for coaching reminders; security/identity mail remains separate.
10. **SMS/native app.** Greater salience but phone/native-store/provider cost and privacy surface contradict the responsive-web launch without measured need.
11. **AI-written or “optimal time” notifications.** Flexible/engagement-oriented but nondeterministic, privacy-invasive, costly and capable of violating tone/caps. Rejected for reviewed deterministic templates and learner schedule.
12. **Treat provider acceptance/click as success/evidence.** Operationally convenient but false. Rejected; transport observations are never learner truth.

## Compatibility, fallback, and exit

- Additive fields may be ignored only with defined safe defaults. Unknown date mode, cap class, reason, local-time resolution, template/policy/endpoint major fails external delivery closed. In-app shows a reviewed current generic action or upgrade status.
- Fact history remains portable PostgreSQL data. Calendar logic is behind a small IANA/Temporal-compatible port. A provider adapter receives an already-decided intent and returns normalized status only.
- Web Push can be turned off with one operational control. Jobs expire/cancel; schedules, in-app projections and learner truth continue.
- VAPID compromise/rotation disables the affected generation and may require explicit resubscription; it never silently changes channel.
- Managed-provider exit must export/delete subscription data, replace SDK/service-worker integration, prove endpoint/subscription migration or explicit resubscription and retain semantic intent IDs. No provider may take ownership of caps, targeting, copy, urgency, learner segments, evidence or Readiness.
- Cheapest fallback is in-app-only. Consider a managed adapter only after sustained measured direct-delivery/maintenance failure, current DPA/region/retention/accessibility/security/cost review and a superseding ADR.
- Native/email/SMS channels require a separate measured requirement and privacy/accessibility/data-rights review; no existing schedule automatically opts into a new channel.

## Security, privacy, accessibility, rights, and cost

Web Push payloads use RFC encryption, but browser-selected push services still see timing, frequency, size and endpoint metadata. Payloads are minimized and contain no sensitive learner details by default. Endpoint/auth keys and VAPID secrets never enter logs, URLs, analytics, learner export or readable browser state beyond the browser-owned subscription. Notification clicks use opaque short-lived intent locators and allow-listed same-origin navigation; current authorization/state is re-fetched.

Preference/endpoint actions are learner-scoped, idempotent and conflict-versioned. Opt-out/delete tombstones dominate stale enables/jobs. Export includes understandable date/schedule/preference/recent delivery state and redacted channel metadata, never endpoint/key secrets. Delete revokes live access/delivery first, purges controllable copies and discloses bounded backup/offline-device limits without a false total-immediacy claim. Corpus receives no learner data; raw audio remains ephemeral and absent.

All settings, permission explanations, zone/quiet controls, primary-device switching, statuses and recovery paths satisfy WCAG 2.2 AA, keyboard/AT/reflow/zoom and text-not-colour requirements. Every system notification has a complete in-app equivalent. No permission, installability, sound, vibration, fine gesture or notification action is required for core use.

Direct Web Push adds ordinary existing compute, PostgreSQL/pg-boss storage/work, bandwidth, test and maintainer labour but no selected notification-SaaS list fee. FCM is currently no cost; OneSignal currently lists Free USD 0 and Growth from USD 19/month plus USD 0.004/Web Push subscriber; SES Essentials is currently USD 0.16/1k recipients under Stage 20. Recheck prices/terms/browser facts/tzdb at release. Cost never justifies removing evidence truth, Writing/Oral capability, accessibility, recovery or data rights.

## Validation and review triggers

Block release on cap bypass, duplicate logical push, quiet-hour surprise, stale milestone, send after opt-out/delete/completion, sensitive payload/log leak, inaccessible in-app/permission route, notification-derived learner penalty, date-derived Readiness change, or inability to disable Web Push safely.

Validate product caps and grouping under permutations; gap/overlap/non-hour DST and tzdb change; target-month and exam-zone semantics; travel/multi-device primary switches; duplicate/drop/reorder/retry/job crash; provider TTL/permanent/transient outcomes; permission denied/revoked/unsupported/iOS Home Screen; VAPID rotation; cross-learner endpoint authorization; template/privacy scans; export/delete/restore races; and current/current-previous browser/AT coverage.

Review on: IANA/official calendar rule change; supported-browser/platform contract change; two pass-critical notification/accessibility defects in a rolling release window; sustained Stage-24 delivery/job objective miss after ordinary tuning; provider endpoint/terms/privacy change; VAPID/security incident; legal/subprocessor decision; direct-push maintainer total cost exceeding a reviewed alternative for three release windows; or measured need for a new channel. No review may silently change fixed product caps/milestones/tone, use notifications for engagement, broadcast to devices, generate AI copy, treat delivery as evidence, alter Readiness, add probability, send learner data to Corpus or retain raw audio.

## Traceability

- Stage output: `Architecture/22-notifications-scheduling-and-time-zones.md`
- Product authority: `app/28-bestehen-app-product-specification.md` §§13.2–13.3; `app/23-exam-date-and-urgency.md` §§3.1–3.8, 4.1–4.6, 5.1–7.12; `app/22-user-controls-vs-coach-autonomy.md`; Stage-27 precedence
- Design: `Design/DESIGN-HANDOFF.md` §§3–7; mobile Goal & Date; flow handoff notification issue, reconciled by later product authority
- Prior architecture: Stages 05, 08, 12, 13, 14, 20, 21; ADR-0012, ADR-0015, ADR-0019, ADR-0020, ADR-0022, ADR-0028, ADR-0029
- Technical sources rechecked 2026-08-23: W3C Push API/Notifications, RFC 8030/8291/8292, Apple Web Push, IANA tzdb 2026c, PostgreSQL 18, TC39 Temporal, Firebase/OneSignal/SES official pricing
- Downstream: Stages 23–28
