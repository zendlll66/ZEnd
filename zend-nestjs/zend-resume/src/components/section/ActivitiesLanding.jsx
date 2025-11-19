"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, BookOpenCheck, Filter, Tag as TagIcon } from "lucide-react";
import getActivities from "@/service/profile/activities";
import ActivityCard from "@/components/section/ActivityCard";
import { Skeleton } from "@/components/ui/skeleton";

const ALL_TYPES = "all";

const fallbackActivities = Object.freeze([
  {
    id: 1,
    user_id: "e71bab8d-c763-4a9d-a6d4-0f35c1e26f59",
    title: "Thailand Dev Conference 2024",
    type: "Conference",
    role: "Speaker",
    organization: "GDG Bangkok",
    location: "Bangkok, Thailand",
    start_date: "2024-03-15",
    end_date: "2024-03-17",
    is_current: false,
    description: "การประชุมนักพัฒนาซอฟต์แวร์ที่ใหญ่ที่สุดในประเทศไทย",
    achievements: "ได้รับรางวัล Best Speaker Award",
    tech_stack: {
      tools: ["Git", "Docker", "AWS"],
      topics: ["React", "Node.js", "AI/ML"],
    },
    main_image_url: "https://example.com/conference-main.jpg",
    gallery_urls: ["https://example.com/gallery1.jpg", "https://example.com/gallery2.jpg"],
    certificate_url: "https://example.com/certificate.pdf",
    link: "https://thailanddevconf.com",
    tags: ["conference", "speaker", "AI", "web development"],
    created_at: "2025-10-25T22:31:54.279Z",
    updated_at: "2025-10-25T22:31:54.279Z",
  },
]);

const ActivitiesLanding = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState(ALL_TYPES);

  useEffect(() => {
    let ignore = false;

    const loadActivities = async () => {
      setLoading(true);
      try {
        const data = await getActivities();
        if (!ignore) {
          if (Array.isArray(data) && data.length) {
            setActivities(data);
          } else {
            setActivities(fallbackActivities);
          }
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setActivities(fallbackActivities);
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadActivities();
    return () => {
      ignore = true;
    };
  }, []);

  const typeFilters = useMemo(() => {
    const set = new Set();
    activities.forEach((activity) => {
      if (activity?.type) {
        set.add(activity.type);
      }
    });
    return [ALL_TYPES, ...Array.from(set)];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (activeType === ALL_TYPES) {
      return activities;
    }
    return activities.filter((activity) => activity?.type === activeType);
  }, [activities, activeType]);

  const stats = useMemo(() => {
    const speaking = activities.filter((activity) => activity?.role?.toLowerCase().includes("speak")).length;
    return {
      total: activities.length,
      speaking,
      organizations: new Set(activities.map((activity) => activity?.organization).filter(Boolean)).size,
    };
  }, [activities]);

  const hasContent = filteredActivities.length > 0;

  return (
    <section className="relative w-full py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.045),transparent_65%)]" />
      <div className="space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center space-y-6"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            <BookOpenCheck className="size-4 text-lime-500" />
            Field Activities
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            งานประชุม เวิร์คช็อป และเวทีที่ผมเคยขึ้นพูด
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            ข้อมูลมาจาก API <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">/activities</code> พร้อมรายละเอียดอย่างบทบาท สถานที่
            และเทคโนโลยีที่ผมแชร์
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-slate-100 px-4 py-1.5">ทั้งหมด {stats.total} กิจกรรม</span>
            <span className="rounded-full bg-lime-100/80 px-4 py-1.5 text-lime-700">Speaker {stats.speaking}</span>
            <span className="rounded-full bg-slate-100 px-4 py-1.5">องค์กร {stats.organizations}</span>
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
              <h2 className="text-2xl font-semibold text-slate-900">เลือกประเภทธรรมกิจกรรม</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {typeFilters.map((type) => {
                const isActive = type === activeType;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {type === ALL_TYPES ? <Filter className="size-3.5" /> : <TagIcon className="size-3.5" />}
                    {type === ALL_TYPES ? "ทั้งหมด" : type}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {loading
            ? Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={`activity-skeleton-${index}`} className="h-[500px] rounded-3xl border border-slate-100" />
            ))
            : null}
          {!loading && !hasContent ? (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white/70 px-8 py-12 text-center">
              <p className="text-lg font-semibold text-slate-900">ยังไม่มีข้อมูลกิจกรรมในประเภทนี้</p>
              <p className="mt-2 text-sm text-slate-500">ลองเลือกประเภทอื่น หรือกลับไปดูทั้งหมด</p>
            </div>
          ) : null}
          {!loading && hasContent
            ? filteredActivities.map((activity, index) => (
              <ActivityCard key={activity?.id ?? index} activity={activity} delay={index * 0.08} />
            ))
            : null}
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">More insight</p>
              <h3 className="mt-3 text-3xl font-semibold">ดูรายละเอียดกิจกรรมและรูปประกอบแบบเต็มๆ ที่ /activities/:id</h3>
              <p className="mt-2 text-sm text-white/70">
                มีข้อมูล certificate, tech stack และ gallery เพื่อใช้เป็น evidence ใน portfolio
              </p>
            </div>
            <Link
              href="/activities/1"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide transition hover:bg-white hover:text-slate-900"
            >
              ดูตัวอย่าง
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivitiesLanding;

