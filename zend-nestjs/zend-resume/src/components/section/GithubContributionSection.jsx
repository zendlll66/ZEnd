"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const CELL_SIZE = 14;
const GAP_SIZE = 4;
const DAY_LABEL_COLUMN_WIDTH = 32;
const GRID_GAP = 12;
const MONTH_LABEL_OFFSET = DAY_LABEL_COLUMN_WIDTH + GRID_GAP;

const GithubContributionSection = ({
  fadeUpVariants,
  calendarData,
  loading = false,
  error = null,
  year,
  yearOptions = [],
  onYearChange,
}) => {
  const { weeks, totalContributions } = useMemo(() => {
    if (!calendarData) {
      return { weeks: [], totalContributions: 0 };
    }

    const weekEntries = calendarData.weeks || [];
    const contributions = calendarData.totalContributions || 0;

    return {
      weeks: weekEntries,
      totalContributions: contributions,
    };
  }, [calendarData]);

  const columnCount = weeks.length || 1;

  const legend = useMemo(() => {
    if (!calendarData?.weeks?.length) return [];
    const colors = new Set();

    calendarData.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (day?.color) {
          colors.add(day.color);
        }
      });
    });

    const entries = Array.from(colors);
    entries.sort((a, b) => {
      const toValue = (color) => {
        const parsed = color.replace("#", "");
        return parseInt(parsed, 16);
      };
      return toValue(a) - toValue(b);
    });

    return entries;
  }, [calendarData]);

  const monthLabels = useMemo(() => {
    if (!weeks.length) return [];

    const labels = [];
    let accumulatedColumns = 0;
    let currentMonth = null;

    weeks.forEach((week) => {
      const firstDay = week.contributionDays?.[0];
      if (!firstDay) return;

      const date = new Date(firstDay.date);
      const month = date.getMonth();

      if (month !== currentMonth) {
        labels.push({
          label: date.toLocaleDateString("en-US", { month: "short" }),
          offset: accumulatedColumns,
        });
        currentMonth = month;
      }

      accumulatedColumns += 1;
    });

    return labels;
  }, [weeks]);

  const dayLabels = useMemo(
    () => [
      { label: "Mon", row: 1 },
      { label: "Wed", row: 3 },
      { label: "Fri", row: 5 },
    ],
    []
  );

  const selectableYears = useMemo(() => {
    if (!yearOptions?.length) {
      return [new Date().getFullYear()];
    }
    return yearOptions;
  }, [yearOptions]);

  const activeYear = year ?? selectableYears[0];

  return (
    <motion.section variants={fadeUpVariants} className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">github activity</p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          ไล่เฉดความถี่การร่วมสร้างในปีที่ผ่านมา
        </h2>
        <p className="max-w-3xl text-base text-slate-600">
          ภาพรวมการมีส่วนร่วมเปิดซอร์สตลอด 12 เดือนล่าสุด เพื่อสะท้อนวินัยและจังหวะการพัฒนา
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-slate-500">
          <span className="uppercase tracking-[0.35em] text-slate-400">ปี</span>
          <div className="flex gap-2">
            {selectableYears.map((optionYear) => {
              const isActive = optionYear === activeYear;
              return (
                <button
                  key={optionYear}
                  type="button"
                  onClick={() => onYearChange?.(optionYear)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.65)]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  }`}
                  disabled={!onYearChange}
                >
                  {optionYear}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <motion.div
          variants={fadeUpVariants}
          className="rounded-2xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-600 shadow-[0_12px_34px_-24px_rgba(190,18,60,0.4)]"
        >
          ไม่สามารถโหลดข้อมูลจาก GitHub ได้ กำลังแสดงข้อมูลสำรอง (หากมี)
        </motion.div>
      ) : null}

        <div className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_40px_110px_-70px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">รวม</p>
            <p className="text-3xl font-semibold text-slate-900">
              {totalContributions.toLocaleString("en-US")} contributions
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Less</span>
            <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-3 py-1 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.4)]">
              {legend.map((color) => (
                <span
                  key={color}
                  className="h-3 w-3 rounded-sm border border-slate-200/50"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="relative overflow-x-auto overflow-y-visible pb-4 pt-5">
          <div className="min-w-[640px] space-y-3">
            <div className="relative h-4">
              {monthLabels.map((month, index) => (
                <span
                  key={`${month.label}-${index}`}
                  className="absolute text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400"
                  style={{
                    left: `${MONTH_LABEL_OFFSET + month.offset * (CELL_SIZE + GAP_SIZE)}px`,
                  }}
                >
                  {month.label}
                </span>
              ))}
            </div>
            <div className="flex" style={{ columnGap: `${GRID_GAP}px` }}>
              <div
                className="flex flex-col justify-between py-[6px] text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400"
                style={{ width: `${DAY_LABEL_COLUMN_WIDTH}px` }}
              >
                {dayLabels.map((day) => (
                  <span key={day.label} className="h-3 leading-none sm:h-3.5">
                    {day.label}
                  </span>
                ))}
              </div>
              <div
                className="grid text-[0px]"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                  gridAutoColumns: `${CELL_SIZE}px`,
                  gridAutoFlow: "column",
                  columnGap: `${GAP_SIZE}px`,
                  rowGap: `${GAP_SIZE}px`,
                }}
              >
                {loading
                  ? Array.from({ length: 52 * 7 }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="rounded-[2px] bg-slate-200/70"
                        style={{
                          width: `${CELL_SIZE}px`,
                          height: `${CELL_SIZE}px`,
                        }}
                      />
                    ))
                  : weeks.map((week, weekIndex) =>
                      week.contributionDays.map((day, dayIndex) => {
                        const key = `${weekIndex}-${day.date}`;
                        const hasContrib = day.contributionCount > 0;
                        const isFocusDay = dayIndex === 0 || dayIndex === 3 || dayIndex === 6;
                        return (
                          <div
                            key={key}
                            className={`group relative rounded-[2px] border border-slate-200/50 transition ${
                              isFocusDay ? "shadow-[0_4px_12px_-8px_rgba(15,23,42,0.4)]" : ""
                            }`}
                            style={{
                              backgroundColor: hasContrib ? day.color : "#e5e7eb",
                              width: `${CELL_SIZE}px`,
                              height: `${CELL_SIZE}px`,
                            }}
                          >
                            <span className="pointer-events-none invisible absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-hover:-translate-y-1 z-10">
                              {day.contributionCount} commits · {formatDate(day.date)}
                            </span>
                          </div>
                        );
                      })
                    )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">ข้อมูลล่าสุดจาก GitHub GraphQL API</p>
      </div>
    </motion.section>
  );
};

export default GithubContributionSection;

