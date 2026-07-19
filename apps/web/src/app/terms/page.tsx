import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Djermoun Auto",
  description: "Terms and conditions for using Djermoun Auto car export and import services.",
};

const LAST_UPDATED = "July 15, 2026";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Overview",
    content: `Djermoun Auto ("we", "our", "the Company") is a licensed car export intermediary operating between China and North Africa / Middle East. By using our website (djermounauto.com) or engaging our services, you ("the Client") agree to be bound by these Terms of Service.

These terms govern all transactions, inquiries, reservations, and communications conducted through our platform or directly with our team.`,
  },
  {
    id: "services",
    title: "2. Services Provided",
    content: `Djermoun Auto provides the following services:

• Vehicle Sourcing — identifying and procuring new or used vehicles from the Chinese automotive market on behalf of the Client.
• Pre-Shipment Inspection — arranging professional third-party inspection of vehicles before export.
• Export Licensing & Documentation — preparing all required Chinese export certificates, bills of lading, and customs paperwork.
• International Shipping — arranging sea freight (FOB or CIF) to the Client's designated destination port.
• Price Negotiation — negotiating with Chinese suppliers on behalf of the Client to secure competitive FOB prices.
• Vehicle Customization — coordinating language system conversion, right-hand-drive adaptation, and accessory installation where applicable.

We act as an intermediary and do not manufacture, own, or warehouse vehicles. Title to any vehicle passes directly from the Chinese supplier to the Client upon payment.`,
  },
  {
    id: "pricing",
    title: "3. Pricing & Fees",
    content: `All prices displayed on the platform are in USD (FOB China) unless otherwise stated. Algerian DZD / M centimes equivalents are shown for reference only and are not contractually binding.

The total cost presented to the Client includes:
• FOB vehicle price (as sourced from the supplier)
• Djermoun Auto service commission
• Estimated sea freight cost (Wasla / shipping fee)
• AutoCango platform fees where applicable

The following are NOT included in the listed price and are the Client's sole responsibility:
• Algerian customs duties and taxes
• Destination port handling and clearance fees
• Local transport from port to delivery address
• Insurance (unless CIF terms are explicitly agreed)

All prices are subject to change until a formal order confirmation is issued and deposit received.`,
  },
  {
    id: "payment",
    title: "4. Payment Terms",
    content: `4.1 Deposit: A non-refundable deposit of 30% of the total agreed price is required to confirm any vehicle order. This deposit secures the vehicle allocation and initiates the export process.

4.2 Final Payment: The remaining 70% balance is due prior to vessel loading, as evidenced by the Bill of Lading draft. No vehicle will be shipped until full payment is confirmed.

4.3 Payment Methods: We accept international bank wire transfer (T/T) only. We do not accept cash, cryptocurrency, or informal payment channels.

4.4 Late Payment: Failure to complete payment within 5 business days of the agreed deadline may result in cancellation of the order and forfeiture of the deposit.

4.5 Currency: All payments must be made in USD unless a written alternative is agreed in advance.`,
  },
  {
    id: "inspection",
    title: "5. Vehicle Inspection & Condition",
    content: `5.1 All used vehicles undergo a pre-shipment inspection by a licensed third-party inspection agency. A full English-language inspection report is provided to the Client before final payment.

5.2 The Client has the right to reject the vehicle within 48 hours of receiving the inspection report. Rejection after this window, or after payment is made, does not entitle the Client to a refund.

5.3 New vehicles (year 2026, ≤100 km) are shipped without prior inspection unless specifically requested by the Client.

5.4 Djermoun Auto is not liable for latent defects that could not reasonably be identified during pre-shipment inspection.`,
  },
  {
    id: "shipping",
    title: "6. Shipping & Delivery",
    content: `6.1 Estimated shipping times are provided in good faith but are not guaranteed. Delays caused by port congestion, weather, carrier issues, or force majeure events are not the responsibility of Djermoun Auto.

6.2 Under FOB terms, risk passes to the Client upon loading onto the vessel. Under CIF terms, risk passes upon delivery to the destination port.

6.3 The Client is responsible for arranging customs clearance, import duties, and local delivery from the destination port.

6.4 Djermoun Auto will provide all standard export documents: commercial invoice, packing list, bill of lading, certificate of origin, and inspection certificate.

6.5 We are not responsible for vehicles damaged, delayed, or seized due to improper customs documentation submitted by the Client or their local agent.`,
  },
  {
    id: "cancellation",
    title: "7. Cancellation & Refunds",
    content: `7.1 Orders cancelled by the Client after deposit payment are non-refundable.

7.2 If Djermoun Auto is unable to source the requested vehicle within 30 days of deposit, the full deposit will be refunded.

7.3 If a vehicle fails inspection and the Client rejects it within the 48-hour window (see Section 5.2), the deposit is fully refunded minus any inspection fees incurred.

7.4 No refunds are issued after final payment and vessel loading.`,
  },
  {
    id: "liability",
    title: "8. Limitation of Liability",
    content: `8.1 Djermoun Auto acts solely as an intermediary. We are not liable for defects, mechanical failures, or damage occurring after delivery to the destination port.

8.2 Our total liability to any Client for any claim shall not exceed the amount of the service commission paid by the Client to Djermoun Auto for the specific transaction in question.

8.3 We are not liable for indirect, incidental, or consequential damages including but not limited to loss of profit, business interruption, or currency fluctuation losses.

8.4 The Client is solely responsible for verifying that any imported vehicle complies with their country's import regulations, roadworthiness standards, and homologation requirements.`,
  },
  {
    id: "privacy",
    title: "9. Privacy & Data",
    content: `We collect and process personal information (name, contact details, payment information) solely for the purpose of fulfilling your order and communicating with you. We do not sell or share personal data with third parties except where required to complete the export transaction (e.g., inspection agencies, freight forwarders).

Data is stored securely and retained for a minimum of 5 years for legal and accounting compliance.`,
  },
  {
    id: "disputes",
    title: "10. Disputes & Governing Law",
    content: `These Terms are governed by Algerian law. Any dispute arising from or related to these Terms or a transaction with Djermoun Auto shall first be attempted to be resolved amicably within 30 days.

If no amicable resolution is reached, disputes shall be submitted to the competent courts of Algeria.

For international clients, disputes may alternatively be resolved through ICC arbitration in Algiers, in the French or Arabic language, at the election of Djermoun Auto.`,
  },
  {
    id: "changes",
    title: "11. Changes to These Terms",
    content: `Djermoun Auto reserves the right to update these Terms of Service at any time. The "Last Updated" date at the top of this page will reflect the latest revision. Continued use of our platform after changes constitutes acceptance of the revised terms.

For significant changes, we will notify active Clients by email.`,
  },
  {
    id: "contact",
    title: "12. Contact",
    content: `For questions about these Terms, please contact us:

Email: sales@djermounauto.com
WhatsApp: Available on our website
Address: Algeria`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0A0F1E]">
      {/* Hero */}
      <div className="bg-white border-b border-slate-100 px-6 py-16 dark:bg-[#0A0F1E] dark:border-white/5">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-amber-500 mb-8">
            ← Back to home
          </Link>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">Legal</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="mt-3 text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 max-w-2xl text-slate-600 text-sm leading-relaxed dark:text-slate-400">
            Please read these terms carefully before using Djermoun Auto services. By placing an order or using our platform, you agree to these terms in full.
          </p>

          {/* Quick nav */}
          <div className="mt-8 flex flex-wrap gap-2">
            {SECTIONS.map(({ id, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-amber-500/50 dark:hover:text-amber-400"
              >
                {title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
        {SECTIONS.map(({ id, title, content }) => (
          <section key={id} id={id} className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <h2 className="text-lg font-bold text-slate-900 mb-4 dark:text-white">{title}</h2>
            <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-line dark:text-slate-400">
              {content}
            </div>
          </section>
        ))}

        <p className="text-center text-xs text-slate-400 pt-4">
          © {new Date().getFullYear()} Djermoun Auto. All rights reserved.
        </p>
      </div>
    </main>
  );
}
