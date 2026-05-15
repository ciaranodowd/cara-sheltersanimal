import Link from "next/link"

export const metadata = {
  title: "Privacy Policy | Cara",
  description: "How Cara and shelters using the Cara platform process your personal data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1a3a2a] rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
            <span className="font-bold text-[#1a3a2a]">Cara</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-slate-500 text-sm">Last updated: May 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">1. Who we are</h2>
          <p className="text-slate-600 leading-relaxed">
            Cara is animal shelter management software operated by Cara Technologies Ltd, Ireland. This policy explains
            how we and the rescue organisations using the Cara platform (&ldquo;Shelters&rdquo;) collect and use your
            personal data when you submit an adoption or foster application through a Shelter&rsquo;s public portal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">2. What data we collect</h2>
          <p className="text-slate-600 leading-relaxed">
            When you submit an adoption or foster application we collect:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Your name, email address, and phone number</li>
            <li>Your home address and county</li>
            <li>Household information (property type, garden, children, other pets)</li>
            <li>Pet ownership experience and motivation for adopting</li>
            <li>Your IP address at the time of submission (for GDPR audit purposes)</li>
            <li>Date and time of consent</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">3. Why we collect it</h2>
          <p className="text-slate-600 leading-relaxed">
            Your data is used solely to process your adoption or foster application. The Shelter uses it to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Review your suitability as an adopter or foster carer</li>
            <li>Contact you about the status of your application</li>
            <li>Arrange a home check if required</li>
            <li>Generate an adoption contract if your application is approved</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            The lawful basis for processing is your consent, given when you tick the consent boxes on the application
            form, and the performance of a contract (the adoption agreement).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">4. Who we share it with</h2>
          <p className="text-slate-600 leading-relaxed">
            Your data is shared with the Shelter you applied to. Cara acts as a data processor on their behalf.
            We do not sell your data or share it with third parties for marketing purposes.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We use the following sub-processors to operate the service:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li><strong>Supabase</strong> — database hosting (EU region)</li>
            <li><strong>Vercel</strong> — application hosting</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">5. How long we keep it</h2>
          <p className="text-slate-600 leading-relaxed">
            Application data is retained for as long as the Shelter operates its account with Cara, or until you
            request erasure. Shelters are required under GDPR to handle data subject requests promptly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">6. Your rights</h2>
          <p className="text-slate-600 leading-relaxed">
            Under GDPR you have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Access the personal data held about you</li>
            <li>Correct inaccurate data</li>
            <li>Request erasure of your data (&ldquo;right to be forgotten&rdquo;)</li>
            <li>Withdraw your consent at any time</li>
            <li>Lodge a complaint with the Data Protection Commission (Ireland): <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="underline text-[#1a3a2a] hover:opacity-75">dataprotection.ie</a></li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            To exercise your rights, contact the Shelter directly through their portal, or email{" "}
            <a href="mailto:privacy@carashelters.ie" className="underline text-[#1a3a2a] hover:opacity-75">
              privacy@carashelters.ie
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">7. Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            The Cara platform uses a session cookie solely to keep you logged in to your shelter dashboard.
            No tracking or advertising cookies are used. The public adoption portal does not set any cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">8. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            For any privacy-related queries, contact us at{" "}
            <a href="mailto:privacy@carashelters.ie" className="underline text-[#1a3a2a] hover:opacity-75">
              privacy@carashelters.ie
            </a>
            .
          </p>
        </section>

        <div className="border-t pt-6">
          <a
            href="/legal/cara-privacy-policy.docx"
            download
            className="text-sm text-slate-500 underline hover:text-slate-800 transition-colors"
          >
            Download full policy (.docx)
          </a>
        </div>
      </main>

      <footer className="border-t border-slate-100 px-4 py-6 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Cara Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-slate-700 transition-colors font-medium text-slate-600">Privacy Policy</Link>
            <a href="/legal/cara-terms-of-service.docx" download className="hover:text-slate-700 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
