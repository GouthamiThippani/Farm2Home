import React, { useState } from "react";

export default function BuyerHelp() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    { question: "How do I add products to my cart?", answer: "Browse products and click 'Add to Cart' on the items you wish to purchase. Your cart will update instantly." },
    { question: "Can I remove items from my cart?", answer: "Yes, go to the Cart page and click the 'Remove' button on any product to remove it from your cart." },
    { question: "How do I download my bill?", answer: "After generating your bill on the Cart page, click 'Download PDF' to save a copy to your device." },
    { question: "Who can I contact for support?", answer: "You can reach our support team via the contact form below, or email support@farm2home.com." },
    { question: "Are my payments secure?", answer: "Yes, all payments are processed through secure and trusted payment gateways." },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="help-page">
      {/* Header */}
      <header className="help-header">
        <h1>Buyer Help Center</h1>
        <p>Find answers to common questions or reach out to our support team.</p>
      </header>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faqs">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? "active" : ""}`} onClick={() => toggleFAQ(index)}>
              <div className="faq-question">
                {faq.question}
                <span className="faq-toggle">{activeIndex === index ? "-" : "+"}</span>
              </div>
              {activeIndex === index && <div className="faq-answer">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-section">
        <h2>Contact Support</h2>
        <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Thank you! Your message has been sent."); }}>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Farm2Home — Helping buyers shop easily and securely from trusted farmers.</p>
      </footer>

      {/* Styles */}
      <style>{`
        .help-page { font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #f0f4ff, #dbe9ff); min-height: 100vh; padding: 0 20px; display: flex; flex-direction: column; align-items: center; }

        .help-header { text-align: center; margin: 40px 0 20px; }
        .help-header h1 { font-size: 36px; color: #1e40af; margin-bottom: 10px; }
        .help-header p { font-size: 18px; color: #334155; }

        .faq-section { max-width: 800px; width: 100%; margin-bottom: 40px; }
        .faq-section h2 { text-align: center; font-size: 28px; color: #1e3a8a; margin-bottom: 20px; }

        .faqs { display: flex; flex-direction: column; gap: 12px; }
        .faq-item { background: linear-gradient(135deg, #ffffff, #e0f7fa); border-radius: 12px; padding: 14px 20px; cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,0.08); transition: all 0.3s; }
        .faq-item:hover { transform: scale(1.02); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        .faq-question { display: flex; justify-content: space-between; font-weight: 600; color: #1e40af; font-size: 18px; }
        .faq-answer { margin-top: 10px; font-weight: 500; color: #334155; line-height: 1.5; }

        .contact-section { max-width: 600px; width: 100%; margin-bottom: 40px; text-align: center; }
        .contact-section h2 { font-size: 28px; color: #1e3a8a; margin-bottom: 20px; }

        .contact-form { display: flex; flex-direction: column; gap: 12px; }
        .contact-form input, .contact-form textarea { padding: 12px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 16px; transition: all 0.3s; }
        .contact-form input:focus, .contact-form textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 8px rgba(37,99,235,0.3); }
        .contact-form button { padding: 12px 18px; border-radius: 12px; border: none; background: linear-gradient(135deg, #2563eb, #60a5fa); color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s; }
        .contact-form button:hover { transform: scale(1.05); background: linear-gradient(135deg, #1e40af, #3b82f6); }

        .footer { margin-top: auto; padding: 20px 0; text-align: center; color: #334155; font-size: 14px; }
      `}</style>
    </div>
  );
}
