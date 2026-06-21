import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Workflow Builder", href: "/workflows" },
      { label: "Templates", href: "/templates" },
      { label: "Models", href: "/models" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Changelog", href: "/docs" },
      { label: "Community", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Blog", href: "/" },
      { label: "Careers", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas px-6 py-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h6 className="text-xs font-bold uppercase tracking-wide text-body">
                {col.title}
              </h6>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-mute transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-hairline-soft pt-6">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink">
              <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="12" r="2" fill="#f7a501" />
            </svg>
            <span className="text-sm font-bold text-ink">LLM Flow Studio</span>
          </div>
          <p className="text-xs text-mute">&copy; 2026 LLM Flow Studio</p>
        </div>
      </div>
    </footer>
  );
}
