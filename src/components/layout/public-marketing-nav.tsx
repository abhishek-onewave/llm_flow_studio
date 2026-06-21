"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/templates" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "#" },
];

export function PublicMarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink">
            <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="12" r="2" fill="#f7a501" />
          </svg>
          <span className="text-base font-bold text-ink">LLM Flow Studio</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-body transition-colors hover:bg-surface-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm font-semibold text-body hover:text-ink md:inline-block"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-full bg-primary-cta px-4 text-sm font-bold text-on-primary transition-colors hover:bg-primary-pressed"
          >
            Get started &mdash; free
          </Link>

          {/* Mobile hamburger */}
          <button
            className="inline-flex size-9 items-center justify-center rounded-md text-ink md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-b border-hairline bg-canvas px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-body hover:bg-surface-soft hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-md px-3 py-2 text-sm font-semibold text-body hover:bg-surface-soft hover:text-ink"
            >
              Log in
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
