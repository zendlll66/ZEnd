"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Cpu, Server, Workflow } from "lucide-react";
import getEducationHistory from "@/service/profile/education-history";
import getWorkExperiences from "@/service/profile/work-experiences";
import getSkillStack from "@/service/profile/skill-stack";
import getGithubContributions from "@/service/profile/github-contributions";
import EducationSection from "@/components/section/EducationSection";
import WorkExperienceSection from "@/components/section/WorkExperienceSection";
import SkillStackSection from "@/components/section/SkillStackSection";
import DisplayCards from "@/components/ui/display-cards";
import GithubContributionSection from "@/components/section/GithubContributionSection";
import GithubLanguagesSection from "@/components/section/GithubLanguagesSection";
import GithubPortfolioSection from "@/components/section/GithubPortfolioSection";
import getGithubPortfolio from "@/service/profile/github-portfolio";
import getProfiles from "@/service/profile/profiles";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 100, y: 32 },
  visible: {
    opacity: 100,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};

const fallbackEducation = [
  {
    id: "fallback-education",
    institution_name: "Chulalongkorn University",
    degree: "Bachelor's",
    field_of_study: "Computer Engineering",
    education_level: "Undergraduate",
    start_date: "2018-09-01",
    end_date: "2022-06-30",
    is_current: false,
    gpa: "3.90",
    description: "Studied computer engineering with focus on software development",
    achievements: "Dean's List for 4 semesters, Graduated with Honors",
    institution_logo_url: "https://example.com/cu-logo.png",
    proof_attachment_url: "https://example.com/transcript.pdf",
  },
];

const fallbackWorkExperiences = [
  {
    id: "fallback-work",
    company_name: "ZenD Labs",
    position: "Lead Backend Developer",
    location: "Phitsanulok, Thailand",
    employment_type: "Full-time",
    start_date: "2021-03-01",
    end_date: null,
    is_current: true,
    description:
      "Architected and delivered scalable backend services powering multiple digital platforms. Championed best practices in code quality, observability, and deployment automation.",
    achievements:
      "Reduced response time by 45%, Implemented blue-green deployment workflow, Delivered cross-team API guidelines adopted company-wide",
    technologies: ["NestJS", "PostgreSQL", "Redis", "AWS", "Docker"],
    company_logo_url: "",
    proof_attachment_url: "",
  },
];

const fallbackSkillStack = {
  description: "ชุดทักษะที่ครอบคลุมทั้งการออกแบบระบบ พัฒนาฟีเจอร์ และการดูแลโครงสร้างพื้นฐาน",
  skills: {
    tools: ["Git", "Docker", "AWS"],
    backend: ["Node.js", "NestJS", "PostgreSQL"],
    frontend: ["React", "Next.js", "TypeScript"],
    languages: ["JavaScript", "TypeScript", "Python"],
  },
};

const dashedGridStyle = {
  backgroundImage: `
    linear-gradient(to right, #e7e5e4 1px, transparent 1px),
    linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
  `,
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 0",
  maskImage: `
    repeating-linear-gradient(
      to right,
      black 0px,
      black 3px,
      transparent 3px,
      transparent 8px
    ),
    repeating-linear-gradient(
      to bottom,
      black 0px,
      black 3px,
      transparent 3px,
      transparent 8px
    ),
    radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,0,0,1) 60%, transparent 100%)
  `,
  WebkitMaskImage: `
    repeating-linear-gradient(
      to right,
      black 0px,
      black 3px,
      transparent 3px,
      transparent 8px
    ),
    repeating-linear-gradient(
      to bottom,
      black 0px,
      black 3px,
      transparent 3px,
      transparent 8px
    ),
    radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,0,0,1) 60%, transparent 100%)
  `,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

const Page = () => {
  const [educationHistory, setEducationHistory] = useState([]);
  const [educationLoading, setEducationLoading] = useState(true);
  const [educationError, setEducationError] = useState(null);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [workLoading, setWorkLoading] = useState(true);
  const [workError, setWorkError] = useState(null);
  const [skillStack, setSkillStack] = useState(null);
  const [skillLoading, setSkillLoading] = useState(true);
  const [skillError, setSkillError] = useState(null);
  const [githubCalendar, setGithubCalendar] = useState(null);
  const [githubLoading, setGithubLoading] = useState(true);
  const [githubError, setGithubError] = useState(null);
  const [githubYear, setGithubYear] = useState(() => new Date().getFullYear());
  const [githubPortfolio, setGithubPortfolio] = useState(null);
  const [githubPortfolioLoading, setGithubPortfolioLoading] = useState(true);
  const [githubPortfolioError, setGithubPortfolioError] = useState(null);
  const [typedRole, setTypedRole] = useState("");
  const [showCaret, setShowCaret] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadEducation = async () => {
      try {
        const data = await getEducationHistory();
        if (!ignore) {
          if (Array.isArray(data) && data.length > 0) {
            setEducationHistory(data);
          } else {
            setEducationHistory(fallbackEducation);
          }
        }
      } catch (error) {
        if (!ignore) {
          setEducationError(error);
          setEducationHistory(fallbackEducation);
        }
      } finally {
        if (!ignore) {
          setEducationLoading(false);
        }
      }
    };

    loadEducation();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadWorkExperiences = async () => {
      try {
        const data = await getWorkExperiences();
        if (!ignore) {
          if (Array.isArray(data) && data.length > 0) {
            setWorkExperiences(data);
          } else {
            setWorkExperiences(fallbackWorkExperiences);
          }
        }
      } catch (error) {
        if (!ignore) {
          setWorkError(error);
          setWorkExperiences(fallbackWorkExperiences);
        }
      } finally {
        if (!ignore) {
          setWorkLoading(false);
        }
      }
    };

    loadWorkExperiences();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadGithubCalendar = async () => {
      setGithubLoading(true);
      try {
        const data = await getGithubContributions("zendlll66", githubYear);
        if (!ignore) {
          setGithubCalendar(data);
          setGithubError(null);
        }
      } catch (error) {
        if (!ignore) {
          setGithubError(error);
        }
      } finally {
        if (!ignore) {
          setGithubLoading(false);
        }
      }
    };

    loadGithubCalendar();

    return () => {
      ignore = true;
    };
  }, [githubYear]);

  useEffect(() => {
    let ignore = false;

    const loadSkillStack = async () => {
      try {
        const data = await getSkillStack();
        if (!ignore) {
          if (data?.skills) {
            setSkillStack(data);
          } else {
            setSkillStack(fallbackSkillStack);
          }
        }
      } catch (error) {
        if (!ignore) {
          setSkillError(error);
          setSkillStack(fallbackSkillStack);
        }
      } finally {
        if (!ignore) {
          setSkillLoading(false);
        }
      }
    };

    loadSkillStack();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadGithubPortfolio = async () => {
      setGithubPortfolioLoading(true);
      try {
        const data = await getGithubPortfolio("zendlll66");
        if (!ignore) {
          setGithubPortfolio(data);
          setGithubPortfolioError(null);
        }
      } catch (error) {
        if (!ignore) {
          setGithubPortfolioError(error);
        }
      } finally {
        if (!ignore) {
          setGithubPortfolioLoading(false);
        }
      }
    };

    loadGithubPortfolio();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const phrases = ["BACK-END", "FRONT-END", "FULL-STACK", "UX/UI DESIGN"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isCancelled = false;

    const type = () => {
      if (isCancelled) return;

      const current = phrases[phraseIndex];

      if (!isDeleting) {
        // Typing
        if (charIndex < current.length) {
          setTypedRole(current.slice(0, charIndex + 1));
          charIndex += 1;
          timeoutRef.current = setTimeout(type, 110);
        } else {
          // Finished typing, pause before deleting
          timeoutRef.current = setTimeout(() => {
            if (!isCancelled) {
              isDeleting = true;
              type();
            }
          }, 2000);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setTypedRole(current.slice(0, charIndex - 1));
          charIndex -= 1;
          timeoutRef.current = setTimeout(type, 50);
        } else {
          // Finished deleting, move to next phrase
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          charIndex = 0;
          timeoutRef.current = setTimeout(type, 100);
        }
      }
    };

    type();

    return () => {
      isCancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const caretTimer = setInterval(() => setShowCaret((prev) => !prev), 520);
    return () => clearInterval(caretTimer);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        const profiles = await getProfiles();
        if (!ignore) {
          if (Array.isArray(profiles) && profiles.length > 0) {
            setProfile(profiles[0]);
          }
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load profile:", error);
        }
      } finally {
        if (!ignore) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const educationTimeline = useMemo(() => {
    return educationHistory.map((item) => {
      const formatDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return value;
        }
        return date.toLocaleDateString("th-TH", {
          month: "short",
          year: "numeric",
        });
      };

      const start = formatDate(item.start_date);
      const end = item.is_current ? "ปัจจุบัน" : formatDate(item.end_date);

      const achievements = item.achievements
        ? item.achievements.split(/[,•]/).map((entry) => entry.trim()).filter(Boolean)
        : [];

      const initials = item.institution
        ? item.institution
          .split(/\s+/)
          .map((word) => word.at(0))
          .filter(Boolean)
          .join("")
          .slice(0, 2)
          .toUpperCase()
        : "ED";

      return {
        id: item.id ?? `${item.institution_name}-${item.start_date}`,
        institution: item.institution_name,
        degree: item.degree,
        field: item.field_of_study,
        level: item.education_level,
        period: [start, end].filter(Boolean).join(" – "),
        gpa: item.gpa,
        description: item.description,
        achievements,
        logo: item.institution_logo_url,
        proof: item.proof_attachment_url,
        initials,
        user: item.user
          ? {
            username: item.user.username,
            email: item.user.email,
            id: item.user.id,
          }
          : null,
      };
    });
  }, [educationHistory]);

  const workTimeline = useMemo(() => {
    return workExperiences.map((item) => {
      const formatDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return value;
        }
        return date.toLocaleDateString("th-TH", {
          month: "short",
          year: "numeric",
        });
      };

      const start = formatDate(item.start_date);
      const end = item.is_current ? "ปัจจุบัน" : formatDate(item.end_date);

      const achievements = Array.isArray(item.achievements)
        ? item.achievements
        : item.achievements
          ?.split(/[,•]/)
          .map((entry) => entry.trim())
          .filter(Boolean) ?? [];

      const technologies = Array.isArray(item.technologies)
        ? item.technologies
        : item.technologies
          ?.toString()
          .split(/[,•]/)
          .map((entry) => entry.trim())
          .filter(Boolean) ?? [];

      const initials = item.company_name
        ?.split(/\s+/)
        .map((word) => word.at(0))
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return {
        id: item.id ?? `${item.company_name}-${item.start_date}`,
        company: item.company_name,
        position: item.position,
        location: item.location,
        employmentType: item.employment_type,
        period: [start, end].filter(Boolean).join(" – "),
        isCurrent: Boolean(item.is_current),
        description: item.description,
        achievements,
        technologies,
        proof: item.proof_attachment_url,
        logo: item.company_logo_url,
        initials: initials || "WK",
      };
    });
  }, [workExperiences]);

  const skillGroups = useMemo(() => {
    const base = skillStack?.skills ?? {};
    const entries = Object.entries(base);

    if (!entries.length) {
      return Object.entries(fallbackSkillStack.skills).map(([key, values]) => ({
        id: `skill-${key}`,
        title: key.replace(/_/g, " "),
        items: values,
      }));
    }

    return entries.map(([key, values]) => {
      const items = Array.isArray(values)
        ? values
        : values?.toString().split(/[,•]/).map((entry) => entry.trim()).filter(Boolean) ?? [];

      const title = key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return {
        id: `skill-${key}`,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        items,
      };
    });
  }, [skillStack]);

  const socialLinks = useMemo(
    () => [
      { 
        label: "Facebook", 
        href: "https://facebook.com/", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        ),
        hoverColor: "hover:text-blue-600"
      },
      { 
        label: "Instagram", 
        href: "https://instagram.com/", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        ),
        hoverColor: "hover:text-[#E4405F]"
      },
      { 
        label: "GitHub", 
        href: "https://github.com/", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        ),
        hoverColor: "hover:text-slate-900"
      },
      { 
        label: "LinkedIn", 
        href: "https://www.linkedin.com/", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        ),
        hoverColor: "hover:text-[#0077B5]"
      },
      { 
        label: "Email", 
        href: "mailto:kittithat.dev@gmail.com", 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        ),
        hoverColor: "hover:text-red-600"
      },
    ],
    []
  );

  const githubYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, index) => currentYear - index);
  }, []);

  const heroCards = useMemo(() => {
    const stackClasses = [
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
      "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
      "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    ];

    return [
      {
        className: stackClasses[0],
        icon: <Cpu className="size-4 text-slate-800" />,
        title: "Architect Systems",
        titleClassName: "text-slate-900",
        description: "Microservices, event-driven, resilient APIs.",
        date: "2019 — Present",
      },
      {
        className: stackClasses[1],
        icon: <Server className="size-4 text-slate-800" />,
        title: "Optimize Delivery",
        titleClassName: "text-slate-900",
        description: "CI/CD pipelines, observability, zero-downtime releases.",
        date: "Ship faster · safer",
      },
      {
        className: stackClasses[2],
        icon: <Workflow className="size-4 text-slate-800" />,
        title: "Lead Collaboration",
        titleClassName: "text-slate-900",
        description: "Mentoring teams while aligning business outcomes.",
        date: "People first mindset",
      },
    ];
  }, []);

  return (
    <div className="relative min-h-screen w-full py-16 sm:py-24">
      <div className="pointer-events-none fixed inset-0 -z-10" style={dashedGridStyle} aria-hidden />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative space-y-16 sm:space-y-20"
      >
        <motion.section
          variants={fadeUpVariants}
          className="relative mt-10  "
        >
          <div className="pointer-events-none absolute inset-0 " />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px " />
          <div className="relative grid gap-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              {profileLoading ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative h-32 w-32 shrink-0 animate-pulse rounded-full bg-slate-200 sm:h-40 sm:w-40"
                />
              ) : profile?.profile_image_url ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)] sm:h-40 sm:w-40"
                >
                  <Image
                    src={profile.profile_image_url}
                    alt={profile.display_name || "Profile"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 128px, 160px"
                    priority
                  />
                </motion.div>
              ) : null}
              <div className="space-y-4 flex-1">
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400 sm:text-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                INTRODUCING
              </motion.p>
              <motion.h1
                className="text-4xl font-black uppercase tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                HI, I'M ZEND
              </motion.h1>
              <motion.p
                className="text-2xl font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                I'M A{" "}
                <span className="inline-flex items-center gap-2 text-lime-500">
                  <span className="inline-block font-bold tracking-[0.05em] text-lime-500 ">
                    {typedRole || "\u00A0"}
                  </span>
                  <span
                    className={`h-7 w-[2px] bg-lime-400 transition-opacity ${showCaret ? "opacity-80" : "opacity-20"}`}
                  />
                </span>
              </motion.p>
              <motion.p
                className="text-2xl font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-3xl"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                WEB DEVELOPER
              </motion.p>
            </div>
            </div>
            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {socialLinks.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.65)] transition hover:-translate-y-1 hover:border-slate-400 ${item.hoverColor}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <span className="sr-only">{item.label}</span>
                  {item.icon}
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          variants={fadeUpVariants}
          className="space-y-8"
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">about me</p>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              เกี่ยวกับฉัน
            </h2>
          </div>
          <div className="">
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              I am a website developer with hands-on experience in frontend design and UX/UI development, specializing in React and Next.js. Additionally, I am currently evolving as a Full-stack Developer with expertise in Node.js, Next.js routing, backend development, and ShadCN. I'm also passionate about web application testing with Cypress, which enhances the efficiency, accuracy, and reliability of systems.
            </p>
          </div>
        </motion.section>

        <EducationSection
          fadeUpVariants={fadeUpVariants}
          educationTimeline={educationTimeline}
          educationLoading={educationLoading}
          educationError={educationError}
        />

        <WorkExperienceSection
          fadeUpVariants={fadeUpVariants}
          workTimeline={workTimeline}
          workLoading={workLoading}
          workError={workError}
        />

        <SkillStackSection
          fadeUpVariants={fadeUpVariants}
          skillGroups={skillGroups}
          skillLoading={skillLoading}
          skillError={skillError}
          skillDescription={skillStack?.description ?? fallbackSkillStack.description}
        />

        <GithubContributionSection
          fadeUpVariants={fadeUpVariants}
          calendarData={githubCalendar}
          loading={githubLoading}
          error={githubError}
          year={githubYear}
          yearOptions={githubYearOptions}
          onYearChange={setGithubYear}
        />

        <GithubLanguagesSection
          fadeUpVariants={fadeUpVariants}
          languageSummary={githubPortfolio?.languageSummary}
          loading={githubPortfolioLoading}
          error={githubPortfolioError}
        />

        <GithubPortfolioSection
          fadeUpVariants={fadeUpVariants}
          portfolioData={githubPortfolio}
          loading={githubPortfolioLoading}
          error={githubPortfolioError}
        />





        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <DisplayCards cards={heroCards} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Page;