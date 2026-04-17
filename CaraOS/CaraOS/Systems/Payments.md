# System: Payments (Stripe)

## Stack
- **Stripe** v22.0.0 (server) + `@stripe/stripe-js` v9.1.0 (client)
- Stripe Connect for per-org accounts

## Payment Types

| Type | Where | Model |
|---|---|---|
| Adoption fee | Contract completion | `AdoptionContract.stripePaymentId` |
| One-off donation | Donations section | `Donation.stripePaymentId` |
| Recurring donation | Monthly/annual | `Donation.stripeSubscriptionId` |
| Campaign donation | Campaign page | `Donation.campaignId` + `stripePaymentId` |

## Stripe Connect

- Each org has `stripeAccountId` + `stripeOnboarded` on the `Organization` model
- Payments route to the org's connected account
- Managed in `/:orgSlug/settings`

## Donation Types (DonationType enum)
- ONE_OFF
- RECURRING_MONTHLY
- RECURRING_ANNUAL

## Donation Statuses (DonationStatus enum)
- PENDING → COMPLETED / FAILED / REFUNDED / CANCELLED

## Gift Aid / Tax Relief

- `Donation.giftAid` — UK Gift Aid flag
- `Donation.taxRelief` — Irish CHY tax relief flag
- `Donor.isGiftAidEligible` — donor default
- `Donor.isTaxRelief` — donor default

## Fundraising Campaigns

Model: `Campaign`
- goalAmount, currency, coverImage
- startsAt, endsAt, isActive
- Slug-based URL: `unique(slug, organizationId)`
- Dashboard: `/:orgSlug/donations/campaigns`

## Webhook

`/api/webhooks/stripe/` directory exists but **handler not yet implemented**. Payment confirmations currently manual or handled client-side.

## Environment Variables

```
STRIPE_SECRET_KEY                   — server-side
STRIPE_WEBHOOK_SECRET               — Stripe webhook signing secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  — client-side
```

## See Also
- [[Features/Applications]] — adoption fee on contract completion
- [[Features/Shelters]] — Stripe Connect org onboarding
- [[Database]] — Donation, Campaign models
