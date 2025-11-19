"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Award, CalendarDays, MapPin, Tag as TagIcon } from "lucide-react";

const formatDateRange = (start, end, isCurrent) => {
  const format = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const startFormatted = format(start);
  const endFormatted = isCurrent ? "ปัจจุบัน" : format(end);
  return [startFormatted, endFormatted].filter(Boolean).join(" – ");
};

const flattenTech = (techStack) => {
  if (!techStack) return [];
  return Object.values(techStack)
    .flatMap((value) => {
      if (Array.isArray(value)) return value;
      return value?.toString().split(/[,•]/).map((entry) => entry.trim()) ?? [];
    })
    .filter(Boolean)
    .slice(0, 6);
};

const ActivityCard = ({ activity, delay = 0 }) => {
  const tags = Array.isArray(activity?.tags) ? activity.tags : [];
  const techEntries = flattenTech(activity?.tech_stack);
  const period = formatDateRange(activity?.start_date, activity?.end_date, activity?.is_current);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/85 shadow-[0_30px_120px_-70px_rgba(15,23,42,0.55)] transition hover:-translate-y-1 hover:border-slate-300"
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        {activity?.main_image_url ? (
          <Image
            src={activity.main_image_url}
            alt={activity?.title ?? "Activity cover"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={Boolean(activity?.is_featured)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
            <span className="text-xl font-black tracking-[0.3em]">{activity?.title?.slice(0, 2) ?? "AC"}</span>
          </div>
        )}
        {activity?.type ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            {activity.type}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-5 px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{activity?.organization}</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">{activity?.title}</h3>
            <p className="text-sm text-slate-500">{activity?.role}</p>
          </div>
          <Link
            href={`/activities/${activity?.id}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            aria-label={`View ${activity?.title}`}
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>

        {activity?.description ? <p className="text-sm text-slate-600">{activity.description}</p> : null}

        <div className="grid gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-2">
          {period ? (
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-400" />
              {period}
            </div>
          ) : null}
          {activity?.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-slate-400" />
              {activity.location}
            </div>
          ) : null}
        </div>

        {techEntries.length ? (
          <div className="flex flex-wrap gap-2">
            {techEntries.map((item) => (
              <span key={`${activity?.id}-${item}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={`${activity?.id}-${tag}`} className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <TagIcon className="size-3.5" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-3">
          {activity?.certificate_url ? (
            <Link
              href={activity.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 transition hover:border-amber-500 hover:bg-white"
            >
              <Award className="size-4" />
              Certificate
            </Link>
          ) : null}
          {activity?.link ? (
            <Link
              href={activity.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
            >
              Website
            </Link>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
};

export default ActivityCard;

