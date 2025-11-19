"use client";

import { motion } from "framer-motion";

const SkillStackSection = ({
  fadeUpVariants,
  skillGroups = [],
  skillLoading = false,
  skillError = null,
  skillDescription = "",
}) => {
  return (
    <motion.section
      key={skillLoading ? "skill-loading" : "skill-loaded"}
      variants={fadeUpVariants}
      className="space-y-8"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">skill stack</p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          ทักษะที่พร้อมต่อยอดทุกโปรเจ็กต์
        </h2>
        <p className="max-w-3xl text-base text-slate-600">
          {skillDescription || "ผสมผสานเทคโนโลยีหลากหลายเพื่อสร้างสรรค์งานที่ตอบโจทย์ทั้งฝั่งธุรกิจและผู้ใช้"}
        </p>
      </div>

      {skillError ? (
        <motion.div
          variants={fadeUpVariants}
          className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-700 shadow-[0_12px_30px_-20px_rgba(180,83,9,0.45)]"
        >
          ไม่สามารถโหลดชุดทักษะล่าสุดได้ กำลังแสดงข้อมูลที่มีอยู่ล่าสุดแทน
        </motion.div>
      ) : null}

      {skillLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={`skill-skeleton-${index}`}
              variants={fadeUpVariants}
              className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_30px_70px_-65px_rgba(15,23,42,0.7)]"
            >
              <div className="absolute inset-0 bg-slate-100/10" />
              <div className="relative space-y-4">
                <div className="h-4 w-32 rounded-full bg-slate-100" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((__, pillIndex) => (
                    <span
                      key={`pill-${index}-${pillIndex}`}
                      className="inline-flex h-7 w-20 animate-pulse rounded-full bg-slate-200/70"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {skillGroups.map((group) => {
            return (
              <motion.div
                key={group.id}
                variants={fadeUpVariants}
                className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 p-6 sm:p-8 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.55)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_45px_110px_-80px_rgba(15,23,42,0.6)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.15),transparent_55%)] blur-3xl opacity-0 transition group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
                <div className="relative space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-400">Category</p>
                      <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">{group.title}</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.6)]">
                      {group.items.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_35px_-32px_rgba(15,23,42,0.55)] transition group-hover:border-slate-300"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900/70" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
};

export default SkillStackSection;

