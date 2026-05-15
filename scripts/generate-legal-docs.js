// @ts-check
/* eslint-disable */
const {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType,
} = require("docx")
const fs = require("fs")
const path = require("path")

const GREEN  = "1a3a2a"
const BLACK  = "1a1a1a"
const FONT   = "Arial"
const DATE   = "7 May 2025"

// ─── helpers ────────────────────────────────────────────────────────────────

function brand() {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "CARA SHELTERS", font: FONT, bold: true, size: 28, color: GREEN }),
      new TextRun({ text: "  ·  carashelters.ie", font: FONT, size: 20, color: "888888" }),
    ],
  })
}

function divider() {
  return new Paragraph({
    spacing: { before: 60, after: 200 },
    border: { bottom: { color: GREEN, size: 6, style: BorderStyle.SINGLE } },
    children: [],
  })
}

function h1(text) {
  return new Paragraph({
    spacing: { before: 0, after: 120 },
    children: [ new TextRun({ text, font: FONT, bold: true, size: 40, color: GREEN }) ],
  })
}

function h2(text) {
  return new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [ new TextRun({ text, font: FONT, bold: true, size: 24, color: GREEN }) ],
  })
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [ new TextRun({ text, font: FONT, bold: true, size: 20, color: BLACK }) ],
  })
}

function p(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [ new TextRun({ text, font: FONT, size: 20, color: BLACK }) ],
  })
}

function meta(label, value) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, font: FONT, bold: true, size: 18, color: "555555" }),
      new TextRun({ text: value,         font: FONT,              size: 18, color: "555555" }),
    ],
  })
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80 },
    children: [ new TextRun({ text, font: FONT, size: 20, color: BLACK }) ],
  })
}

