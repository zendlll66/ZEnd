"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EducationSection = ({
  fadeUpVariants,
  educationTimeline = [],
  educationLoading = false,
  educationError = null,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <motion.section
      key={educationLoading ? "education-loading" : "education-loaded"}
      variants={fadeUpVariants}
      className="space-y-8"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">education</p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">เส้นทางการเรียนรู้ที่วางรากฐานความเชี่ยวชาญ</h2>
        <p className="max-w-3xl text-base text-slate-600">
          นอกจากประสบการณ์ทำงาน ยังให้ความสำคัญกับการเรียนรู้ทั้งจากสถาบันและจากโปรเจกต์ที่ลงมือจริง
        </p>
      </div>

      {educationError ? (
        <motion.div
          variants={fadeUpVariants}
          className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-700 shadow-[0_12px_30px_-20px_rgba(180,83,9,0.45)]"
        >
          ไม่สามารถโหลดข้อมูลล่าสุดได้ กำลังแสดงข้อมูลที่มีอยู่ล่าสุดแทน
        </motion.div>
      ) : null}

      <div className="grid gap-6 sm:gap-8">
        {educationLoading
          ? Array.from({ length: 2 }).map((_, index) => (
              <motion.div
                key={`education-skeleton-${index}`}
                variants={fadeUpVariants}
                className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 p-6 sm:p-8 shadow-[0_30px_70px_-60px_rgba(15,23,42,0.75)]"
              >
                <div className="absolute inset-0 bg-linear-to-br from-slate-100/30 via-white/40 to-slate-50/20" />
                <div className="relative space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100/80" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 rounded-full bg-slate-100" />
                        <div className="h-3 w-32 rounded-full bg-slate-100/80" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-3 w-24 rounded-full bg-slate-100/80" />
                      <div className="ml-auto h-5 w-16 rounded-full bg-slate-200/80" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full rounded-full bg-slate-100/80" />
                    <div className="h-3 w-5/6 rounded-full bg-slate-100/70" />
                    <div className="h-3 w-2/3 rounded-full bg-slate-100/60" />
                  </div>
                </div>
              </motion.div>
            ))
          : educationTimeline.map((item) => {
              const isExpanded = expandedId === item.id;

              const toggleExpanded = () => {
                setExpandedId((prev) => (prev === item.id ? null : item.id));
              };

              return (
                <motion.article
                  key={item.id}
                  variants={fadeUpVariants}
                  className="group relative transition"
                >
                  <div className="relative space-y-4">
                    <button
                      type="button"
                      onClick={toggleExpanded}
                      className="flex w-full flex-col gap-4 text-left focus:outline-none sm:gap-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          {item.logo ? (
                            <div className="relative h-18 w-18 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.45)]">
                              <img src={item.logo} alt={item.institution} className="h-full w-full object-contain" loading="lazy" />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-lg font-semibold text-slate-400">
                              {item.initials}
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <div className="flex flex-row items-center gap-2">
                              <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">{item.institution}</h3>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className={`h-6 w-6 transition ${isExpanded ? "rotate-180 text-red-400" : "rotate-0 text-gray-600 group-hover:text-green-400"}`}
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <p className="text-base font-medium text-slate-500">
                              {item.degree}
                              {item.field ? <span className="text-slate-400"> · {item.field}</span> : null}
                            </p>
                            {item.level ? <p className="text-sm text-slate-400">{item.level}</p> : null}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 text-left sm:items-end sm:text-right">
                          {item.period ? (
                            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{item.period}</span>
                          ) : null}
                          {item.gpa ? (
                            <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.7)]">
                              GPA {item.gpa}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <motion.div
                          key="details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="space-y-5 border-t border-slate-200/60 pt-5"
                        >
                          {item.description ? <p className="text-base leading-relaxed text-slate-600">{item.description}</p> : null}
                          {item.proof ? (
                            <a
                              href={item.proof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                            >
                              เอกสารประกอบ
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                <path
                                  fillRule="evenodd"
                                  d="M3 4.25A2.25 2.25 0 015.25 2h6.5A2.25 2.25 0 0114 4.25V6h.75A2.25 2.25 0 0117 8.25v6.5A2.25 2.25 0 0114.75 17h-9.5A2.25 2.25 0 013 14.75v-10.5zM6.5 6a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                                  clipRule="evenodd"
                                />
                                <path d="M15 8.25v6.5a.75.75 0 01-.75.75h-9.5a.75.75 0 01-.75-.75V5.5c0-.414.336-.75.75-.75H12.5c.414 0 .75.336.75.75V6A2.25 2.25 0 0115 8.25z" />
                              </svg>
                            </a>
                          ) : null}
                          {item.achievements?.length ? (
                            <ul className="space-y-2 text-sm text-slate-500">
                              {item.achievements.map((achievement) => (
                                <li key={achievement} className="flex items-start gap-2">
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-900/80" />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {/* {item.user ? (
                            <div className="flex flex-col gap-1 rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3 text-sm text-slate-500 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.55)]">
                              <span className="font-medium text-slate-600">
                                ผู้ดูแลโปรไฟล์: <span className="text-slate-800">{item.user.username}</span>
                              </span>
                              <span className="text-slate-400">{item.user.email}</span>
                            </div>
                          ) : null} */}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </motion.article>
              );
            })}
      </div>
    </motion.section>
  );
};

export default EducationSection;

