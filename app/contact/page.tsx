"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectLabels: Record<string, string> = {
    feedback: "Feedback",
    bug: "Bug Report",
    feature: "Feature Request",
    other: "Other",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subjectText = `[EmotiArt ${subjectLabels[formData.subject] || formData.subject}] Message from ${formData.name}`;

    const web3FormsData = {
      access_key: "ae0d5150-4a25-4463-956e-512ccc5a7141",
      to: "jaisamadhiya@gmail.com",
      subject: subjectText,
      from_name: "EmotiArt Contact Form",
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(web3FormsData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        throw new Error("Form submission failed");
      }
    } catch {
      // Fallback to mailto if Web3Forms fails
      const bodyText = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
      const mailtoLink = `mailto:jaisamadhiya@gmail.com?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
      window.location.href = mailtoLink;
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0f]">
      <Navbar />

      <main className="flex-1 overflow-y-auto px-6 py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="font-sans font-bold text-3xl md:text-4xl text-white mb-4 text-center">
            Get in Touch
          </h1>
          <p className="font-sans text-white/60 text-center mb-12">
            Have questions, feedback, or just want to say hello? We&apos;d love to
            hear from you.
          </p>

          {isSubmitted ? (
            <div className="p-8 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center overflow-visible">
              <div className="w-16 h-16 rounded-full bg-[#06AED4]/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#06AED4]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="font-sans font-semibold text-xl text-white mb-2">
                Message Sent!
              </h2>
              <p className="font-sans text-white/60 mb-6 leading-relaxed">
                Thank you for reaching out.
                <br />
                We&apos;ll get back to you soon.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: "", email: "", subject: "", message: "" });
                }}
                className="font-sans text-sm text-[#06AED4] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block font-sans text-sm text-white/80 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white font-sans text-sm placeholder:text-white/30 focus:outline-none focus:border-[#06AED4]/50 focus:ring-1 focus:ring-[#06AED4]/50 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block font-sans text-sm text-white/80 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white font-sans text-sm placeholder:text-white/30 focus:outline-none focus:border-[#06AED4]/50 focus:ring-1 focus:ring-[#06AED4]/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block font-sans text-sm text-white/80 mb-2"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white font-sans text-sm focus:outline-none focus:border-[#06AED4]/50 focus:ring-1 focus:ring-[#06AED4]/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#16161a]">
                    Select a subject
                  </option>
                  <option value="feedback" className="bg-[#16161a]">
                    Feedback
                  </option>
                  <option value="bug" className="bg-[#16161a]">
                    Bug Report
                  </option>
                  <option value="feature" className="bg-[#16161a]">
                    Feature Request
                  </option>
                  <option value="other" className="bg-[#16161a]">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block font-sans text-sm text-white/80 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white font-sans text-sm placeholder:text-white/30 focus:outline-none focus:border-[#06AED4]/50 focus:ring-1 focus:ring-[#06AED4]/50 transition-colors resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-white text-black font-sans font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
