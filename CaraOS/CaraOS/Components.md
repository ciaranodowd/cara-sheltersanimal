# Components

## Layout

### `src/components/layout/sidebar.tsx`
Main navigation sidebar for the dashboard. Org-aware — uses `[orgSlug]` to build links. Renders nav items for Animals, Adoptions, People, Donations, Foster, Reports, Settings.

### `src/components/layout/mobile-nav.tsx`
Mobile-only navigation. Mirrors sidebar links.

---

## Feature Components

### `src/components/photo-upload.tsx`
Animal photo gallery manager.
- Upload photos to Supabase Storage via `/api/animals/[animalId]/photos`
- Set primary photo (isPrimary flag)
- Reorder photos (position field)
- Add captions
- Delete photos

### `src/components/microchip-lookup.tsx`
Microchip registry lookup widget. Used on the animal detail page to verify chip numbers against external registries.

### `src/components/share-animal-button.tsx`
Social share buttons for animal profiles. Generates a shareable URL for the public portal page.

---

## Page-Level `_components` (co-located)

| File | Parent Page | Purpose |
|---|---|---|
| `animals/[animalId]/_components/assign-foster-modal.tsx` | Animal detail | Quick assign-foster dialog |
| `animals/[animalId]/foster/new/_components/foster-assign-form.tsx` | Foster assign page | Full foster assignment form |
| `animals/[animalId]/medical/new/_components/medical-record-form.tsx` | Medical record page | Medical entry form |
| `adoptions/` — inline | Application detail | Status update, notes |
| `donations/new/_components/donation-form.tsx` | New donation | Donation entry form |
| `people/new/_components/person-form.tsx` | Add person | Tabbed person creation |
| `settings/_components/org-settings-form.tsx` | Settings | Org details form |
| `settings/_components/contract-template-settings.tsx` | Settings | Rich text contract editor |
| `settings/_components/gdpr-settings.tsx` | Settings | GDPR request management |
| `settings/_components/team-settings.tsx` | Settings | Invite + manage team members |
| `foster/[token]/_components/updates-panel.tsx` | Foster portal | Timeline of updates |
| `(auth)/login/LoginForm.tsx` | Login page | Credentials form |

---

## UI Primitives (`src/components/ui/`)

All built on Radix UI + Tailwind + `class-variance-authority`.

| Component | Based On |
|---|---|
| `alert-dialog.tsx` | Radix AlertDialog |
| `avatar.tsx` | Radix Avatar |
| `badge.tsx` | Custom CVA |
| `button.tsx` | Custom CVA |
| `card.tsx` | Custom |
| `checkbox.tsx` | Radix Checkbox |
| `dialog.tsx` | Radix Dialog |
| `dropdown-menu.tsx` | Radix DropdownMenu |
| `input.tsx` | Custom |
| `label.tsx` | Radix Label |
| `progress.tsx` | Radix Progress |
| `select.tsx` | Radix Select |
| `separator.tsx` | Radix Separator |
| `switch.tsx` | Radix Switch |
| `tabs.tsx` | Radix Tabs |
| `textarea.tsx` | Custom |
| `tooltip.tsx` | Radix Tooltip |

---

## Providers

`src/providers.tsx` — wraps the app in SessionProvider (NextAuth) and any other client context.

## See Also
- [[File-Map]] — component file paths
- [[Systems/Image-Handling]] — photo upload detail
