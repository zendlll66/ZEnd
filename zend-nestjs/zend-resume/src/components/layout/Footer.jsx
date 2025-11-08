const Footer = () => {
  const footerSections = [
    {
      title: "Studio",
      links: [
        { label: "Our Story", href: "#about" },
        { label: "Process", href: "#process" },
        { label: "Careers", href: "#careers" },
      ],
    },
    {
      title: "Work",
      links: [
        { label: "Case Studies", href: "#work" },
        { label: "Clients", href: "#clients" },
        { label: "Testimonials", href: "#testimonials" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Email", href: "mailto:hello@zend.studio" },
        { label: "LinkedIn", href: "https://www.linkedin.com" },
        { label: "Dribbble", href: "https://dribbble.com" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[2fr,3fr]">
          <div className="space-y-5">
            <div className="text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500">
              ZEnd Studio
            </div>
            <p className="max-w-sm text-base leading-relaxed text-neutral-600">
              We craft minimal, human-centered digital experiences for brands
              that want to leave a timeless impression.
            </p>
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} ZEnd Studio. All rights reserved.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
                  {section.title}
                </div>
                <ul className="space-y-3 text-sm text-neutral-600">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="transition duration-200 hover:text-neutral-900"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;