function numbered(text, num) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${num}.  `, font: FONT, bold: true, size: 20, color: GREEN }),
      new TextRun({ text,              font: FONT,              size: 20, color: BLACK }),
    ],
  })
}

function infoBox(lines) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: "e8f0eb" },
            borders: {
              top:    { style: BorderStyle.SINGLE, size: 4, color: GREEN },
              bottom: { style: BorderStyle.NONE },
              left:   { style: BorderStyle.NONE },
              right:  { style: BorderStyle.NONE },
            },
            children: lines.map(l => new Paragraph({
              spacing: { after: 60 },
              children: [ new TextRun({ text: l, font: FONT, size: 18, color: BLACK }) ],
            })),
          }),
        ],
      }),
    ],
  })
}

function greenTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h =>
          new TableCell({
            shading: { type: ShadingType.SOLID, color: GREEN },
            children: [ new Paragraph({ children: [ new TextRun({ text: h, font: FONT, bold: true, size: 18, color: "FFFFFF" }) ] }) ],
          })
        ),
      }),
      ...rows.map(cells =>
        new TableRow({
          children: cells.map(c =>
            new TableCell({
              children: [ new Paragraph({ children: [ new TextRun({ text: c, font: FONT, size: 18, color: BLACK }) ] }) ],
            })
          ),
        })
      ),
    ],
  })
}

// ─── DOCUMENT 1: Privacy Policy ─────────────────────────────────────────────

function buildPrivacyPolicy() {
  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 20, color: BLACK } } } },
    sections: [{
      children: [
        brand(), divider(),
        h1(`Privacy Policy`),
        meta(`Effective date`, DATE),
        meta(`Version`, `1.0`),
        meta(`Document owner`, `Cara Shelters — privacy@carashelters.ie`),
        p(``),

        h2(`1. Who We Are`),
        p(`Cara Shelters ("Cara", "we", "us", "our") operates the shelter management SaaS platform available at carashelters.ie. Cara Shelters is incorporated and operates in the Republic of Ireland.`),
        p(`For the purposes of the General Data Protection Regulation (EU) 2016/679 ("GDPR"), Cara Shelters is the data controller for:`),
        bullet(`Personal data of shelter staff and administrators who hold accounts on the platform.`),
        bullet(`Visitor data collected via the carashelters.ie marketing website.`),
        p(`Animal shelters that use the Cara platform ("Shelters") are independent data controllers of the adopter, donor, and volunteer data they collect through their own public portals. Cara acts as a data processor for that data. See Section 9 for details.`),

        h2(`2. Data We Collect`),

        h3(`2.1  Shelter Staff Accounts`),
        bullet(`Full name and email address.`),
        bullet(`Password (stored as a bcrypt hash; never stored in plain text).`),
        bullet(`Organisation membership, role (Admin / Staff / Volunteer / Foster), and join date.`),
        bullet(`Activity log entries recording actions taken within the platform (e.g. application status changes, contract sending).`),

        h3(`2.2  Adopter & Donor Data (Processed on Behalf of Shelters)`),
        p(`When members of the public submit adoption or fostering applications through a shelter's public portal, the following data is collected and stored on behalf of the shelter:`),
        bullet(`Full name, email address, phone number, home address, and county.`),
        bullet(`Household details (type, garden, children, other pets).`),
        bullet(`Previous pet experience and reason for adopting or fostering.`),
        bullet(`GDPR consent records, including timestamp and IP address at time of consent.`),
        bullet(`E-signature data (typed name) and IP address at time of contract signing.`),
        p(`Donor data collected through donation flows includes name, email, donation amount, frequency, and Stripe payment reference.`),

        h3(`2.3  Website Visitor Data`),
        bullet(`IP address and browser user agent (collected automatically by our hosting infrastructure).`),
        bullet(`Pages visited and time on site (collected via session cookies only — see Section 8).`),

        h2(`3. Lawful Basis for Processing`),
        greenTable(
          [`Processing activity`, `Lawful basis (GDPR Article 6)`],
          [
            [`Shelter staff account management`,                     `Article 6(1)(b) — performance of contract`],
            [`Billing and subscription management`,                  `Article 6(1)(b) — performance of contract`],
            [`Platform security and fraud prevention`,               `Article 6(1)(f) — legitimate interests`],
            [`Adopter application data (processed for shelters)`,    `Article 6(1)(a) — consent (obtained by shelter)`],
            [`Donor payment records`,                                `Article 6(1)(c) — legal obligation (financial records)`],
            [`Marketing emails to shelter administrators`,           `Article 6(1)(a) — consent`],
          ]
        ),

        h2(`4. Data Processors We Use`),
        p(`We engage the following sub-processors to operate the platform. All are subject to appropriate data processing agreements:`),

        h3(`Supabase (Supabase Inc.)`),
        bullet(`Purpose: PostgreSQL database hosting and file storage.`),
        bullet(`Location: European Union (eu-west-1 region, Ireland/Europe).`),
        bullet(`Data transferred: all platform data including adopter records, contracts, and photos.`),
        bullet(`Supabase DPA: available at supabase.com/privacy`),

        h3(`Stripe (Stripe Payments Europe, Limited)`),
        bullet(`Purpose: Payment processing for subscriptions, donation checkouts, and adoption fees.`),
        bullet(`Location: European Economic Area (regulated entity incorporated in Ireland).`),
        bullet(`Data transferred: donor name, email, payment card data (handled directly by Stripe; Cara never sees raw card data).`),
        bullet(`Stripe DPA: available at stripe.com/ie/legal/dpa`),

        h3(`Vercel (Vercel Inc.)`),
        bullet(`Purpose: Application hosting and serverless function execution.`),
        bullet(`Location: Global CDN; server-side processing in EU regions where possible.`),
        bullet(`Data transferred: HTTP request logs including IP addresses (retained 30 days).`),
        bullet(`Vercel DPA: available at vercel.com/legal/dpa`),

        h2(`5. Retention Periods`),
        bullet(`Shelter staff account data: retained for the duration of the shelter's active subscription, plus 12 months after cancellation to allow for reactivation or dispute resolution.`),
        bullet(`Adopter and donor data (processed on behalf of shelters): subject to each shelter's own retention policy. Cara will delete or return all such data within 30 days of subscription termination on request.`),
        bullet(`Financial and billing records (invoices, payment history): retained for 7 years in accordance with Irish Revenue Commissioners requirements under the Taxes Consolidation Act 1997.`),
        bullet(`Activity logs: retained for 24 months, then permanently deleted.`),
        bullet(`Website visitor logs: retained for 30 days (Vercel infrastructure default).`),

        h2(`6. Your Data Subject Rights`),
        p(`Under GDPR Articles 15-22, you have the following rights regarding personal data we hold about you as a platform user (shelter staff):`),
        bullet(`Right of access (Article 15): You may request a copy of the personal data we hold about you. Use the 'Download my data' function in your account settings, or email privacy@carashelters.ie.`),
        bullet(`Right to erasure (Article 17): You may request deletion of your account. Use the 'Delete account' function in your account settings. Note: financial records required by law cannot be erased.`),
        bullet(`Right to rectification (Article 16): You may correct inaccurate personal data via your account settings or by contacting us.`),
        bullet(`Right to data portability (Article 20): You may download your data in JSON format from your account settings.`),
        bullet(`Right to object (Article 21): You may object to processing based on legitimate interests by contacting privacy@carashelters.ie.`),
        p(`For rights requests relating to adopter or donor data collected through a shelter's portal, please contact the relevant shelter directly — they are the data controller for that data.`),

        h2(`7. Important Distinction: Controller vs. Processor`),
        infoBox([
          `Cara Shelters is the DATA CONTROLLER for: shelter staff account data, platform usage logs, and billing data.`,
          ``,
          `Cara Shelters is the DATA PROCESSOR for: adopter applications, donor records, volunteer data,`,
          `adoption contracts, and all other data that shelters collect through their public-facing portals.`,
          ``,
          `Each shelter is an independent DATA CONTROLLER for the data their adopters and donors submit.`,
          `The Cara-Shelter Data Processing Agreement (DPA) governs this relationship.`,
        ]),

        h2(`8. Cookie Policy`),
        p(`Carashelters.ie uses the following cookies:`),
        bullet(`Session cookies (strictly necessary): Used to maintain your login session after authentication. These are deleted when you close your browser.`),
        bullet(`CSRF token cookie (strictly necessary): Protects form submissions against cross-site request forgery attacks.`),
        p(`We do not use advertising cookies, tracking pixels, or any third-party analytics cookies. No personal data is shared with advertising networks.`),
        p(`You may decline non-essential cookies via the cookie banner displayed on your first visit. Declining cookies will not affect your ability to use the platform.`),

        h2(`9. International Transfers`),
        p(`All data is stored on Supabase infrastructure located within the European Union. Vercel may process request logs on servers outside the EU/EEA; this is covered by Vercel's Standard Contractual Clauses (SCCs) as adopted by the European Commission.`),

        h2(`10. Contact & Complaints`),
        p(`For any data protection queries or to exercise your rights:`),
        bullet(`Email: privacy@carashelters.ie`),
        bullet(`Website: carashelters.ie/privacy`),
        p(`If you are not satisfied with our response, you have the right to lodge a complaint with the Irish Data Protection Commission:`),
        bullet(`Website: dataprotection.ie`),
        bullet(`Phone: +353 (0)57 868 4800`),
        bullet(`Address: 21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland`),

        h2(`11. Changes to This Policy`),
        p(`We may update this Privacy Policy from time to time. We will notify shelter administrators by email of any material changes at least 30 days before they take effect. Continued use of the platform after the effective date constitutes acceptance of the revised policy.`),
      ],
    }],
  })
}

