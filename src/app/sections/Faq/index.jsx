"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const faqs = [
  {
    question: "How does RavenAI protect my meeting privacy?",
    answer:
      "RavenAI is privacy-first and open-source. You can self-host the entire infrastructure, ensuring your meeting data never leaves your control. All transcription happens locally or on your own servers.",
  },
  {
    question: "Which meeting platforms does RavenAI support?",
    answer:
      "Currently, we support Google Meet with full bot integration. Zoom and Microsoft Teams support are coming soon (June-July 2025). We also support direct streaming from web/mobile apps.",
  },
  {
    question: "How accurate is the real-time transcription?",
    answer:
      "Our AI-powered transcription uses advanced Whisper technology with 99+ language support. We've implemented hallucination filtering and continuously improve accuracy through community contributions.",
  },
  {
    question: "Can I integrate RavenAI with my existing tools?",
    answer:
      "Yes! RavenAI provides a comprehensive API that allows you to build custom meeting assistants, integrate with n8n workflows, or connect to any system that can consume REST APIs.",
  },
  {
    question: "Is there a free tier or trial available?",
    answer:
      "Yes, you can get started with our self-service API at www.vexa.ai. Get your API key in 3 clicks and start transcribing meetings in under 5 minutes. We also offer self-deployment options for security-minded organizations.",
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto flex flex-col justify-center items-center px-4 py-8" id="faq">
      <div className="flex flex-col mb-6">
        <h2 className="text-center mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-center font-medium text-[20px] md:text-base">
          If you need more help, contact us at support@ravenai.com
        </p>
      </div>

      <div className="border rounded-md">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-300">
            <button
              className="w-full flex justify-between items-center p-4 text-left text-lg font-medium bg-[#E0E0E0] hover:bg-gray-200 transition-all text-[#000]"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="text-xl">
                {openIndex === index ? <FiChevronUp /> : <FiChevronDown />}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-40" : "max-h-0"
              }`}
            >
              <p className="bg-white text-black p-4">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
