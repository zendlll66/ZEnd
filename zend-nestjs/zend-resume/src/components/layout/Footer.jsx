const Footer = () => {
  const footerSections = [
    {
      title: "Navigation",
      links: [
        { label: "Work", href: "/work" },
        { label: "Activities", href: "/activities" },
        { label: "Gallery", href: "/profile" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Resume", href: "/resume" },
        { label: "GitHub", href: "https://github.com" },
        { label: "LinkedIn", href: "https://www.linkedin.com" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "kittithat.dev@gmail.com", href: "mailto:kittithat.dev@gmail.com" },
        { label: "+66 95 643 3948", href: "tel:+66956433948" },
        { label: "Phitsanulok, Thailand", href: "https://maps.google.com/?q=Phitsanulok" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[2fr,3fr]">
          <div className="space-y-5">
            <div className="text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500">
              ZEnd
            </div>
            <p className="max-w-sm text-base leading-relaxed text-neutral-600">
              Website developer specializing in React, Next.js, and full-stack development. 
              Crafting modern, efficient, and reliable web applications.
            </p>
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} ZEnd. All rights reserved.
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
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="transition duration-200 hover:text-neutral-900 break-words"
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