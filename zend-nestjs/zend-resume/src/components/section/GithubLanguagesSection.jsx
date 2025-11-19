"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const LANGUAGE_LIMIT = 8;

const defaultColor = "#cbd5f5";

const formatBytes = (value) => {
  const size = Number(value);
  if (!size || Number.isNaN(size)) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let display = size;
  let unitIndex = 0;

  while (display >= 1024 && unitIndex < units.length - 1) {
    display /= 1024;
    unitIndex += 1;
  }

  const digits = display < 10 && unitIndex > 0 ? 1 : 0;
  return `${display.toFixed(digits)} ${units[unitIndex]}`;
};

const GithubLanguagesSection = ({
  fadeUpVariants,
  languageSummary,
  loading = false,
  error = null,
}) => {
  const totalBytes = languageSummary?.totalBytes ?? 0;
  const repositoriesAnalyzed = languageSummary?.repositoriesAnalyzed ?? 0;
  const rawLanguages = languageSummary?.languages ?? [];

  const languages = useMemo(() => {
    if (!rawLanguages.length) return [];

    return rawLanguages.map((language) => ({
      ...language,
      percentage: Number(language.percentage?.toFixed(2) ?? 0),
      color: language.color || defaultColor,
    }));
  }, [rawLanguages]);

  const topLanguages = useMemo(() => {
    if (!languages.length) return [];

    const top = languages.slice(0, LANGUAGE_LIMIT);
    const remainderPercentage = languages
      .slice(LANGUAGE_LIMIT)
      .reduce((sum, lang) => sum + lang.percentage, 0);

    if (remainderPercentage > 0) {
      top.push({
        name: "Other",
        color: "#e2e8f0",
        totalBytes: (remainderPercentage / 100) * totalBytes,
        repoCount: Math.max(repositoriesAnalyzed - LANGUAGE_LIMIT, 0),
        percentage: Number(remainderPercentage.toFixed(2)),
        isOther: true,
      });
    }

    return top;
  }, [languages, totalBytes, repositoriesAnalyzed]);

  const stackedBarSegments = useMemo(() => {
    if (!topLanguages.length) return [];

    const totalPercentage = topLanguages.reduce((sum, lang) => sum + lang.percentage, 0) || 100;

    return topLanguages.map((lang) => ({
      ...lang,
      width: `${(lang.percentage / totalPercentage) * 100}%`,
    }));
  }, [topLanguages]);

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="h-3 w-full rounded-full bg-slate-200/60" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: LANGUAGE_LIMIT }).map((_, index) => (
          <div
            key={`language-skeleton-${index}`}
            className="space-y-2 rounded-xl border border-slate-200/60 bg-white/60 p-4"
          >
            <div className="h-4 w-2/5 rounded-full bg-slate-200/70" />
            <div className="h-2 w-full rounded-full bg-slate-200/60" />
            <div className="h-3 w-3/5 rounded-full bg-slate-200/50" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderLanguageCards = () => {
    if (!languages.length) {
      return (
        <p className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
          ยังไม่พบข้อมูลภาษาใน GitHub repository ของคุณ
        </p>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {topLanguages.map((language) => (
          <div
            key={language.name}
            className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.55)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: language.color }}
                />
                <p className="text-sm font-semibold text-slate-900">{language.name}</p>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {language.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.min(language.percentage, 100)}%`,
                  backgroundColor: language.color,
                }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {language.isOther
                ? "รวมภาษาอื่น ๆ"
                : `${language.repoCount} repos · ${formatBytes(language.totalBytes)}`}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.section variants={fadeUpVariants} className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">language mix</p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          ใช้ภาษาอะไรบ่อยสุดใน GitHub repos
        </h2>
        <p className="max-w-3xl text-base text-slate-600">
          แสดงสัดส่วนภาษาโปรแกรมมิ่งจากทุก repository สาธารณะเพื่อสะท้อนสไตล์การพัฒนา
        </p>
      </div>

      {error ? (
        <motion.div
          variants={fadeUpVariants}
          className="rounded-2xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-600 shadow-[0_12px_34px_-24px_rgba(190,18,60,0.35)]"
        >
          ไม่สามารถโหลดข้อมูลภาษาได้ในขณะนี้
        </motion.div>
      ) : null}

      <div className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_40px_110px_-70px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">repositories</p>
            <p className="text-lg font-semibold text-slate-900">{repositoriesAnalyzed} projects</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">languages</p>
            <p className="text-lg font-semibold text-slate-900">{languages.length || 0} detected</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">source size</p>
            <p className="text-lg font-semibold text-slate-900">{formatBytes(totalBytes)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex h-4 w-full overflow-hidden rounded-full border border-slate-200/80 bg-slate-50">
            {stackedBarSegments.length
              ? stackedBarSegments.map((segment) => (
                  <span
                    key={segment.name}
                    className="h-full"
                    style={{
                      width: segment.width,
                      backgroundColor: segment.color,
                    }}
                  />
                ))
              : null}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {topLanguages.map((language) => (
              <span key={`${language.name}-legend`} className="inline-flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: language.color }}
                />
                {language.name} ({language.percentage.toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>

        {loading ? renderSkeleton() : renderLanguageCards()}
      </div>
    </motion.section>
  );
};

export default GithubLanguagesSection;


