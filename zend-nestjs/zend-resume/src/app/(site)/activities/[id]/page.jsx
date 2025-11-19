"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Award, CalendarClock, Link2, MapPin, Tag as TagIcon, Users } from "lucide-react";
import { getActivityById } from "@/service/profile/activities";
import { Skeleton } from "@/components/ui/skeleton";

const SectionCard = ({ title, children }) => (
  <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.6)] sm:p-8">
    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{title}</p>
    <div className="mt-4 space-y-4 text-slate-600">{children}</div>
  </div>
);

const formatRange = (start, end, isCurrent) => {
  const format = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
  };
  const pieces = [format(start), isCurrent ? "ปัจจุบัน" : format(end)].filter(Boolean);
  return pieces.join(" – ");
};

const ActivityDetailPage = ({ params }) => {
  const resolvedParams = use(params);
  const activityId = resolvedParams?.id;
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadActivity = async () => {
      setLoading(true);
      try {
        const data = await getActivityById(activityId);
        if (!ignore) {
          setActivity(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setActivity(null);
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (activityId) {
      loadActivity();
    }

    return () => {
      ignore = true;
    };
  }, [activityId]);

  const gallery = Array.isArray(activity?.gallery_urls) ? activity.gallery_urls : [];

  const techGroups = useMemo(() => {
    if (!activity?.tech_stack) return [];
    return Object.entries(activity.tech_stack).map(([key, values]) => {
      const entries = Array.isArray(values)
        ? values
        : values
          ?.toString()
          .split(/[,•]/)
          .map((item) => item.trim())
          .filter(Boolean) ?? [];
      return { key, entries };
    });
  }, [activity]);

  const tagList = Array.isArray(activity?.tags) ? activity.tags : [];
  const period = formatRange(activity?.start_date, activity?.end_date, activity?.is_current);

  return (
    <section className="w-full py-24">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          กลับหน้ากิจกรรม
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">/activities/{activityId}</p>
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
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่</div>
      ) : null}

      {!loading && !error && activity ? (
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white/60 shadow-[0_50px_160px_-90px_rgba(15,23,42,0.75)]"
          >
            <div className="relative h-[420px] w-full bg-slate-100">
              {activity?.main_image_url ? (
                <Image
                  src={activity.main_image_url}
                  alt={activity?.title ?? "Activity cover"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-slate-200">{activity?.title?.slice(0, 2)}</div>
              )}
              {activity?.type ? (
                <span className="absolute left-6 top-6 rounded-full border border-white/40 bg-black/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                  {activity.type}
                </span>
              ) : null}
            </div>
            <div className="space-y-4 px-8 py-10 sm:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{activity?.organization}</p>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">{activity?.title}</h1>
                {activity?.role ? (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {activity.role}
                  </span>
                ) : null}
              </div>
              {activity?.description ? <p className="text-lg leading-relaxed text-slate-600">{activity.description}</p> : null}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                {period ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1">
                    <CalendarClock className="size-4 text-slate-400" />
                    {period}
                  </span>
                ) : null}
                {activity?.location ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1">
                    <MapPin className="size-4 text-slate-400" />
                    {activity.location}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {activity?.certificate_url ? (
                  <Link
                    href={activity.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-50 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-amber-700 transition hover:border-amber-600 hover:bg-white"
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
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    <Link2 className="size-4" />
                    Event Site
                  </Link>
                ) : null}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard title="รายละเอียดกิจกรรม">
              <ul className="space-y-3 text-sm font-semibold text-slate-700">
                {activity?.role ? (
                  <li className="flex items-center gap-3">
                    <Users className="size-4 text-slate-400" />
                    <span className="text-slate-400">บทบาท:</span>
                    <span className="text-slate-800">{activity.role}</span>
                  </li>
                ) : null}
                {activity?.achievements ? (
                  <li className="flex items-center gap-3">
                    <Award className="size-4 text-slate-400" />
                    <span className="text-slate-400">Highlight:</span>
                    <span className="text-slate-800">{activity.achievements}</span>
                  </li>
                ) : null}
                {tagList.length ? (
                  <li className="flex flex-wrap items-center gap-2">
                    <TagIcon className="size-4 text-slate-400" />
                    <span className="text-slate-400">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {tagList.map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </li>
                ) : null}
              </ul>
            </SectionCard>
            <SectionCard title="Topics & Stack">
              {techGroups.length ? (
                techGroups.map((group) => (
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
                <p className="text-sm text-slate-500">ไม่มีข้อมูลหัวข้อ</p>
              )}
            </SectionCard>
          </div>

          {gallery.length ? (
            <SectionCard title="Gallery">
              <div className="grid gap-4 sm:grid-cols-3">
                {gallery.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative h-48 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={url} alt={`${activity?.title} image ${index + 1}`} fill className="object-cover transition duration-500 hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
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

export default ActivityDetailPage;

