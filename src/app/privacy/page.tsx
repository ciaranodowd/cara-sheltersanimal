import Link from "next/link"
import { PawPrint } from "lucide-react"

export const metadata = {
  title: "Privacy Policy | Cara",
  description: "How Cara Shelters collects, uses, and protects personal data.",
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
          <Link href="/privacy" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-slate-400 hover:text-slate-700 transition-colors">Terms of Service</Link>
          <Link href="/dpa" className="text-slate-400 hover:text-slate-700 transition-colors">DPA</Link>
        </div>
      </div>
    </footer>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalNav />

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-slate-500 text-sm">Effective date: 7 May 2025 &middot; Version 1.0</p>
          <p className="mt-1 text-slate-500 text-sm">Contact: <a href="mailto:privacy@carashelters.ie" className="underline hover:opacity-75">privacy@carashelters.ie</a></p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">1. Who We Are</h2>
          <p className="text-slate-600 leading-relaxed">
            Cara Shelters (&ldquo;Cara&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the shelter management SaaS platform available at carashelters.ie. Cara Shelters is incorporated and operates in the Republic of Ireland.
          </p>
          <p className="text-slate-600 leading-relaxed">
            For the purposes of the General Data Protection Regulation (EU) 2016/679 (&ldquo;GDPR&rdquo;), Cara Shelters is the data controller for:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Personal data of shelter staff and administrators who hold accounts on the platform.</li>
            <li>Visitor data collected via the carashelters.ie marketing website.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            Animal shelters that use the Cara platform (&ldquo;Shelters&rdquo;) are independent data controllers of the adopter, donor, and volunteer data they collect through their own public portals. Cara acts as a data processor for that data. See Section 9 for details.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">2. Data We Collect</h2>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">2.1 Shelter Staff Accounts</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>Full name and email address.</li>
              <li>Password (stored as a bcrypt hash; never stored in plain text).</li>
              <li>Organisation membership, role (Admin / Staff / Volunteer / Foster), and join date.</li>
              <li>Activity log entries recording actions taken within the platform (e.g. application status changes, contract sending).</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">2.2 Adopter &amp; Donor Data (Processed on Behalf of Shelters)</h3>
            <p className="text-slate-600 leading-relaxed">When members of the public submit adoption or fostering applications through a shelter&rsquo;s public portal, the following data is collected and stored on behalf of the shelter:</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>Full name, email address, phone number, home address, and county.</li>
              <li>Household details (type, garden, children, other pets).</li>
              <li>Previous pet experience and reason for adopting or fostering.</li>
              <li>GDPR consent records, including timestamp and IP address at time of consent.</li>
              <li>E-signature data (typed name) and IP address at time of contract signing.</li>
              <li>Donor data: name, email, donation amount, frequency, and Stripe payment reference.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">2.3 Website Visitor Data</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>IP address and browser user agent (collected automatically by our hosting infrastructure).</li>
              <li>Pages visited and time on site (collected via session cookies only &mdash; see Section 8).</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">3. Lawful Basis for Processing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Processing activity</th>
                  <th className="text-left px-4 py-3 border border-slate-200 font-semibold text-slate-700">Lawful basis (GDPR Article 6)</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {[
                  ["Shelter staff account management", "Article 6(1)(b) — performance of contract"],
                  ["Billing and subscription management", "Article 6(1)(b) — performance of contract"],
                  ["Platform security and fraud prevention", "Article 6(1)(f) — legitimate interests"],
                  ["Adopter application data (processed for shelters)", "Article 6(1)(a) — consent (obtained by shelter)"],
                  ["Donor payment records", "Article 6(1)(c) — legal obligation (financial records)"],
                  ["Marketing emails to shelter administrators", "Article 6(1)(a) — consent"],
                ].map(([activity, basis]) => (
                  <tr key={activity} className="even:bg-slate-50">
                    <td className="px-4 py-3 border border-slate-200">{activity}</td>
                    <td className="px-4 py-3 border border-slate-200">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">4. Data Processors We Use</h2>
          <p className="text-slate-600 leading-relaxed">We engage the following sub-processors to operate the platform. All are subject to appropriate data processing agreements:</p>
          <div className="space-y-4">
            {[
              {
                name: "Supabase (Supabase Inc.)",
                purpose: "PostgreSQL database hosting and file storage.",
                location: "European Union (eu-west-1 region, Ireland/Europe).",
                data: "All platform data including adopter records, contracts, and photos.",
              },
              {
                name: "Stripe (Stripe Payments Europe, Limited)",
                purpose: "Payment processing for subscriptions, donation checkouts, and adoption fees.",
                location: "European Economic Area (regulated entity incorporated in Ireland).",
                data: "Donor name, email, payment card data (handled directly by Stripe; Cara never sees raw card data).",
              },
              {
                name: "Vercel (Vercel Inc.)",
                purpose: "Application hosting and serverless function execution.",
                location: "Global CDN; server-side processing in EU regions where possible.",
                data: "HTTP request logs including IP addresses (retained 30 days).",
              },
            ].map(p => (
              <div key={p.name} className="bg-slate-50 rounded-lg p-4 space-y-1">
                <p className="font-medium text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-600"><span className="font-medium">Purpose:</span> {p.purpose}</p>
                <p className="text-sm text-slate-600"><span className="font-medium">Location:</span> {p.location}</p>
                <p className="text-sm text-slate-600"><span className="font-medium">Data transferred:</span> {p.data}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">5. Retention Periods</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 leading-relaxed">
            <li><span className="font-medium">Shelter staff account data:</span> retained for the duration of the shelter&rsquo;s active subscription, plus 12 months after cancellation.</li>
            <li><span className="font-medium">Adopter and donor data (processed on behalf of shelters):</span> subject to each shelter&rsquo;s own retention policy. Cara will delete or return all such data within 30 days of subscription termination on request.</li>
            <li><span className="font-medium">Financial and billing records:</span> retained for 7 years in accordance with Irish Revenue Commissioners requirements under the Taxes Consolidation Act 1997.</li>
            <li><span className="font-medium">Activity logs:</span> retained for 24 months, then permanently deleted.</li>
            <li><span className="font-medium">Website visitor logs:</span> retained for 30 days (Vercel infrastructure default).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">6. Your Data Subject Rights</h2>
          <p className="text-slate-600 leading-relaxed">Under GDPR Articles 15&ndash;22, you have the following rights regarding personal data we hold about you as a platform user (shelter staff):</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 leading-relaxed">
            <li><span className="font-medium">Right of access (Article 15):</span> You may request a copy of the personal data we hold about you. Use the &lsquo;Download my data&rsquo; function in your account settings, or email <a href="mailto:privacy@carashelters.ie" className="underline hover:opacity-75">privacy@carashelters.ie</a>.</li>
            <li><span className="font-medium">Right to erasure (Article 17):</span> You may request deletion of your account. Note: financial records required by law cannot be erased.</li>
            <li><span className="font-medium">Right to rectification (Article 16):</span> You may correct inaccurate personal data via your account settings or by contacting us.</li>
            <li><span className="font-medium">Right to data portability (Article 20):</span> You may download your data in JSON format from your account settings.</li>
            <li><span className="font-medium">Right to object (Article 21):</span> You may object to processing based on legitimate interests by contacting <a href="mailto:privacy@carashelters.ie" className="underline hover:opacity-75">privacy@carashelters.ie</a>.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            For rights requests relating to adopter or donor data collected through a shelter&rsquo;s portal, please contact the relevant shelter directly &mdash; they are the data controller for that data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">7. Controller vs. Processor Distinction</h2>
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-800">Cara Shelters is the DATA CONTROLLER for:</span> shelter staff account data, platform usage logs, and billing data.</p>
            <p><span className="font-semibold text-slate-800">Cara Shelters is the DATA PROCESSOR for:</span> adopter applications, donor records, volunteer data, adoption contracts, and all other data that shelters collect through their public-facing portals.</p>
            <p>Each shelter is an independent DATA CONTROLLER for the data their adopters and donors submit. The <Link href="/dpa" className="underline hover:opacity-75">Cara&ndash;Shelter Data Processing Agreement</Link> governs this relationship.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">8. Cookie Policy</h2>
          <p className="text-slate-600 leading-relaxed">Carashelters.ie uses the following cookies:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li><span className="font-medium">Session cookies (strictly necessary):</span> Used to maintain your login session after authentication. Deleted when you close your browser.</li>
            <li><span className="font-medium">CSRF token cookie (strictly necessary):</span> Protects form submissions against cross-site request forgery attacks.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">We do not use advertising cookies, tracking pixels, or any third-party analytics cookies. No personal data is shared with advertising networks.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">9. International Transfers</h2>
          <p className="text-slate-600 leading-relaxed">
            All data is stored on Supabase infrastructure located within the European Union. Vercel may process request logs on servers outside the EU/EEA; this is covered by Vercel&rsquo;s Standard Contractual Clauses (SCCs) as adopted by the European Commission. No other international transfers are made.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">10. Contact &amp; Complaints</h2>
          <p className="text-slate-600 leading-relaxed">
            For any data protection queries or to exercise your rights, email <a href="mailto:privacy@carashelters.ie" className="underline hover:opacity-75">privacy@carashelters.ie</a>.
          </p>
          <p className="text-slate-600 leading-relaxed">
            If you are not satisfied with our response, you have the right to lodge a complaint with the Irish Data Protection Commission: <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75">dataprotection.ie</a> &middot; +353 (0)57 868 4800 &middot; 21 Fitzwilliam Square South, Dublin 2, D02 RD28.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">11. Changes to This Policy</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify shelter administrators by email of any material changes at least 30 days before they take effect. Continued use of the platform after the effective date constitutes acceptance of the revised policy.
          </p>
        </section>
      </main>

      <LegalFooter />
    </div>
  )
}
