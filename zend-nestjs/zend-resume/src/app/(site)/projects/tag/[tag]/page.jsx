"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Tag as TagIcon } from "lucide-react";
import { getProjectsByTag } from "@/service/profile/projects";
import ProjectCard from "@/components/section/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";

const TagProjectsPage = ({ params }) => {
  const resolvedParams = use(params);
  const tag = decodeURIComponent(resolvedParams?.tag ?? "");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadProjects = async () => {
      setLoading(true);
      try {
        const data = await getProjectsByTag(tag);
        if (!ignore) {
          setProjects(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setProjects([]);
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (tag) {
      loadProjects();
    }

    return () => {
      ignore = true;
    };
  }, [tag]);

  return (
    <section className="w-full py-24">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            <TagIcon className="size-4 text-lime-500" />
            Tag Filter
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-900 sm:text-5xl">ผลงานแท็ก “{tag}”</h1>
          <p className="mt-2 text-base text-slate-500">ข้อมูลโหลดจากเส้น <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">/projects/tag/{tag}</code></p>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          กลับหน้าหลัก
        </Link>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
          ไม่สามารถโหลดโปรเจคได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={`tag-skeleton-${index}`} className="h-[520px] rounded-3xl border border-slate-100" />
          ))
          : null}
        {!loading && !projects.length ? (
          <motion.div
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            className="col-span-full rounded-3xl border border-slate-200 bg-white/70 px-8 py-12 text-center"
          >
            <p className="text-lg font-semibold text-slate-900">ไม่พบโปรเจคในแท็กนี้</p>
            <p className="mt-2 text-sm text-slate-500">ลองดูแท็กอื่นหรือกลับไปหน้าหลัก</p>
          </motion.div>
        ) : null}
        {!loading && projects.length
          ? projects.map((project, index) => <ProjectCard key={project?.id ?? index} project={project} delay={index * 0.08} />)
          : null}
      </div>
    </section>
  );
};

export default TagProjectsPage;

