# Stage 05 seed provenance

This directory contains original German practice material written for Bestehen. No published exam
text, transcript, answer option, recording, image, or other restricted source expression was copied
or adapted. The learner-facing credit is "Bestehen practice material". It does not imply an
endorsement by an exam provider.

## Release inventory

`release.json` is generated from `index.ts` and consumed as data by the infrastructure seed CLI.
The typed source contains two fresh-equivalent families for each task definition:

- R1: five notices and seven headings per family
- R2: one text, five questions, and three options per question
- R3: ten situations, twelve notices, and one explicit no-match response per family
- SB1: one connected letter, six gaps, and three local options per gap
- SB2: one connected text, six gaps, and a ten-candidate shared bank with no reuse
- H1: five short scripts per family, with one allowed play per text at the P4-shaped target
- H2: one connected dialogue and five questions per family, with two allowed plays
- H3: five short functional scripts per family, with two allowed plays per text

The release also contains one ambiguous SB1 fixture whose blind-validation result disagrees with
the proposed key. It exists only to prove quarantine. A second App-original SB1 fixture has a
withdrawn rights envelope and exists only to prove future-serving withdrawal. Neither fixture is a
serving candidate.

Every artifact is class C3. Its rights envelope records App-original authorship, action-level
permission, the offline-copy purge condition, accessibility metadata, and this statement:
"No restricted source expression was consulted and no published exam text is reproduced."

## Fake listening audio

Listening scripts are paired with deterministic PCM WAV manifests. The renderer creates a short
integer waveform from the script digest. The bytes are stable, but they are not speech and they are
not suitable for learner delivery. T5 owns the final media model, adapters, playback routes, and
media tests. The fake manifests here pin scripts and fixture bytes without taking over that work.

## Owner gates not claimed

- `OWNER-05-A` remains unclaimed. No live synthesis, German voice audition, or human audit of final
  speech bytes happened.
- `OWNER-05-B` remains unclaimed. No complete P4 form or final media set received P4 sign-off.
- `OWNER-05-C` remains unclaimed. No independent person solved every key blind to the proposed
  answers. The deterministic structural re-derivation in `builders.ts` is not a substitute for that
  review. Its validator reference is `system:deterministic-key-derivation`, never an owner or human
  validator reference.

The serving seeds therefore request Training approval only. No artifact in this directory claims
Independent-B1, Readiness/P4, or Gold approval.
