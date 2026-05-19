import Link from "next/link"
import { PawPrint } from "lucide-react"

export const metadata = {
  title: "Terms of Service | Cara",
  description: "Terms governing the use of the Cara Shelters platform.",
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
          <Link href="/terms" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">Terms of Service</Link>
          <Link href="/dpa" className="text-slate-400 hover:text-slate-700 transition-colors">DPA</Link>
        </div>
      </div>
    </footer>
  )
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalNav />

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          <p className="mt-2 text-slate-500 text-sm">Effective date: 7 May 2025 &middot; Version 1.0</p>
          <p className="mt-1 text-slate-500 text-sm">Contact: <a href="mailto:hello@carashelters.ie" className="underline hover:opacity-75">hello@carashelters.ie</a></p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the Cara Shelters platform. By registering an account or using the platform, you agree to be bound by these Terms on behalf of your organisation.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">1. What Cara Provides</h2>
          <p className="text-slate-600 leading-relaxed">
            Cara Shelters (&ldquo;Cara&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) provides a software-as-a-service (SaaS) platform for animal rescue and rehoming organisations (&ldquo;Shelters&rdquo;, &ldquo;you&rdquo;, &ldquo;your&rdquo;). The platform includes:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Animal intake, profile management, and public adoption portal.</li>
            <li>Adoption and fostering application management and workflow.</li>
            <li>Digital adoption contract generation and e-signature collection.</li>
            <li>Donor management and Stripe-powered donation processing.</li>
            <li>Volunteer and team management.</li>
            <li>GDPR compliance tools including data export and deletion.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">2. Subscription Terms</h2>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">2.1 Plans and Pricing</h3>
            <p className="text-slate-600 leading-relaxed">
              Cara offers a free trial period of 14 days, after which a paid subscription is required to continue using the platform. Current pricing:
            </p>
            <div className="bg-slate-50 rounded-lg px-4 py-3 text-slate-700 text-sm">
              <strong>Pro Plan: &euro;34.99 per month</strong> per shelter organisation, billed monthly.
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              Pricing is subject to change. We will give you at least 60 days&rsquo; notice of any price increase.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">2.2 Payment</h3>
            <p className="text-slate-600 leading-relaxed">
              Subscriptions are billed monthly via Stripe. By providing payment details, you authorise Cara to charge the applicable subscription fee on a recurring monthly basis. All prices are exclusive of VAT where applicable.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">2.3 Cancellation</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>You may cancel your subscription at any time from your account settings.</li>
              <li>Cancellation takes effect at the end of the current billing period.</li>
              <li>No refunds are issued for the current billing period on cancellation.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">2.4 Free Trial</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>During the free trial you have access to full platform functionality.</li>
              <li>No payment is required during the trial.</li>
              <li>At the end of the trial, you must subscribe to continue using the platform.</li>
              <li>Trial accounts not converted to paid subscriptions may have their data retained for 30 days before deletion.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">3. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed">You agree to use the platform solely for legitimate animal rescue and rehoming purposes. You must not:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Use the platform for any commercial pet selling or breeding operation.</li>
            <li>Submit false or misleading information about animals, adopters, or your organisation.</li>
            <li>Attempt to access or interfere with another organisation&rsquo;s data.</li>
            <li>Use the platform in any way that violates applicable law, including GDPR and animal welfare legislation.</li>
            <li>Attempt to reverse engineer, decompile, or extract the source code of the platform.</li>
            <li>Resell, sublicense, or provide access to the platform to third parties.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">Cara reserves the right to suspend or terminate accounts that violate these provisions without notice.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">4. Shelter Responsibilities</h2>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">4.1 GDPR Compliance</h3>
            <p className="text-slate-600 leading-relaxed">You are the data controller for all adopter, donor, volunteer, and foster data you collect through your public portal. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
              <li>Obtaining valid GDPR consent from adopters and donors before collecting their personal data.</li>
              <li>Publishing and maintaining your own Privacy Policy accessible to portal visitors.</li>
              <li>Responding to data subject rights requests within statutory timeframes.</li>
              <li>Ensuring your use of the platform complies with GDPR and applicable national data protection law.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed text-sm">
              The <Link href="/dpa" className="underline hover:opacity-75">Cara&ndash;Shelter Data Processing Agreement</Link> governs the processing of personal data Cara carries out on your behalf. By accepting these Terms, you also accept the DPA.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">4.2 Account Security</h3>
            <p className="text-slate-600 leading-relaxed">You are responsible for maintaining the security and confidentiality of your account credentials. Notify Cara promptly if you suspect unauthorised access at <a href="mailto:hello@carashelters.ie" className="underline hover:opacity-75">hello@carashelters.ie</a>.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-slate-800">4.3 Accuracy of Information</h3>
            <p className="text-slate-600 leading-relaxed">You are responsible for the accuracy and legality of all data you enter into the platform, including animal profiles, adopter records, and contract content.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">5. Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed">
            Cara Shelters retains all intellectual property rights in the platform, including software, design, documentation, and branding. These Terms do not grant you any rights to the Cara Shelters name, logo, or platform code.
          </p>
          <p className="text-slate-600 leading-relaxed">
            You retain ownership of all data you enter into the platform (&ldquo;Your Data&rdquo;), including animal records, adopter applications, and donor information. Cara claims no ownership over Your Data and processes it solely to provide the platform services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">6. Liability Limitations</h2>
          <p className="text-slate-600 leading-relaxed">The platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted by Irish law:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Cara makes no warranties, express or implied, regarding the fitness of the platform for any particular purpose.</li>
            <li>Cara is not liable for any loss, damage, or corruption of data entered into the platform by you or your team.</li>
            <li>Cara&rsquo;s total aggregate liability for any claim shall not exceed the total subscription fees paid by you in the 12 months preceding the claim.</li>
            <li>Cara is not liable for indirect, consequential, or special losses, including loss of revenue, loss of data, or reputational damage.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed text-sm">Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded under Irish law.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">7. Termination</h2>
          <p className="text-slate-600 leading-relaxed">Either party may terminate the subscription with 30 days&rsquo; written notice. On termination:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 leading-relaxed">
            <li>Your access to the platform will cease at the end of the notice period.</li>
            <li>Cara will make Your Data available for export for 30 days following termination.</li>
            <li>After 30 days, all Your Data will be permanently deleted from Cara&rsquo;s systems, except for financial records required to be retained by law.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">Cara may terminate your account immediately and without notice for material breach of these Terms, including non-payment of subscription fees or violation of the Acceptable Use provisions.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">8. Changes to the Platform and Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            Cara may update these Terms from time to time. We will give you at least 30 days&rsquo; notice of material changes by email. Continued use of the platform after the notice period constitutes acceptance of the updated Terms.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Cara may modify, suspend, or discontinue features of the platform with reasonable notice. We will endeavour to give at least 60 days&rsquo; notice of any discontinuation of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">9. Governing Law</h2>
          <p className="text-slate-600 leading-relaxed">
            These Terms are governed by the laws of the Republic of Ireland. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of the Republic of Ireland.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">10. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Email: <a href="mailto:hello@carashelters.ie" className="underline hover:opacity-75">hello@carashelters.ie</a><br />
            Website: <a href="https://carashelters.ie" className="underline hover:opacity-75">carashelters.ie</a><br />
            Registered in Ireland.
          </p>
        </section>
      </main>

      <LegalFooter />
    </div>
  )
}
