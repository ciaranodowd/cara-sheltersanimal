# System: PDF Generation

## Stack
- **Library**: pdf-lib v1.17.1
- **Config**: `src/lib/pdf.ts`
- **Storage**: Supabase Storage (signed PDFs stored there)
- **Path field**: `AdoptionContract.signedPdfPath`

## What Gets Generated

Signed adoption contracts — A4 format with:
- Org header (name, address, charity number)
- Animal details
- Adopter details
- Contract body (from org's `contractTemplate`)
- Signature block: typed name + date + IP
- eIDAS Regulation compliance footer

## Generation Trigger

`POST /api/sign/[token]` — called when adopter submits their e-signature.  
1. Fetches `AdoptionContract` by `signingToken`
2. Fills PDF template with contract data
3. Stores PDF in Supabase Storage
4. Updates `AdoptionContract.signedPdfPath`
5. Triggers `sendSignedContractEmails()` with PDF attached

## Email Delivery

Signed PDF attached to two emails:
- Adopter confirmation email
- Org copy email

See [[Systems/Notifications]].

## eIDAS

The typed name e-signature is compliant with eIDAS Regulation (EU) No 910/2014 for simple electronic signatures. IP address and timestamp are stored alongside the signature data.

## See Also
- [[Features/Applications]] — contract signing workflow
- [[Systems/Notifications]] — emails with PDF attachment
- [[Database]] — AdoptionContract model fields
