# Database

**Engine**: PostgreSQL (Supabase)  
**ORM**: Prisma 5.22  
**Schema file**: `prisma/schema.prisma`  
**Migrations**: `prisma/migrations/`

Connection: `DATABASE_URL` (pooler) + `DIRECT_URL` (direct, for migrations)

---

## Models

### Auth (NextAuth)

**Account** — OAuth provider links  
**Session** — JWT sessions  
**VerificationToken** — email verification

---

### Organization
Central multi-tenancy unit. Every other model links back here.

| Field | Type | Notes |
|---|---|---|
| id | String | CUID |
| name | String | |
| slug | String | unique, used in URLs |
| logo | String? | URL |
| email, phone | String? | |
| address, city, county, country, postcode | String? | |
| website | String? | |
| chyNumber | String? | Irish Gift Aid |
| charityNumber | String? | UK charity |
| registrationNum | String? | |
| stripeAccountId | String? | |
| stripeOnboarded | Boolean | default false |
| contractTemplate | String? | HTML template |
| vetName, vetPhone | String? | default vet |
| coordinatorPhone | String? | |

---

### User

| Field | Notes |
|---|---|
| id, name, email | |
| password | bcrypt hash (credentials login) |
| emailVerified | NextAuth |
| image | avatar URL |
| organizations | via UserOrganization join |

### UserOrganization (join)
Links User ↔ Organization with a role.

| Field | Notes |
|---|---|
| role | `OrgRole` enum |
| unique | userId + organizationId |

---

### Animal

| Field | Notes |
|---|---|
| id, organizationId, name | |
| species | `Species` enum |
| breed, mixedBreed | |
| ageYears, ageMonths, ageEstimated | |
| sex | `Sex` enum |
| size | `Size` enum |
| colour, markings | |
| microchipNumber, microchipDate, microchipLocation | |
| status | `AnimalStatus` enum |
| intakeDate, intakeReason, intakeNotes, intakeType, intakeLocation | |
| locationId | → Location |
| isNeutered, neuteredDate | |
| isVaccinated | |
| dobApprox, weightKg | |
| description, notes | |
| publicProfile | Boolean — show on portal |
| publicBio | String? — portal bio |

### AnimalPhoto
| Field | Notes |
|---|---|
| url | Supabase public URL |
| key | Supabase storage path |
| isPrimary | Boolean |
| position | Int — ordering |
| caption | String? |

### Location
Kennel/cattery/room within a shelter.

| Field | Notes |
|---|---|
| type | `LocationType` enum |
| capacity | Int? |

### MedicalRecord
| Field | Notes |
|---|---|
| type | `MedicalRecordType` enum |
| date, description, vetName, vetClinic | |
| cost, currency | |
| nextDueDate | for recurring treatments |

### WeightLog
Simple weight history with date + notes.

---

### People

**Adopter** — people who apply to adopt  
**Foster** — approved foster carers  
**Volunteer** — general volunteers + home checkers  
**Donor** — donation givers  

All four have: firstName, lastName, email, phone, address fields, gdprConsent fields, and `unique(email, organizationId)`.

**Foster extra fields**:
- approved, approvedAt
- maxAnimals, hasGarden, hasChildren, hasOtherPets
- homeType, speciesPreferences (JSON)
- availableFrom, availableTo

**Volunteer extra fields**:
- skills (JSON), isHomeChecker, isDriver, available, hoursLogged

**Donor extra fields**:
- isGiftAidEligible (UK), isTaxRelief (Irish CHY)

---

### FosterAssignment
Links Animal ↔ Foster for a time period.

| Field | Notes |
|---|---|
| startDate, endDate | |
| status | ACTIVE \| ENDED |
| fosterPortalToken | unique token for `/foster/[token]` |
| diaryEntries | → FosterDiaryEntry |
| fosterUpdates | → FosterUpdate |

### FosterDiaryEntry
Posted by foster carer. Has content + photos (JSON array of URLs).

### FosterUpdate
Can be authored by FOSTER or SHELTER. Used for communication timeline.

---

### AdoptionApplication
Full adoption application from an adopter for a specific animal.

**Key fields**: householdType, hasGarden, gardenFenced, hasChildren, childrenAges, hasOtherPets, experienceLevel, whyAdopt, workingHours, rentOrOwn, landlordPermission  
**Status flow**: → [[Features/Applications]]  
**assignedToId** → User (staff)  
**homeCheckerId** → User (volunteer)

### AdoptionContract
Generated once an application is approved.

| Field | Notes |
|---|---|
| contractText | filled template HTML |
| signingToken | UUID used in `/sign/[token]` |
| signedAt, signatureData | typed name e-signature |
| signerIp | eIDAS compliance |
| signedPdfPath | Supabase Storage path |
| adoptionFee, currency | |
| stripePaymentId | |
| completedAt | final adoption date |

---

### Donation
| Field | Notes |
|---|---|
| type | `DonationType` enum |
| status | `DonationStatus` enum |
| stripePaymentId, stripeSubscriptionId | |
| campaignId | optional → Campaign |
| giftAid, taxRelief | booleans |

### Campaign
Fundraising campaign with goal amount, cover image, start/end dates.

---

### EmailTemplate
Per-org custom email templates. One row per `EmailType` per org.

### GdprRequest
GDPR data subject request tracking (access, erasure, etc.)

### ActivityLog
Audit trail. Every significant action logs: action name, entityType, entityId, metadata JSON.

### Invite
Team invite with expiring token. `unique(email, organizationId)`.

---

## Enums

| Enum | Values |
|---|---|
| OrgRole | ADMIN, STAFF, VOLUNTEER, FOSTER |
| Species | DOG, CAT, RABBIT, BIRD, SMALL_ANIMAL, FARM, REPTILE, OTHER |
| Sex | MALE, FEMALE, UNKNOWN |
| Size | TINY, SMALL, MEDIUM, LARGE, XLARGE |
| AnimalStatus | INTAKE, ASSESSMENT, AVAILABLE, FOSTERED, IN_FOSTER, ADOPTION_PENDING, ADOPTED, TRANSFERRED, DECEASED, ON_HOLD, MEDICAL_HOLD, QUARANTINE |
| IntakeReason | STRAY, SURRENDER, TRANSFER, SEIZED, BORN_IN_CARE, OTHER |
| LocationType | KENNEL, CATTERY, ISOLATION, FOSTER_HOME, MEDICAL, OTHER |
| MedicalRecordType | VACCINATION, NEUTERING, VET_VISIT, MEDICATION, SURGERY, DENTAL, PARASITE_TREATMENT, WEIGHT_CHECK, BLOOD_TEST, OTHER |
| ApplicationStatus | PENDING, REVIEWING, UNDER_REVIEW, HOME_CHECK, HOME_CHECK_SCHEDULED, HOME_CHECK_DONE, APPROVED, CONTRACT_SENT, REJECTED, WITHDRAWN, COMPLETED |
| DonationType | ONE_OFF, RECURRING_MONTHLY, RECURRING_ANNUAL |
| DonationStatus | PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED |
| EmailType | APPLICATION_RECEIVED, APPLICATION_APPROVED, APPLICATION_REJECTED, HOME_CHECK_SCHEDULED, ADOPTION_CONTRACT, ADOPTION_COMPLETE, FOSTER_WELCOME, FOSTER_CHECK_IN, DONATION_RECEIPT, CAMPAIGN_UPDATE, WELCOME |
| GdprRequestType | ACCESS, ERASURE, RECTIFICATION, PORTABILITY |
| GdprStatus | PENDING, IN_PROGRESS, COMPLETED, REJECTED |

## See Also
- [[Features/Animals]] — Animal model usage
- [[Features/Applications]] — AdoptionApplication workflow
- [[Systems/Auth]] — User/Account/Session models