// ─── DOCUMENT 2: Terms of Service ───────────────────────────────────────────

function buildTermsOfService() {
  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 20, color: BLACK } } } },
    sections: [{
      children: [
        brand(), divider(),
        h1(`Terms of Service`),
        meta(`Effective date`, DATE),
        meta(`Version`, `1.0`),
        meta(`Document owner`, `Cara Shelters — hello@carashelters.ie`),
        p(``),
        p(`Please read these Terms of Service ("Terms") carefully before using the Cara Shelters platform. By registering an account or using the platform, you agree to be bound by these Terms on behalf of your organisation.`),

        h2(`1. What Cara Provides`),
        p(`Cara Shelters ("Cara", "we", "us", "our") provides a software-as-a-service (SaaS) platform for animal rescue and rehoming organisations ("Shelters", "you", "your"). Cara Shelters is registered in Ireland. The platform includes:`),
        bullet(`Animal intake, profile management, and public adoption portal.`),
        bullet(`Adoption and fostering application management and workflow.`),
        bullet(`Digital adoption contract generation and e-signature collection.`),
        bullet(`Donor management and Stripe-powered donation processing.`),
        bullet(`Volunteer and team management.`),
        bullet(`GDPR compliance tools including data export and deletion.`),
        p(`The platform is provided via carashelters.ie and any associated subdomains or APIs.`),

        h2(`2. Subscription Terms`),

        h3(`2.1  Plans and Pricing`),
        p(`Cara offers a free trial period of 14 days, after which a paid subscription is required to continue using the platform. Current pricing is:`),
        bullet(`Pro Plan: €35 per month per shelter organisation, billed monthly.`),
        p(`Pricing is subject to change. We will give you at least 60 days' notice of any price increase. Any price increase will take effect from the start of your next billing period after the 60-day notice period expires, not mid-cycle.`),

        h3(`2.2  Payment`),
        p(`Subscriptions are billed monthly via Stripe. By providing payment details, you authorise Cara to charge the applicable subscription fee on a recurring monthly basis. All prices are exclusive of VAT. Where VAT is legally required (including under Irish or EU law), it will be charged at the applicable rate. Invoices will show any applicable VAT amounts separately.`),

        h3(`2.3  Cancellation`),
        p(`You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. Cara does not issue refunds for the current billing period on cancellation. However, Cara may, at its discretion, issue refunds or service credits where required by applicable law or where a material platform failure has occurred.`),

        h3(`2.4  Free Trial`),
        p(`During the free trial period you have access to full platform functionality. No payment is required during the trial. At the end of the trial, you must subscribe to continue using the platform. Trial accounts that are not converted to paid subscriptions may have their data retained for 30 days before deletion.`),

        h2(`3. Acceptable Use`),
        p(`You agree to use the platform solely for legitimate animal rescue and rehoming purposes. You must not:`),
        bullet(`Use the platform for any commercial pet selling or breeding operation.`),
        bullet(`Submit false or misleading information about animals, adopters, or your organisation.`),
        bullet(`Attempt to access or interfere with another organisation's data.`),
        bullet(`Use the platform in any way that violates applicable law, including GDPR and animal welfare legislation.`),
        bullet(`Attempt to reverse engineer, decompile, or extract the source code of the platform.`),
        bullet(`Resell, sublicense, or provide access to the platform to third parties.`),
        p(`Cara reserves the right to suspend or terminate accounts that violate these provisions without notice.`),

        h2(`4. Shelter Responsibilities`),

        h3(`4.1  GDPR Compliance`),
        p(`You are the data controller for all adopter, donor, volunteer, and foster data you collect through your public portal. You are responsible for:`),
        bullet(`Obtaining valid GDPR consent from adopters and donors before collecting their personal data.`),
        bullet(`Publishing and maintaining your own Privacy Policy accessible to portal visitors.`),
        bullet(`Responding to data subject rights requests (access, erasure, rectification, portability) within statutory timeframes.`),
        bullet(`Ensuring your use of the platform complies with GDPR and any applicable national data protection law.`),
        p(`The Cara-Shelter Data Processing Agreement ("DPA") governs the processing of personal data Cara carries out on your behalf. The DPA is available at carashelters.ie/dpa. By accepting these Terms, you also accept the DPA.`),
        p(`Cara acts as a data processor for adopter, donor, volunteer, foster, and animal-related personal data that shelters control. As processor, Cara will: (a) process such personal data only on documented instructions from the shelter; (b) implement appropriate technical and organisational security measures; (c) assist the shelter with data subject rights requests (Articles 15–22 GDPR) where reasonably possible; and (d) ensure all personnel with access to shelter personal data are bound by confidentiality obligations.`),
        p(`Cara uses trusted sub-processors to deliver the platform, including Stripe Payments Europe, Limited (Ireland) for payment processing. Cara will maintain a list of material sub-processors and will give reasonable advance notice of any material changes to sub-processors where required by GDPR.`),
        p(`In the event of a personal data breach affecting a shelter's data, Cara will notify the affected shelter without undue delay after becoming aware of the breach and, where feasible, within 72 hours.`),

        h3(`4.2  Account Security`),
        p(`You are responsible for maintaining the security and confidentiality of your account credentials. You must promptly notify Cara if you suspect unauthorised access to your account at hello@carashelters.ie.`),

        h3(`4.3  Accuracy of Information`),
        p(`You are responsible for the accuracy and legality of all data you enter into the platform, including animal profiles, adopter records, and contract content.`),

        h2(`5. Intellectual Property`),
        p(`Cara Shelters retains all intellectual property rights in the platform, including software, design, documentation, and branding. These Terms do not grant you any rights to the Cara Shelters name, logo, or platform code.`),
        p(`You retain ownership of all data you enter into the platform ("Your Data"), including animal records, adopter applications, and donor information. Cara claims no ownership over Your Data and processes it solely to provide the platform services.`),

        h2(`6. Liability Limitations`),
        p(`The platform is provided on an "as is" and "as available" basis. To the maximum extent permitted by Irish law:`),
        bullet(`Cara makes no warranties, express or implied, regarding the fitness of the platform for any particular purpose.`),
        bullet(`Cara is not liable for any loss, damage, or corruption of data entered into the platform by you or your team.`),
        bullet(`Cara's total aggregate liability to you for any claim arising under or in connection with these Terms shall not exceed the total subscription fees paid by you in the 12 months preceding the claim.`),
        bullet(`Cara is not liable for indirect, consequential, or special losses, including loss of revenue, loss of data, or reputational damage.`),
        p(`Nothing in these Terms excludes liability that cannot be excluded under Irish law, including liability for death or personal injury caused by negligence or fraud.`),

        h2(`7. Termination`),
        p(`Either party may terminate the subscription with 30 days' written notice.`),
        p(`"Written notice" for the purposes of these Terms means communication in writing sent to hello@carashelters.ie and/or to the email address associated with the shelter's account, or any notice delivered through the platform's in-platform admin interface.`),
        p(`On termination:`),
        bullet(`Your access to the platform will cease at the end of the notice period.`),
        bullet(`Cara will make Your Data available for export for 30 days following termination.`),
        bullet(`After 30 days, all Your Data will be permanently deleted from Cara's systems, except for billing, tax, invoice, and accounting records which may be retained for the period required under Irish tax and accounting law.`),
        p(`Where a shelter is in material breach of these Terms due to non-payment or another remediable breach, Cara will give 14 days' written notice to remedy the breach before exercising the right to terminate, unless the breach gives rise to a legal, security, animal welfare, or data protection risk that requires immediate action.`),
        p(`Cara may terminate your account immediately and without notice for material breach of these Terms that is not capable of remedy, including serious or repeated violation of the Acceptable Use provisions.`),

        h2(`8. Changes to the Platform and Terms`),
        p(`Cara may update these Terms from time to time. We will give you at least 30 days' notice of material changes by email. Continued use of the platform after the notice period constitutes acceptance of the updated Terms.`),
        p(`Cara may modify, suspend, or discontinue features of the platform with reasonable notice. We will endeavour to give at least 60 days' notice of any discontinuation of the platform.`),
        p(`Cara will use commercially reasonable efforts to keep the platform available and secure, but does not guarantee uninterrupted service. Planned maintenance windows will be communicated to shelter administrators in advance where possible. Emergency maintenance may be carried out without prior notice where necessary to protect platform security or data integrity.`),
        p(`Previous versions of these Terms are available on request by contacting hello@carashelters.ie.`),

        h2(`9. Dispute Resolution`),
        p(`Before initiating formal legal proceedings, both parties agree to attempt to resolve any dispute arising from or in connection with these Terms through good-faith negotiation. If good-faith negotiation does not resolve the dispute within 30 days of written notice of the dispute, the parties may agree to refer the dispute to mediation before pursuing litigation.`),

        h2(`10. Governing Law`),
        p(`These Terms are governed by the laws of the Republic of Ireland. Any disputes arising from these Terms that are not resolved through the dispute resolution process in Section 9 shall be subject to the exclusive jurisdiction of the courts of the Republic of Ireland.`),
        p(`References to "applicable law" in these Terms include, without limitation: the General Data Protection Regulation (EU) 2016/679 (GDPR); the Data Protection Act 2018 (Ireland); relevant Irish and EU animal welfare legislation; consumer protection law where applicable; and applicable Irish and EU payment and tax laws.`),

        h2(`11. Contact`),
        bullet(`Email: hello@carashelters.ie`),
        bullet(`Website: carashelters.ie`),
        bullet(`Registered in Ireland`),
      ],
    }],
  })
}

