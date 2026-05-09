"use client";

import { Mail, Send, ExternalLink } from "lucide-react";

export function ContactSection() {
  const contacts = [
    {
      label: "Email",
      value: "hello@anan.design",
      href: "mailto:hello@anan.design",
      icon: Mail,
    },
    {
      label: "Instagram",
      value: "@anan.design",
      href: "https://instagram.com/anan.design",
      icon: Send,
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/anan",
      href: "https://linkedin.com/in/anan",
      icon: ExternalLink,
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-12 border-t border-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 
          className="text-5xl md:text-6xl font-black mb-12 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Get in Touch
        </h2>

        <div className="space-y-6">
          {contacts.map(({ label, value, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noreferrer"}
              className="group flex items-center gap-4 py-4 border-b border-gray-900 hover:border-gray-700 transition-colors"
            >
              <Icon className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 group-hover:text-gray-400 transition-colors">{label}</p>
                <p className="text-lg text-gray-300 group-hover:text-white transition-colors">{value}</p>
              </div>
              <span className="text-gray-600 group-hover:text-gray-300 transition-colors">→</span>
            </a>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-900 text-center text-gray-600 text-sm">
          <p>© 2026 Anan. All rights reserved.</p>
        </div>
      </div>
    </section>
  );
}
