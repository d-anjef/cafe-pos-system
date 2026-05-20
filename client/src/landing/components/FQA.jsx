import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './FAQ.css';

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer: "Sign up with your email and start using all Business plan features immediately. No credit card required. After 14 days, you can choose a plan or continue with the free tier."
  },
  {
    question: "Can I switch plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Cash, eSewa, Khalti, QR codes, and international cards through Stripe. All transactions are secure and encrypted."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level encryption (256-bit SSL), secure cloud storage, and regular backups. Your data is stored on secure servers and never shared with third parties."
  },
  {
    question: "Can I manage multiple branches?",
    answer: "Yes! Business and Enterprise plans support multiple branches. You can view consolidated reports or individual branch performance from one dashboard."
  },
  {
    question: "Do I need internet to use the POS?",
    answer: "The system works best with internet for real-time sync, but it has offline mode. Orders are saved locally and automatically synced when you're back online."
  },
  {
    question: "What devices are supported?",
    answer: "Garden & Cafe POS works on any device with a web browser - tablets, smartphones, laptops, and desktop computers. We recommend tablets for waiters and large monitors for kitchen displays."
  },
  {
    question: "Is training provided?",
    answer: "Yes! We provide video tutorials, documentation, and email support for all plans. Business and Enterprise customers get priority support and optional on-site training."
  },
  {
    question: "Can I export my data?",
    answer: "Yes, you can export all your data (orders, reports, analytics) in CSV/Excel format anytime. Enterprise plan includes API access for custom integrations."
  },
  {
    question: "What happens if I cancel?",
    answer: "You can cancel anytime. Your data remains accessible for 30 days after cancellation, giving you time to export everything. No questions asked, no hidden fees."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about Garden & Cafe POS
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  size={24} 
                  className={`faq-icon ${openIndex === index ? 'rotated' : ''}`}
                />
              </button>
              <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <p>Still have questions?</p>
          <a href="/contact" className="faq-contact-btn">Contact Support</a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;