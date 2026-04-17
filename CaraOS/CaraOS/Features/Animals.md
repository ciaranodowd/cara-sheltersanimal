# Feature: Animals

## Overview
Animals are the core entity. Each belongs to an `Organization`. Staff manage them through the dashboard; the public can view them via the portal.

## Dashboard Pages

| Page | Path |
|---|---|
| List | `/:orgSlug/animals` |
| New | `/:orgSlug/animals/new` |
| Detail | `/:orgSlug/animals/:id` |
| Edit | `/:orgSlug/animals/:id/edit` |
| Assign Foster | `/:orgSlug/animals/:id/foster/new` |
| Add Medical Record | `/:orgSlug/animals/:id/medical/new` |

## Public Portal Pages

| Page | Path |
|---|---|
| Animals listing | `/portal/:orgSlug` |
| Animal profile | `/portal/:orgSlug/animals/:id` |

Animal appears on portal only when `publicProfile = true`.

## Animal Lifecycle (Status Flow)

```
INTAKE → ASSESSMENT → AVAILABLE
                    → IN_FOSTER / FOSTERED
                    → ON_HOLD / MEDICAL_HOLD / QUARANTINE
                    → ADOPTION_PENDING → ADOPTED
                    → TRANSFERRED
                    → DECEASED
```

Status labels and colors in `src/lib/constants.ts` (`STATUS_LABELS`, `STATUS_COLORS`).

## Key Fields

- **Species**: DOG, CAT, RABBIT, BIRD, SMALL_ANIMAL, FARM, REPTILE, OTHER
- **Age**: `ageYears` + `ageMonths`, `ageEstimated` flag, `dobApprox`
- **Microchip**: number, date chipped, body location
- **Medical**: linked `MedicalRecord[]` — vaccination, neutering, vet visits, etc.
- **Weight**: `WeightLog[]` for trend tracking
- **Photos**: `AnimalPhoto[]` — primary flag, position ordering, captions
- **Location**: optional `Location` (kennel/room within shelter)

## Photos

Upload via `src/components/photo-upload.tsx` → POST `/api/animals/[animalId]/photos` → stored in Supabase `animal-photos` bucket.  
See [[Systems/Image-Handling]].

## Foster Assignment

Creating a FosterAssignment generates a `fosterPortalToken`. Foster receives email with link to `/foster/[token]`.  
See [[Features/Shelters]] for foster management.

## Intake Types & Reasons

`intakeType` field + `IntakeReason` enum: STRAY, SURRENDER, TRANSFER, SEIZED, BORN_IN_CARE, OTHER.

## Sharing

`src/components/share-animal-button.tsx` — generates shareable portal URL for social sharing.

## API Endpoints

- CRUD: `GET/POST/PATCH/DELETE /api/animals` and `/api/animals/[animalId]`
- Photos: `POST/DELETE /api/animals/[animalId]/photos/[photoId]`
- Medical: `POST /api/animals/[animalId]/medical`
- Foster: `POST /api/animals/[animalId]/foster`

## See Also
- [[Database]] — Animal, AnimalPhoto, MedicalRecord, WeightLog, Location models
- [[Features/Applications]] — adoption applications for animals
- [[Systems/Image-Handling]] — photo storage
