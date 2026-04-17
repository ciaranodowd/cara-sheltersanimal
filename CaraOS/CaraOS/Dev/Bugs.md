# Dev: Bugs & Known Issues

## Active Issues

> Add bugs here as they're discovered. Format: title, symptoms, suspected cause, status.

---

## Template

```
### Bug Title
- **Symptoms**: what the user sees
- **Affected**: route or component
- **Suspected cause**: 
- **Status**: open / in progress / fixed
- **Notes**:
```

---

## Infrastructure Notes

### Stripe Webhook Handler Missing
- `src/app/api/webhooks/stripe/` directory exists but no `route.ts`
- Payment status updates must be handled client-side or manually for now
- **Status**: open

### SQLite Dev DB in Repo
- `prisma/dev.db` is checked in — used for local dev
- Should not affect production (PostgreSQL on Supabase)

---

## See Also
- [[Dev/Decisions]] — rationale behind architectural choices
- [[Architecture]] — system overview
