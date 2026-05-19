import Link from "next/link"
import { PawPrint } from "lucide-react"

export const metadata = {
  title: "Data Processing Agreement | Cara",
  description: "GDPR Data Processing Agreement between Cara Shelters and shelter organisations.",
}

function LegalNav() {
  return (
    <header className="border-b border-slate-100 px-4 py-4 sticky top-0 bg-white z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1a3a2a] flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-[#4ade80]" />
          </div>
          <span className="font-bold text-[#1a3a2a]">Cara</span>
        </Link>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Back to home
        </Link>
      </div>
    </header>
  )
}

function LegalFooter() {
  return (
    <footer className="border-t border-slate-100 px-4 py-6 mt-16">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Cara Shelters. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/privacy" className="text-slate-400 hover:text-slate-700 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-slate-400 hover:text-slate-700 transition-colors">Terms of Service</Link>
          <Link href="/dpa" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">DPA</Link>
        </div>
      </div>
    </footer>
  )
}

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalNav />

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Processing Agreement</h1>
          <p className="mt-2 text-slate-500 text-sm">Effective date: 7 May 2025 &middot; Version 1.0 &middot; Regulation: GDPR (EU) 2016/679</p>
          <p className="mt-1 text-slate-500 text-sm">Contact: <a href="mailto:privacy@carashelters.ie" className="underline hover:opacity-75">privacy@carashelters.ie</a></p>
          <div className="mt-4 bg-slate-50 rounded-lg p-4 text-sm text-slate-600 space-y-1">
            <p>This Data Processing Agreement (&ldquo;DPA&rdquo;) is entered into between:</p>
            <p><span className="font-semibold text-slate-800">DATA CONTROLLER:</span> The animal shelter organisation that has accepted the Cara Shelters Terms of Service (&ldquo;Shelter&rdquo; or &ldquo;Controller&rdquo;).</p>
            <p><span className="font-semibold text-slate-800">DATA PROCESSOR:</span> Cara Shelters, carashelters.ie, Republic of Ireland (&ldquo;Cara&rdquo; or &ldquo;Processor&rdquo;).</p>
            <p className="pt-1">By accepting the <Link href="/terms" className="underline hover:opacity-75">Terms of Service</Link>, the Controller agrees to the terms of this DPA.</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">1. Definitions</h2>
          <p className="text-slate-600 leading-relaxed">In this DPA, the following terms have the meanings given to them in GDPR Article 4:</p>
          <dl className="space-y-2 text-sm">
            {[
              ["Personal Data", "Any information relating to an identified or identifiable natural person."],
              ["Data Subject", "The individual to whom Personal Data relates."],
              ["Processing", "Any operation performed on Personal Data."],
              ["Controller", "The entity that determines the purposes and means of processing Personal Data."],
              ["Processor", "An entity that processes Personal Data on behalf of the Controller."],
              ["Sub-processor", "A processor engaged by Cara to process Personal Data on behalf of the Controller."],
              ["GDPR", "The General Data Protection Regulation (EU) 2016/679 and any applicable national implementing legislation."],
              ["Supervisory Authority", "The Irish Data Protection Commission (dataprotection.ie)."],
            ].map(([term, def]) => (
              <div key={term} className="flex gap-2">
                <dt className="font-medium text-slate-800 shrink-0">&ldquo;{term}&rdquo;</dt>
                <dd className="text-slate-600">{def}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">2. Subject Matter and Duration</h2>
          <p className="text-slate-600 leading-relaxed">
            This DPA governs the processing of Personal Data by Cara on behalf of the Controller solely for the purpose of providing the Cara Shelters shelter management platform (&ldquo;Platform Services&rdquo;).
          </p>
          <p className="text-slate-600 leading-relaxed">
            This DPA is effective from the date the Controller accepts the Terms of Service and remains in force until the earlier of: (a) termination of the shelter&rsquo;s subscription; or (b) written agreement between the parties to terminate this DPA.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">3. Nature and Purpose of Processing</h2>
          <p className="text-slate-600 leading-relaxed">Cara processes Personal Data on behalf of the Controller for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Storage and retrieval of adopter and fostering application records.</li>
            <li>Storage and retrieval of donor records and donation history.</li>
            <li>Storage and retrieval of volunteer and team member records.</li>
            <li>Generation, storage, and e-signature collection for adoption contracts.</li>
            <li>Transmission of email notifications to adopters and donors (where configured by the Controller).</li>
            <li>Display of anonymised statistics and activity logs to shelter administrators.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed text-sm">Cara will not process Personal Data for any purpose other than providing the Platform Services, unless required to do so by law.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">4. Categories of Data Subjects</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Prospective adopters and fosterers who submit applications through the Controller&rsquo;s public portal.</li>
            <li>Donors who make donations through the Controller&rsquo;s public portal.</li>
            <li>Volunteers registered in the Controller&rsquo;s account.</li>
            <li>Foster carers registered in the Controller&rsquo;s account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">5. Categories of Personal Data</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li><span className="font-medium">Identification data:</span> full name, email address, telephone number.</li>
            <li><span className="font-medium">Address data:</span> home address, city, county, postcode, country.</li>
            <li><span className="font-medium">Household information:</span> property type, garden details, presence of children or other pets.</li>
            <li><span className="font-medium">Experience information:</span> previous pet ownership, experience level.</li>
            <li><span className="font-medium">Consent records:</span> GDPR consent status, timestamp, and IP address at time of consent.</li>
            <li><span className="font-medium">Contract data:</span> e-signature (typed name), IP address at time of signing, signing timestamp.</li>
            <li><span className="font-medium">Financial data:</span> donation amounts, Stripe payment references (no raw card data is stored by Cara).</li>
            <li><span className="font-medium">Animal care history:</span> fostering notes, medical observations entered by shelter staff.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed text-sm">Cara does not intentionally collect special category data (Article 9 GDPR). Shelters must not enter special category data into the platform unless a specific lawful basis applies.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">6. Obligations of the Processor (Cara)</h2>
          <p className="text-slate-600 leading-relaxed">Cara shall:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 leading-relaxed">
            <li>Process Personal Data only on documented instructions from the Controller, unless required by applicable law.</li>
            <li>Ensure that all Cara personnel authorised to process the Controller&rsquo;s Personal Data are subject to a binding obligation of confidentiality.</li>
            <li>Implement and maintain appropriate technical and organisational security measures in accordance with Article 32 GDPR (see Section 9).</li>
            <li>Not engage any sub-processor without the prior written consent of the Controller. The Controller consents to the sub-processors listed in Section 8 by accepting these Terms.</li>
            <li>Assist the Controller in responding to Data Subject rights requests under Articles 15&ndash;22 GDPR.</li>
            <li>Assist the Controller in ensuring compliance with Articles 32&ndash;36 GDPR (security, breach notification, DPIA, prior consultation).</li>
            <li>At the choice of the Controller, delete or return all Personal Data at the end of provision of services.</li>
            <li>Make available all information necessary to demonstrate compliance with Article 28 GDPR and allow for audits (see Section 11).</li>
            <li>Immediately inform the Controller if, in Cara&rsquo;s opinion, an instruction infringes the GDPR or other applicable data protection law.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">7. Obligations of the Controller (Shelter)</h2>
          <p className="text-slate-600 leading-relaxed">The Controller shall:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Ensure that all processing of Personal Data carried out through the Platform has a valid lawful basis under GDPR Article 6.</li>
            <li>Obtain and record valid consent from Data Subjects before collecting their Personal Data through the public portal, where consent is the lawful basis.</li>
            <li>Maintain and publish an accessible Privacy Policy covering the Controller&rsquo;s own data processing activities.</li>
            <li>Respond to Data Subject rights requests within the statutory timeframe (one month under GDPR Article 12).</li>
            <li>Notify Cara promptly if the Controller becomes aware of any actual or potential breach of Personal Data stored on the Platform.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">8. Sub-processors</h2>
          <p className="text-slate-600 leading-relaxed">The Controller grants general authorisation to Cara to engage the following sub-processors. Cara will enter into data processing agreements with each sub-processor that impose equivalent obligations to those in this DPA.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Sub-processor</th>
                  <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Purpose</th>
                  <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Location</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {[
                  ["Supabase Inc.", "Database hosting, file storage", "EU (Ireland)"],
                  ["Stripe Payments Europe, Ltd.", "Payment processing", "EU (Ireland)"],
                  ["Vercel Inc.", "Application hosting, CDN", "Global (EU regions preferred)"],
                ].map(([name, purpose, location]) => (
                  <tr key={name} className="even:bg-slate-50">
                    <td className="px-4 py-3 border border-slate-200 font-medium">{name}</td>
                    <td className="px-4 py-3 border border-slate-200">{purpose}</td>
                    <td className="px-4 py-3 border border-slate-200">{location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            Cara will notify the Controller of any intended changes to sub-processors by email with at least 30 days&rsquo; notice. If the Controller objects to a new sub-processor, it may terminate the subscription within that 30-day period.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">9. Security Measures</h2>
          <p className="text-slate-600 leading-relaxed">In accordance with Article 32 GDPR, Cara implements the following measures:</p>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">Technical Measures</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>Encryption of all Personal Data at rest (AES-256 via Supabase).</li>
              <li>Encryption of all Personal Data in transit using TLS 1.2 or higher.</li>
              <li>Row-level security policies on the database restricting access to data by organisation.</li>
              <li>Unique signing tokens (UUIDs) for adoption contract signing links, invalidated on use.</li>
              <li>IP address logging at time of consent and contract signing for audit purposes.</li>
              <li>API rate limiting on public-facing endpoints to mitigate abuse.</li>
              <li>Bcrypt hashing of all user passwords; passwords never stored in plain text.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">Organisational Measures</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>Access to production data is restricted to authorised Cara Shelters personnel on a need-to-know basis.</li>
              <li>All personnel with access to Personal Data are bound by confidentiality obligations.</li>
              <li>Regular security reviews of the platform codebase.</li>
              <li>Incident response procedures for data breach detection and notification.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">10. Personal Data Breach Notification</h2>
          <p className="text-slate-600 leading-relaxed">In the event of a personal data breach affecting the Controller&rsquo;s Personal Data, Cara shall notify the Controller without undue delay and in any event within 72 hours of becoming aware of the breach. The notification shall include:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>A description of the nature of the breach, including categories and approximate number of Data Subjects and records affected.</li>
            <li>The name and contact details of Cara&rsquo;s data protection contact.</li>
            <li>A description of the likely consequences of the breach.</li>
            <li>A description of the measures taken or proposed to address the breach.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed text-sm">The Controller is responsible for notifying the Supervisory Authority (Irish Data Protection Commission) and affected Data Subjects as required by GDPR Articles 33 and 34.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">11. Audit Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            The Controller may, no more than once per calendar year, request written evidence of Cara&rsquo;s compliance with this DPA by submitting a request to <a href="mailto:privacy@carashelters.ie" className="underline hover:opacity-75">privacy@carashelters.ie</a>. Cara shall provide relevant documentation within 30 days.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Where the Controller reasonably requires an on-site audit, the parties shall agree in writing on the scope, timing, and cost before any audit commences. Audits must be conducted in a manner that minimises disruption to Cara&rsquo;s operations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">12. Transfers Outside the EEA</h2>
          <p className="text-slate-600 leading-relaxed">
            Cara does not routinely transfer Personal Data outside the European Economic Area. Where Vercel processes request logs on non-EEA infrastructure, this is governed by Vercel&rsquo;s Standard Contractual Clauses (SCCs) adopted under Commission Decision 2021/914. No other international transfers are made without the Controller&rsquo;s knowledge.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">13. Governing Law</h2>
          <p className="text-slate-600 leading-relaxed">
            This DPA is governed by the laws of the Republic of Ireland and shall be interpreted in accordance with GDPR (EU) 2016/679. Any dispute arising under this DPA shall be subject to the jurisdiction of the courts of the Republic of Ireland.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">14. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Data protection queries: <a href="mailto:privacy@carashelters.ie" className="underline hover:opacity-75">privacy@carashelters.ie</a><br />
            General enquiries: <a href="mailto:hello@carashelters.ie" className="underline hover:opacity-75">hello@carashelters.ie</a><br />
            Website: <a href="https://carashelters.ie" className="underline hover:opacity-75">carashelters.ie</a>
          </p>
        </section>
      </main>

      <LegalFooter />
    </div>
  )
}
