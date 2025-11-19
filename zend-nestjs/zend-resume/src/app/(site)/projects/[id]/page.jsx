"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Globe, MapPin, PlayCircle, ShieldCheck, Tag as TagIcon, Users } from "lucide-react";
import { getProjectById } from "@/service/profile/projects";
import { Skeleton } from "@/components/ui/skeleton";

const SectionCard = ({ title, children }) => (
  <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.6)] sm:p-8">
    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{title}</p>
    <div className="mt-4 space-y-4 text-slate-600">{children}</div>
  </div>
);

const ProjectDetailPage = ({ params }) => {
  const resolvedParams = use(params);
  const projectId = resolvedParams?.id;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const loadProject = async () => {
      setLoading(true);
      try {
        const data = await getProjectById(projectId);
        if (!ignore) {
          setProject(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setProject(null);
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    if (projectId) {
      loadProject();
    }
    return () => {
      ignore = true;
    };
  }, [projectId]);

  const stackGroups = useMemo(() => {
    if (!project?.tech_stack) return [];
    return Object.entries(project.tech_stack).map(([key, values]) => {
      const entries = Array.isArray(values)
        ? values
        : values
          ?.toString()
          .split(/[,•]/)
          .map((item) => item.trim())
          .filter(Boolean) ?? [];
      return { key, entries };
    });
  }, [project]);

  const gallery = Array.isArray(project?.gallery_urls) ? project.gallery_urls : [];

  const infoList = useMemo(
    () => [
      { label: "บทบาท", value: project?.role, icon: <Users className="size-4" /> },
      { label: "ระยะเวลา", value: project?.duration, icon: <ShieldCheck className="size-4" /> },
      { label: "แท็ก", value: project?.tags?.join(" • "), icon: <TagIcon className="size-4" /> },
      { label: "หมวดหมู่", value: project?.subtitle, icon: <MapPin className="size-4" /> },
    ],
    [project]
  );

  const actionLinks = [
    project?.github_url
      ? {
        href: project.github_url,
        label: "GitHub",
        icon: <Github className="size-4" />,
        theme: "github",
      }
      : null,
    project?.demo_url
      ? {
        href: project.demo_url,
        label: "Live Demo",
        icon: <Globe className="size-4" />,
        theme: "demo",
      }
      : null,
    project?.video_demo_url
      ? {
        href: project.video_demo_url,
        label: "Video Walkthrough",
        icon: <PlayCircle className="size-4" />,
        theme: "video",
      }
      : null,
  ].filter(Boolean);

  return (
    <section className="w-full py-24">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          กลับหน้ารวม
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">/projects/{projectId}</p>
      </div>
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      ) : null}
      {!loading && error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
          ไม่สามารถโหลดรายละเอียดโปรเจคได้ กรุณาลองอีกครั้ง
        </div>
      ) : null}
      {!loading && !error && project ? (
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white/60 shadow-[0_50px_160px_-90px_rgba(15,23,42,0.75)]"
          >
            <div className="relative h-[420px] w-full bg-slate-100">
              {project?.main_image_url ? (
                <Image
                  src={project.main_image_url}
                  alt={project?.title ?? "Project cover"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-slate-200">
                  {project?.title?.slice(0, 2)}
                </div>
              )}
              {project?.is_featured ? (
                <span className="absolute left-6 top-6 rounded-full border border-white/40 bg-black/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                  Featured
                </span>
              ) : null}
            </div>
            <div className="space-y-4 px-8 py-10 sm:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{project?.subtitle}</p>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">{project?.title}</h1>
              </div>
              {project?.description ? <p className="text-lg leading-relaxed text-slate-600">{project.description}</p> : null}
              {actionLinks.length ? (
                <div className="flex flex-wrap gap-3">
                  {actionLinks.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                        action.theme === "github"
                          ? "border-slate-900 bg-slate-900 text-white hover:bg-transparent hover:text-slate-900"
                          : action.theme === "demo"
                            ? "border-lime-500/40 bg-lime-50 text-lime-600 hover:border-lime-600 hover:bg-white"
                            : "border-rose-500/40 bg-rose-50 text-rose-600 hover:border-rose-600 hover:bg-white"
                      }`}
                    >
                      {action.icon}
                      {action.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard title="Project Brief">
              <p>{project?.description}</p>
              <ul className="space-y-2">
                {infoList
                  .filter((item) => item.value)
                  .map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      {item.icon}
                      <span className="text-slate-400">{item.label}:</span>
                      <span className="text-slate-800">{item.value}</span>
                    </li>
                  ))}
              </ul>
            </SectionCard>
            <SectionCard title="Tech Stack">
              {stackGroups.length ? (
                stackGroups.map((group) => (
                  <div key={group.key}>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{group.key}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.entries.map((item) => (
                        <span key={`${group.key}-${item}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">ไม่ระบุเทคโนโลยี</p>
              )}
            </SectionCard>
          </div>

          {gallery.length ? (
            <SectionCard title="Gallery">
              <div className="grid gap-4 sm:grid-cols-3">
                {gallery.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative h-48 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={image} alt={`${project?.title} screenshot ${index + 1}`} fill className="object-cover transition duration-500 hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default ProjectDetailPage;