// ─── DOCUMENT 3: Data Processing Agreement ──────────────────────────────────

function buildDPA() {
  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 20, color: BLACK } } } },
    sections: [{
      children: [
        brand(), divider(),
        h1(`Data Processing Agreement`),
        meta(`Effective date`, DATE),
        meta(`Version`, `1.0`),
        meta(`Regulation`, `GDPR (EU) 2016/679`),
        meta(`Document owner`, `Cara Shelters — privacy@carashelters.ie`),
        p(``),
        infoBox([
          `This Data Processing Agreement ("DPA") is entered into between:`,
          ``,
          `DATA CONTROLLER: The animal shelter organisation that has accepted the Cara Shelters`,
          `Terms of Service ("Shelter" or "Controller").`,
          ``,
          `DATA PROCESSOR: Cara Shelters, carashelters.ie, Republic of Ireland ("Cara" or "Processor").`,
          ``,
          `By accepting the Terms of Service, the Controller agrees to the terms of this DPA.`,
        ]),

        h2(`1. Definitions`),
        p(`In this DPA, the following terms have the meanings given to them in GDPR Article 4:`),
        bullet(`"Personal Data" means any information relating to an identified or identifiable natural person.`),
        bullet(`"Data Subject" means the individual to whom Personal Data relates.`),
        bullet(`"Processing" means any operation performed on Personal Data.`),
        bullet(`"Controller" means the entity that determines the purposes and means of processing Personal Data.`),
        bullet(`"Processor" means an entity that processes Personal Data on behalf of the Controller.`),
        bullet(`"Sub-processor" means a processor engaged by Cara to process Personal Data on behalf of the Controller.`),
        bullet(`"GDPR" means the General Data Protection Regulation (EU) 2016/679 and any applicable national implementing legislation.`),
        bullet(`"Supervisory Authority" means the Irish Data Protection Commission (dataprotection.ie).`),

        h2(`2. Subject Matter and Duration`),
        p(`2.1  This DPA governs the processing of Personal Data by Cara on behalf of the Controller solely for the purpose of providing the Cara Shelters shelter management platform ("Platform Services").`),
        p(`2.2  This DPA is effective from the date the Controller accepts the Terms of Service and remains in force until the earlier of: (a) termination of the shelter's subscription; or (b) written agreement between the parties to terminate this DPA.`),

        h2(`3. Nature and Purpose of Processing`),
        p(`Cara processes Personal Data on behalf of the Controller for the following purposes:`),
        bullet(`Storage and retrieval of adopter and fostering application records.`),
        bullet(`Storage and retrieval of donor records and donation history.`),
        bullet(`Storage and retrieval of volunteer and team member records.`),
        bullet(`Generation, storage, and e-signature collection for adoption contracts.`),
        bullet(`Transmission of email notifications to adopters and donors (where configured by the Controller).`),
        bullet(`Display of anonymised statistics and activity logs to shelter administrators.`),
        p(`Cara will not process Personal Data for any purpose other than providing the Platform Services, unless required to do so by law.`),

        h2(`4. Categories of Data Subjects`),
        p(`The Personal Data processed under this DPA relates to the following categories of Data Subjects:`),
        bullet(`Prospective adopters and fosterers who submit applications through the Controller's public portal.`),
        bullet(`Donors who make donations through the Controller's public portal.`),
        bullet(`Volunteers registered in the Controller's account.`),
        bullet(`Foster carers registered in the Controller's account.`),

        h2(`5. Categories of Personal Data`),
        p(`The Personal Data processed may include the following categories:`),
        bullet(`Identification data: full name, email address, telephone number.`),
        bullet(`Address data: home address, city, county, postcode, country.`),
        bullet(`Household information: property type, garden details, presence of children or other pets.`),
        bullet(`Experience information: previous pet ownership, experience level.`),
        bullet(`Consent records: GDPR consent status, timestamp, and IP address at time of consent.`),
        bullet(`Contract data: e-signature (typed name), IP address at time of signing, signing timestamp.`),
        bullet(`Financial data: donation amounts, Stripe payment references (no raw card data is stored by Cara).`),
        bullet(`Animal care history: fostering notes, medical observations entered by shelter staff.`),
        p(`Cara does not intentionally collect special category data (Article 9 GDPR). Shelters must not enter special category data into the platform unless a specific lawful basis applies.`),

        h2(`6. Obligations of the Processor (Cara)`),
        p(`Cara shall:`),
        numbered(`Process Personal Data only on documented instructions from the Controller (as set out in these Terms and this DPA), unless required to process for compliance with applicable law.`, `6.1`),
        numbered(`Ensure that all Cara personnel authorised to process the Controller's Personal Data are subject to a binding obligation of confidentiality.`, `6.2`),
        numbered(`Implement and maintain appropriate technical and organisational security measures in accordance with Article 32 GDPR, as further described in Section 9 of this DPA.`, `6.3`),
        numbered(`Not engage any sub-processor without the prior written consent of the Controller. The Controller consents to the sub-processors listed in Section 8 of this DPA by accepting these Terms.`, `6.4`),
        numbered(`Assist the Controller in responding to Data Subject rights requests under Articles 15-22 GDPR, taking into account the nature of the processing. Self-service tools are available in the platform. Cara will provide additional assistance upon written request.`, `6.5`),
        numbered(`Assist the Controller in ensuring compliance with the obligations in Articles 32-36 GDPR (security, breach notification, DPIA, prior consultation), taking into account the nature of the processing and the information available to Cara.`, `6.6`),
        numbered(`At the choice of the Controller, delete or return all Personal Data at the end of provision of services, and delete existing copies unless applicable law requires retention.`, `6.7`),
        numbered(`Make available to the Controller all information necessary to demonstrate compliance with the obligations laid down in Article 28 GDPR and allow for and contribute to audits, including inspections, as described in Section 11.`, `6.8`),
        numbered(`Immediately inform the Controller if, in Cara's opinion, an instruction infringes the GDPR or other applicable data protection law.`, `6.9`),

        h2(`7. Obligations of the Controller (Shelter)`),
        p(`The Controller shall:`),
        bullet(`Ensure that all processing of Personal Data carried out through the Platform has a valid lawful basis under GDPR Article 6.`),
        bullet(`Obtain and record valid consent from Data Subjects before collecting their Personal Data through the public portal, where consent is the lawful basis.`),
        bullet(`Maintain and publish an accessible Privacy Policy covering the Controller's own data processing activities.`),
        bullet(`Respond to Data Subject rights requests within the statutory timeframe (one month under GDPR Article 12).`),
        bullet(`Notify Cara promptly if the Controller becomes aware of any actual or potential breach of Personal Data stored on the Platform.`),

        h2(`8. Sub-processors`),
        p(`The Controller grants general authorisation to Cara to engage the following sub-processors. Cara will enter into data processing agreements with each sub-processor that impose equivalent obligations to those in this DPA.`),
        greenTable(
          [`Sub-processor`, `Purpose`, `Location`],
          [
            [`Supabase Inc.`,                  `Database hosting, file storage`, `EU (Ireland)`],
            [`Stripe Payments Europe, Ltd.`,   `Payment processing`,             `EU (Ireland)`],
            [`Vercel Inc.`,                    `Application hosting, CDN`,       `Global (EU regions preferred)`],
          ]
        ),
        p(``),
        p(`Cara will notify the Controller of any intended changes to sub-processors by email with at least 30 days' notice. If the Controller objects to a new sub-processor, it may terminate the subscription within that 30-day period. Continued use of the platform after the notice period constitutes acceptance.`),

        h2(`9. Security Measures`),
        p(`In accordance with Article 32 GDPR, Cara implements the following technical and organisational measures:`),

        h3(`Technical Measures`),
        bullet(`Encryption of all Personal Data at rest (AES-256 via Supabase).`),
        bullet(`Encryption of all Personal Data in transit using TLS 1.2 or higher.`),
        bullet(`Row-level security policies on the database restricting access to data by organisation.`),
        bullet(`Unique signing tokens (UUIDs) for adoption contract signing links, invalidated on use.`),
        bullet(`IP address logging at time of consent and contract signing for audit purposes.`),
        bullet(`API rate limiting on public-facing endpoints to mitigate abuse.`),
        bullet(`Bcrypt hashing of all user passwords; passwords never stored in plain text.`),

        h3(`Organisational Measures`),
        bullet(`Access to production data is restricted to authorised Cara Shelters personnel on a need-to-know basis.`),
        bullet(`All personnel with access to Personal Data are bound by confidentiality obligations.`),
        bullet(`Regular security reviews of the platform codebase.`),
        bullet(`Incident response procedures for data breach detection and notification.`),

        h2(`10. Personal Data Breach Notification`),
        p(`In the event that Cara becomes aware of a personal data breach affecting the Controller's Personal Data, Cara shall:`),
        bullet(`Notify the Controller without undue delay and in any event within 72 hours of becoming aware of the breach.`),
        p(`The notification shall include, to the extent known at the time:`),
        bullet(`A description of the nature of the breach, including categories and approximate number of Data Subjects and records affected.`),
        bullet(`The name and contact details of Cara's data protection contact.`),
        bullet(`A description of the likely consequences of the breach.`),
        bullet(`A description of the measures taken or proposed to address the breach.`),
        p(`The Controller is responsible for notifying the Supervisory Authority (Irish Data Protection Commission) and affected Data Subjects as required by GDPR Articles 33 and 34.`),

        h2(`11. Audit Rights`),
        p(`The Controller may, no more than once per calendar year, request written evidence of Cara's compliance with this DPA by submitting a request to privacy@carashelters.ie. Cara shall provide relevant documentation (such as security certifications, penetration test summaries, or written attestations) within 30 days.`),
        p(`Where the Controller reasonably requires an on-site audit, the parties shall agree in writing on the scope, timing, and cost before any audit commences. Audits must be conducted in a manner that minimises disruption to Cara's operations.`),

        h2(`12. Transfers Outside the EEA`),
        p(`Cara does not routinely transfer Personal Data outside the European Economic Area. Where Vercel processes request logs on non-EEA infrastructure, this is governed by Vercel's Standard Contractual Clauses (SCCs) adopted under Commission Decision 2021/914. No other international transfers are made without the Controller's knowledge.`),

        h2(`13. Governing Law`),
        p(`This DPA is governed by the laws of the Republic of Ireland and shall be interpreted in accordance with GDPR (EU) 2016/679. Any dispute arising under this DPA shall be subject to the jurisdiction of the courts of the Republic of Ireland.`),

        h2(`14. Contact`),
        bullet(`Data protection queries: privacy@carashelters.ie`),
        bullet(`General enquiries: hello@carashelters.ie`),
        bullet(`Website: carashelters.ie`),
      ],
    }],
  })
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const outDir = path.join(__dirname, `..`, `legal`)
  fs.mkdirSync(outDir, { recursive: true })

  const docs = [
    { name: `cara-privacy-policy.docx`,            build: buildPrivacyPolicy },
    { name: `cara-terms-of-service.docx`,          build: buildTermsOfService },
    { name: `cara-data-processing-agreement.docx`, build: buildDPA },
  ]

  for (const { name, build } of docs) {
    const doc    = build()
    const buffer = await Packer.toBuffer(doc)
    const outPath = path.join(outDir, name)
    fs.writeFileSync(outPath, buffer)
    console.log(`  ${name}  (${Math.round(buffer.length / 1024)} KB)`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
