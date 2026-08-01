import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Once your order has shipped, you will receive an email with a tracking number. You can use this to follow your delivery in real time.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as PayPal and Apple Pay.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Orders can be changed or cancelled within 1 hour of placing them. Please contact our support team immediately at support@fit-it.com.',
  },
  {
    q: 'How do I know which size to choose?',
    a: 'Check our Size Guide for detailed measurements. If you are between sizes, we recommend sizing up for a more relaxed fit.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes! We ship to over 50 countries. International delivery times and costs vary by destination — see our Delivery Info page for details.',
  },
  {
    q: 'Are your products ethically made?',
    a: 'Absolutely. All FIT-IT garments are produced in certified factories with fair wages and safe working conditions. We are committed to responsible manufacturing.',
  },
  {
    q: 'How do I care for my garments?',
    a: 'Each item includes a care label with specific instructions. As a general rule, we recommend washing on a cold, gentle cycle and air drying to preserve the fabric.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="info-accordion">
      <button className="info-accordion-header" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && <p className="info-accordion-body">{a}</p>}
    </div>
  );
}

function FAQPage() {
  return (
    <div className="info-page">
      <h1>Frequently Asked Questions</h1>
      <p className="info-intro">Can't find what you're looking for? Reach us at support@fit-it.com.</p>
      <div className="info-section">
        {FAQS.map(item => <FAQItem key={item.q} {...item} />)}
      </div>
    </div>
  );
}

export default FAQPage;
