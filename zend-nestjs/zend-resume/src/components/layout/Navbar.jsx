"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Images, Code, Award, Mail } from "lucide-react";

const overlayVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: "easeOut",
      duration: 0.24,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      ease: "easeIn",
      duration: 0.18,
    },
  },
};

const listVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + index * 0.04,
      duration: 0.22,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, y: 8, transition: { duration: 0.18, ease: "easeIn" } },
};

const Navbar = () => {
  const navItems = useMemo(
    () => [
      { label: "Work", href: "/work", icon: Code },
      { label: "Activities", href: "/activities", icon: Award },
      // { label: "Expertise", href: "#expertise" },
      // { label: "About", href: "#about" },
      { label: "Contact", href: "/contact", icon: Mail },
    ],
    []
  );
  const [isMobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleToggle = () => setMobileOpen((prev) => !prev);
  const handleClose = () => setMobileOpen(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-10 border-b border-white/10 bg-white/70 backdrop-blur"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="relative flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-neutral-900 transition duration-200 hover:text-neutral-600"
            onClick={handleClose}
          >
            ZEnd
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex items-center gap-2 transition duration-200 hover:text-neutral-900"
                  onClick={handleClose}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <Icon className="h-4 w-4 transition-transform duration-200 group-hover:text-lime-500" />
                  </motion.div>
                  <span className="relative">
                    {item.label}
                    <motion.span
                      className="absolute bottom-0 left-0 h-[2px] w-0 bg-lime-500"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-full border border-neutral-900/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition duration-200 hover:border-lime-500/50 hover:bg-lime-50 hover:text-lime-700 md:inline-flex"
                onClick={handleClose}
              >
                <motion.div whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
                  <Images className="h-4 w-4" />
                </motion.div>
                Gallery
              </Link>
            </motion.div>
            <Link
              href="/resume"
              className="hidden rounded-full border border-neutral-900/10 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:border-neutral-900 hover:bg-neutral-800 md:inline-flex"
              onClick={handleClose}
            >
              Resume
            </Link>
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex z-60 h-10 w-10 items-center justify-center rounded-full border border-neutral-900/10 bg-white text-neutral-900 transition duration-200 hover:border-neutral-900/30 hover:text-neutral-700 md:hidden"
              aria-expanded={isMobileOpen}
              aria-label="Toggle navigation"
            >
              <span className="relative block h-3.5 w-4">
                <span
                  className={`absolute inset-x-0 top-0 h-[2px] w-full origin-center bg-current transition-transform duration-200 ${
                    isMobileOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-current transition-opacity duration-200 ${
                    isMobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-[2px] w-full origin-center bg-current transition-transform duration-200 ${
                    isMobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                key="mobile-nav"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={overlayVariants}
                className="fixed inset-0 z-50  overflow-y-auto h-screen border-t border-neutral-900/10 bg-white px-6 py-24 shadow-lg  md:hidden"
              >
                <div className="mx-auto max-w-2xl space-y-8">
                  <div className="space-y-4">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.href}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={listVariants}
                        >
                          <Link
                            href={item.href}
                            className="group flex items-center gap-3 text-lg font-medium text-neutral-900 transition duration-200 hover:text-neutral-600"
                            onClick={handleClose}
                          >
                            <motion.div
                              whileHover={{ scale: 1.15, rotate: 5 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <Icon className="h-5 w-5 transition-colors duration-200 group-hover:text-lime-500" />
                            </motion.div>
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: 0.22, duration: 0.2, ease: "easeOut" }}
                  >
                    <Link
                      href="#consult"
                      className="flex w-full items-center justify-center rounded-full border border-neutral-900/10 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition duration-200 hover:border-neutral-900 hover:bg-neutral-800"
                      onClick={handleClose}
                    >
                      Book a Call
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </motion.header>
  );
};

export default Navbar;