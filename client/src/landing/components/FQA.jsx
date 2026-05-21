import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "How does the 14-day free trial work?", a: "Sign up with email, no credit card needed. You get full Business plan access for 14 days. After that, pick a plan or stay on Free." },
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade anytime. Changes are immediate and billing is prorated." },
  { q: "What payment methods do you accept?", a: "eSewa, Khalti, FonePay, bank transfer, and cash. We support all major Nepali payment options." },
  { q: "Is my data secure?", a: "Bank-level encryption, regular backups, and isolated tenant storage. Your data is never shared." },
  { q: "Can I manage multiple branches?", a: "Yes. Business and Enterprise plans support multi-branch with consolidated reports." },
  { q: "Do I need internet to use NUVLYX?", a: "Works best online but supports offline mode. Orders sync automatically when reconnected." },
  { q: "What devices are supported?", a: "Any device with a browser — tablets, phones, laptops, desktops. We recommend tablets for waiters." },
  { q: "Is training provided?", a: "Yes. Video tutorials, docs, and email support for all plans. Business+ get priority support." },
  { q: "Can I export my data?", a: "Anytime. Export to CSV or Excel. Enterprise includes API access." },
  { q: "What happens if I cancel?", a: "Cancel anytime. Your data stays accessible for 30 days for export. No hidden fees." }
];

const FAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="nv-section nv-section-soft" id="faq">
      <div className="nv-container nv-container-narrow">

        <div className="nv-section-header">
          <div className="nv-eyebrow">FAQ</div>
          <h2 className="nv-section-title">
            Questions? <span className="nv-gradient-text">We've got answers</span>
          </h2>
        </div>

        <div className="nv-faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`nv-faq-item ${open === i ? 'nv-faq-open' : ''}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{faq.q}</span>
                <ChevronDown size={18} className="nv-faq-chev" />
              </button>
              <div className="nv-faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQ;