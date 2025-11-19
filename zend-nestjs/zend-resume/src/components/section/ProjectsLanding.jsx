"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Filter, Sparkles, Tag as TagIcon } from "lucide-react";
import getProjects from "@/service/profile/projects";
import ProjectCard from "@/components/section/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";

const ALL_TAG = "all";

const fallbackProjects = Object.freeze([
  {
    id: 3,
    user_id: "e71bab8d-c763-4a9d-a6d4-0f35c1e26f59",
    title: "ZEND Premium Platform",
    subtitle: "ระบบจัดการสมาชิกและสินค้า",
    description: "แพลตฟอร์มสำหรับจัดการสมาชิกและสินค้าออนไลน์ พร้อมระบบชำระเงินและรายงาน",
    main_image_url: "https://example.com/project-main.jpg",
    gallery_urls: [
      "https://example.com/gallery1.jpg",
      "https://example.com/gallery2.jpg",
      "https://example.com/gallery3.jpg",
    ],
    tech_stack: {
      tools: ["Docker", "AWS", "Git"],
      backend: ["Node.js", "NestJS", "PostgreSQL"],
      frontend: ["React", "TypeScript", "Tailwind CSS"],
    },
    role: "Full Stack Developer",
    duration: "Jan 2024 - Jul 2024",
    github_url: "https://github.com/user/zend-platform",
    demo_url: "https://zend-platform-demo.com",
    video_demo_url: "https://youtube.com/watch?v=demo",
    is_featured: true,
    tags: ["web app", "api", "dashboard", "e-commerce"],
    created_at: "2025-10-25T22:20:44.134Z",
    updated_at: "2025-10-25T22:20:44.134Z",
  },
  {
    id: 2,
    user_id: "e71bab8d-c763-4a9d-a6d4-0f35c1e26f59",
    title: "ZEND Premium Platform",
    subtitle: "ระบบจัดการสมาชิกและสินค้า",
    description: "แพลตฟอร์มสำหรับจัดการสมาชิกและสินค้าออนไลน์ พร้อมระบบชำระเงินและรายงาน",
    main_image_url: "https://example.com/project-main.jpg",
    gallery_urls: [
      "https://example.com/gallery1.jpg",
      "https://example.com/gallery2.jpg",
      "https://example.com/gallery3.jpg",
    ],
    tech_stack: {
      tools: ["Docker", "AWS", "Git"],
      backend: ["Node.js", "NestJS", "PostgreSQL"],
      frontend: ["React", "TypeScript", "Tailwind CSS"],
    },
    role: "Full Stack Developer",
    duration: "Jan 2024 - Jul 2024",
    github_url: "https://github.com/user/zend-platform",
    demo_url: "https://zend-platform-demo.com",
    video_demo_url: "https://youtube.com/watch?v=demo",
    is_featured: true,
    tags: ["web app", "api", "dashboard", "e-commerce"],
    created_at: "2025-10-25T22:20:42.556Z",
    updated_at: "2025-10-25T22:20:42.556Z",
  },
]);

const ProjectsLanding = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState(ALL_TAG);

  useEffect(() => {
    let ignore = false;

    const loadProjects = async () => {
      setLoading(true);
      try {
        const data = await getProjects();
        if (!ignore) {
          if (Array.isArray(data) && data.length) {
            setProjects(data);
          } else {
            setProjects(fallbackProjects);
          }
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setProjects(fallbackProjects);
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProjects();
    return () => {
      ignore = true;
    };
  }, []);

  const allTags = useMemo(() => {
    const collected = new Set();
    projects.forEach((project) => {
      if (Array.isArray(project?.tags)) {
        project.tags.forEach((tag) => collected.add(tag));
      }
    });
    return [ALL_TAG, ...Array.from(collected)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeTag === ALL_TAG) {
      return projects;
    }
    return projects.filter((project) => project?.tags?.includes(activeTag));
  }, [projects, activeTag]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      featured: projects.filter((item) => item?.is_featured).length,
      tags: allTags.length - 1,
    }),
    [projects, allTags]
  );

  const hasContent = filteredProjects.length > 0;

  return (
    <section className="relative w-full py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_60%)]" />
      <div className="space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center space-y-6"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            <Sparkles className="size-4 text-lime-500" />
            Selected Work
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            ระบบที่ผมออกแบบ และลงมือสร้างตั้งแต่ API จนถึง UI
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            ดึงข้อมูลจริงจาก API <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">/projects</code> และสามารถกรองตามแท็กด้วยเส้น
            <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-sm">/projects/tag/:tag</code>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-4 py-1.5">ทั้งหมด {stats.total} โปรเจค</span>
            <span className="rounded-full bg-lime-100/80 px-4 py-1.5 text-lime-700">Featured {stats.featured}</span>
            <span className="rounded-full bg-slate-100 px-4 py-1.5">แท็ก {stats.tags}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.6)] sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Filter</p>
              <h2 className="text-2xl font-semibold text-slate-900">กรองตามประเภทงาน</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isActive = tag === activeTag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {tag === ALL_TAG ? <Filter className="size-3.5" /> : <TagIcon className="size-3.5" />}
                    {tag === ALL_TAG ? "ทั้งหมด" : tag}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {loading
            ? Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={`project-skeleton-${index}`} className="h-[520px] rounded-3xl border border-slate-100" />
            ))
            : null}
          {!loading && !hasContent ? (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white/70 px-8 py-12 text-center">
              <p className="text-lg font-semibold text-slate-900">ยังไม่มีโปรเจคในแท็กนี้</p>
              <p className="mt-2 text-sm text-slate-500">ลองเลือกแท็กอื่น หรือกลับไปดูทั้งหมด</p>
              <Link
                href="/projects"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-transparent hover:text-slate-900"
              >
                กลับไปที่ทั้งหมด
              </Link>
            </div>
          ) : null}
          {!loading && hasContent
            ? filteredProjects.map((project, index) => (
              <ProjectCard key={project?.id ?? index} project={project} delay={index * 0.08} />
            ))
            : null}
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Need more context?</p>
              <h3 className="mt-3 text-3xl font-semibold">คลิกเข้าไปดูรายละเอียดแต่ละโปรเจคใน /projects/:id</h3>
              <p className="mt-2 text-sm text-white/70">
                มีภาพ, tech stack, role และลิงก์ demo ให้พร้อม แถมสามารถดู gallery เพิ่มเติมได้
              </p>
            </div>
            <Link
              href="/projects/tag/web%20app"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide transition hover:bg-white hover:text-slate-900"
            >
              ลองดูแท็ก web app
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsLanding;

