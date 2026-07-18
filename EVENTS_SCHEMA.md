# EMMA Events — Firestore Schema (Phase 1)

Source of truth for field-level detail: `SPEC_EVENTS_v1.2` (approved 2026-07-18,
kept on Drive AI, not in this repo). This file documents the collections needed
to build Phase 1 (choice page + `emma_events.html` skeleton + code login). Later
phases will extend this file as the back office and judge flows are built.

Scoring reference: EMMA SQ Judgebook 2026 (`Rulebooks/EMMA-SQ-Judgebook26.pdf`).
V1 scoring covers Position + Focus + Sound Stage only (max 105 points).

---

## `judges/{code}`

Doc id **is** the access code (e.g. `MARIO-4821`, `ADMIN-0001`). Auth model is
"possession of the code = identity": Firebase Anonymous Auth is used only to
get a session; the real gate is Firestore rules on this collection (`get`
allowed to any authenticated user, `list` denied so codes can't be enumerated).

| Field | Type | Notes |
|---|---|---|
| `role` | string | `"admin"` \| `"judge"` |
| `name` | string | Display name shown in the UI |
| `revoked` | boolean | Optional. `true` → code treated as invalid |
| `qualification` | string | Optional, judge only. Not used by Phase 1 code |
| `country` | string | Optional, judge only. Not used by Phase 1 code |

Phase 1 needs exactly two manually-created test docs (see coder prompt
prerequisites): `judges/ADMIN-0001` and `judges/JUDGE-0001`.

---

## `events/{eventId}`

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `dates` | array\<timestamp\> | Event can span multiple days |
| `location` | string | |
| `eventType` | string | |
| `organizer` | string | |
| `notes` | string | Optional |
| `status` | string | `"draft"` → `"setup"` → `"in_progress"` → `"closed"` |
| `activeCategories` | array\<string\> | From the EMMA 2026 category catalog |
| `judgeAssignments` | array\<map\> | `{ judgeId, categories: [...] }`. Modeled as an embedded array for now — no separate collection requested for Phase 1; revisit in Phase 2 if it needs its own subcollection |

Registrations and evaluations for an event live in the subcollections below,
not embedded on this doc (they're per-competitor / per-judge and can grow
large).

---

## `events/{eventId}/registrations/{raceNumber}`

Doc id **is** the race number (manually entered by the back office). This
gives race-number uniqueness "by design" — no separate uniqueness check
needed, a duplicate number is a doc-id collision.

| Field | Type | Notes |
|---|---|---|
| `competitorId` | string | References `competitors/{id}` |
| `vehicleId` | string | References the vehicle entry inside that competitor doc |
| `category` | string | e.g. `"SQ M"` |
| `class` | string | e.g. `"Up to 8000€"` |
| `status` | string | `"registered"` \| `"judged"` \| `"withdrawn"` |

---

## `competitors/{id}`

Reusable across events.

| Field | Type | Notes |
|---|---|---|
| `firstName` | string | |
| `lastName` | string | |
| `contacts` | map | e.g. `{ email, phone }` |
| `country` | string | |
| `team` | string | Optional (team/club) |
| `vehicles` | array\<map\> | `{ id, make, model, color, plate, notes }` |

---

## `events/{eventId}/evaluations/{judgeId_raceNumber}`

One evaluation per judge × registration — each judge's sheet stays separate;
the back office computes the average across submitted sheets client-side (no
Cloud Function). Doc id combines judge and race number so a judge can only
ever have one sheet per car.

| Field | Type | Notes |
|---|---|---|
| `eventId` | string | Redundant copy for query convenience |
| `registrationId` | string | Race number of the car being judged |
| `judgeId` | string | Judge's access code |
| `position` | map | `{ L, LC, C, RC, R }`, 5 rulebook instruments → total **0–25** |
| `focus` | map | `{ L, LC, C, RC, R }`, 5 rulebook instruments → total **0–25** |
| `soundStage` | map | `{ distance: 0–15, width: 0–15, height: 0–15, roomInfo: 1–5 }` |
| `notes` | string | Judge's free-text notes |
| `timestamp` | timestamp | Last write time |
| `status` | string | `"draft"` (in progress, editable) \| `"submitted"` (final, immutable — enforced both client-side and by rules) |

The 5 scored instruments are the rulebook's Electronic Bass, Electronic
Guitar, Banjo, Vibraphone, Triangle — **decoupled** from the Academy's visual
JSON data, which carries 7 entities (incl. Voice and 2 guitars). Do not reuse
the Academy's instrument list for evaluation logic.

---

## Not in Phase 1

`Media` (per-registration average) is a **computed view**, not a stored
document — built client-side in the back office from submitted evaluations.
No collection for it.
