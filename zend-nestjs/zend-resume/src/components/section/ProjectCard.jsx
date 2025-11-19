"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Globe, PlayCircle, Tag as TagIcon } from "lucide-react";

const stackFromTech = (techStack) => {
  if (!techStack) return [];
  const groups = ["frontend", "backend", "tools", "languages", "database"];
  return groups
    .flatMap((group) => {
      const value = techStack[group];
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return value
        .toString()
        .split(/[,•]/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    })
    .filter(Boolean);
};

const ProjectCard = ({ project, delay = 0 }) => {
  const tags = Array.isArray(project?.tags) ? project.tags : [];
  const stack = stackFromTech(project?.tech_stack).slice(0, 6);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.55)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_50px_120px_-60px_rgba(15,23,42,0.55)]"
    >
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        {project?.main_image_url ? (
          <Image
            src={project.main_image_url}
            alt={project?.title ?? "Project cover"}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={project?.is_featured}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
            <span className="text-lg font-semibold uppercase tracking-[0.3em]">
              {project?.title?.slice(0, 2) ?? "PR"}
            </span>
          </div>
        )}
        {project?.is_featured ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
            Featured
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-5 px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            {project?.subtitle ? <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{project.subtitle}</p> : null}
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">{project?.title}</h3>
            {project?.duration ? <p className="text-sm text-slate-500">{project.duration}</p> : null}
          </div>
          <Link
            href={`/projects/${project?.id}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            aria-label={`View ${project?.title}`}
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
        {project?.description ? <p className="text-sm text-slate-600">{project.description}</p> : null}
        {stack.length ? (
          <div className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <span
                key={`${project?.id}-${item}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={`${project?.id}-${tag}`}
                href={`/projects/tag/${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
              >
                <TagIcon className="size-3.5" />
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-3 text-slate-600">
          {project?.github_url ? (
            <Link
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            >
              <Github className="size-4" />
              GitHub
            </Link>
          ) : null}
          {project?.demo_url ? (
            <Link
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition hover:border-lime-500/40 hover:bg-lime-50 hover:text-lime-600"
            >
              <Globe className="size-4" />
              Live
            </Link>
          ) : null}
          {project?.video_demo_url ? (
            <Link
              href={project.video_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition hover:border-rose-500/40 hover:bg-rose-50 hover:text-rose-600"
            >
              <PlayCircle className="size-4" />
              Demo
            </Link>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;

