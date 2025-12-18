import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Apakah bisa upgrade kapan saja?",
      answer:
        "Ya, Anda bisa upgrade dari plan Free ke Pro atau Lifetime kapan saja. Downgrade dari Pro ke Free akan berlaku pada akhir periode billing.",
    },
    {
      question: "Apakah data trading saya aman?",
      answer:
        "Sangat aman! Semua data trading Anda disimpan secara encrypted dan tidak akan pernah kami share ke pihak manapun.",
    },
    {
      question: "Bagaimana cara pembayaran?",
      answer:
        "Kami menerima berbagai metode pembayaran: transfer bank, e-wallet (Gopay, OVO, Dana), dan kartu kredit.",
    },
    {
      question: "Apakah tersedia trial plan Pro?",
      answer:
        "Saat ini kami belum menyediakan trial plan Pro. Namun Anda bisa berlangganan kapan saja dan langsung mendapatkan akses penuh ke semua fitur premium tanpa batasan.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mb-4">
            Frequently Asked <br /> Questions
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
            Find answers to common questions about Pips Diary and how it can
            help improve your trading performance.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl border border-gray-200 transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
              >
                <h3 className="text-md font-medium text-slate-800 pr-4">
                  {faq.question}
                </h3>
                <div className="shrink-0">
                  {openIndex === index ? (
                    <ChevronUp size={20} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-500" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-slate-600 leading-relaxed font-light">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-6 font-light">
            Still have questions? We're here to help. <br />
            <span
              onClick={() => {}}
              className="font-semibold underline cursor-pointer"
            >
              Contact support
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
