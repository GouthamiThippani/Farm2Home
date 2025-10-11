import React, { useEffect, useState } from "react";

export default function Help() {
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) =>
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));

  const faqs = [
    {
      question: "How can I list my products?",
      answer:
        "Go to the 'Sell Products' page, fill in product details, upload an image, and click Add Product.",
    },
    {
      question: "How do I check market prices?",
      answer:
        "Visit the 'Market Prices' page to see current prices for various crops in different regions.",
    },
    {
      question: "How can I contact support?",
      answer:
        "Reach us via phone, email, or our social media channels listed below.",
    },
    {
      question: "How do I track my sales?",
      answer:
        "The 'Analytics' page provides detailed insights and charts for your sold products.",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-section").forEach((section) => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100)
          section.classList.add("visible");
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="help-page">
      <section className="fade-section hero-section">
        <h1 className="hero-title">Need Assistance?</h1>
        <p className="hero-subtitle">
          Facing any issues or have questions? Our team is ready to assist you
          in multiple languages.
        </p>
      </section>

      <section className="fade-section help-grid">
        <div className="help-card">
          <h3>📍 Our Main Office</h3>
          <p>Hyderabad, India</p>
        </div>
        <div className="help-card">
          <h3>📞 Phone Number</h3>
          <p>+91 789xx xxxxx(Toll-Free)</p>
        </div>
        <div className="help-card">
          <h3>💬 Facebook</h3>
          <p>facebook.com/Farm2Home</p>
        </div>
        <div className="help-card">
          <h3>📧 Email</h3>
          <p>support@farm2home.com</p>
        </div>
      </section>

      <section className="fade-section faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`faq-card ${faqOpen[i] ? "open" : ""}`}
            onClick={() => toggleFaq(i)}
          >
            <h4>{faq.question}</h4>
            <p>{faqOpen[i] ? faq.answer : ""}</p>
          </div>
        ))}
      </section>

      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; font-family:'Poppins', sans-serif; }
        .help-page { min-height:100vh; background:#f0f7ff; color:#1e293b; display:flex; flex-direction:column; align-items:center; padding:40px 20px; }

        .fade-section { opacity:0; transform:translateY(20px); transition:0.6s ease-out; }
        .fade-section.visible { opacity:1; transform:translateY(0); }

        .hero-section { text-align:center; margin-bottom:50px; animation: fadeIn 1s ease-out; }
        .hero-title { font-size:36px; color:#2563eb; margin-bottom:12px; animation: bounceIn 1s; }
        .hero-subtitle { font-size:18px; color:#475569; animation: fadeIn 2s; }

        .help-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; width:100%; max-width:900px; margin-bottom:50px; }
        .help-card { background:#ffffff; padding:25px; border-radius:20px; text-align:center; box-shadow:0 6px 18px rgba(0,0,0,0.08); transition:0.3s, transform 0.3s; cursor:pointer; animation: fadeInUp 1s ease; }
        .help-card:hover { transform:translateY(-8px) scale(1.03); box-shadow:0 12px 25px rgba(0,0,0,0.15); }
        .help-card h3 { margin-bottom:12px; color:#2563eb; font-size:18px; }
        .help-card p { color:#475569; font-size:14px; }

        .faq-section { width:100%; max-width:700px; }
        .faq-title { font-size:28px; color:#2563eb; text-align:center; margin-bottom:24px; }
        .faq-card { background:#ffffff; margin:12px 0; padding:18px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); cursor:pointer; transition:0.3s, transform 0.3s; }
        .faq-card:hover { transform:translateX(4px); box-shadow:0 8px 20px rgba(0,0,0,0.12); }
        .faq-card h4 { font-size:16px; color:#2563eb; }
        .faq-card p { margin-top:8px; color:#475569; font-size:14px; line-height:1.5; display:block; animation: fadeIn 0.3s; }

        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
        @keyframes fadeInUp { from {opacity:0; transform:translateY(20px);} to {opacity:1; transform:translateY(0);} }
        @keyframes bounceIn { 0% {opacity:0; transform:scale(0.3);} 50% {opacity:1; transform:scale(1.05);} 70% {transform:scale(0.9);} 100% {transform:scale(1);} }
      `}</style>
    </div>
  );
}
