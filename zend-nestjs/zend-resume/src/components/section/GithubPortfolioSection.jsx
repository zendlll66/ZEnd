"use client";

import { motion } from "framer-motion";
import { GitBranch, GitCommit, GitPullRequest, Library, Star, Users } from "lucide-react";
import { useMemo } from "react";

const formatNumber = (value) => {
  if (typeof value !== "number") return "0";
  return value.toLocaleString("en-US");
};

const formatUpdated = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const GithubPortfolioSection = ({
  fadeUpVariants,
  portfolioData,
  loading = false,
  error = null,
}) => {
  const stats = useMemo(() => {
    if (!portfolioData) {
      return [];
    }

    const collection = portfolioData.contributionsCollection || {};

    return [
      {
        label: "Commits",
        value: formatNumber(collection.totalCommitContributions),
        icon: GitCommit,
      },
      {
        label: "Pull Requests",
        value: formatNumber(collection.totalPullRequestContributions),
        icon: GitPullRequest,
      },
      {
        label: "Issues",
        value: formatNumber(collection.totalIssueContributions),
        icon: GitBranch,
      },
      {
        label: "Reviews",
        value: formatNumber(collection.totalPullRequestReviewContributions),
        icon: Library,
      },
      {
        label: "Followers",
        value: formatNumber(portfolioData.followers?.totalCount ?? 0),
        icon: Users,
      },
      {
        label: "Stars received",
        value: formatNumber(portfolioData.starredRepositories?.totalCount ?? 0),
        icon: Star,
      },
    ];
  }, [portfolioData]);

  const repositories = useMemo(() => {
    if (!portfolioData) return [];

    const pinned =
      portfolioData.pinnedItems?.nodes?.filter(Boolean).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        url: item.url,
        forkCount: item.forkCount,
        stargazerCount: item.stargazerCount,
        updatedAt: item.updatedAt,
        language: item.primaryLanguage,
      })) ?? [];

    const topRepos =
      portfolioData.topRepositories?.nodes?.filter(Boolean).map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.url,
        forkCount: repo.forkCount,
        stargazerCount: repo.stargazerCount,
        updatedAt: repo.updatedAt,
        language: repo.primaryLanguage,
      })) ?? [];

    const combined = [...pinned];
    topRepos.forEach((repo) => {
      if (!combined.find((item) => item.id === repo.id)) {
        combined.push(repo);
      }
    });

    return combined.slice(0, 6);
  }, [portfolioData]);

  return (
    <motion.section variants={fadeUpVariants} className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">open source</p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          ผลงานบน GitHub ที่โดดเด่นและสถิติภาพรวม
        </h2>
        <p className="max-w-3xl text-base text-slate-600">
          สรุปการมีส่วนร่วมชุมชน และไฮไลต์โปรเจกต์ที่สร้างผลลัพธ์จริงจากการพัฒนาซอฟต์แวร์
        </p>
      </div>

      {error ? (
        <motion.div
          variants={fadeUpVariants}
          className="rounded-2xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-600 shadow-[0_12px_34px_-24px_rgba(190,18,60,0.35)]"
        >
          ไม่สามารถโหลดข้อมูล GitHub ได้ในขณะนี้
        </motion.div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`stat-skeleton-${index}`}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.4)]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200/80" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded-full bg-slate-200/70" />
                    <div className="h-4 w-16 rounded-full bg-slate-200/60" />
                  </div>
                </div>
              </div>
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeUpVariants}
                  className="group rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.4)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_38px_110px_-75px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-700">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
            โปรเจกต์ที่ภูมิใจ
          </h3>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">public work</span>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`repo-skeleton-${index}`}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-[0_28px_90px_-65px_rgba(15,23,42,0.4)]"
                >
                  <div className="h-4 w-32 rounded-full bg-slate-200/70" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded-full bg-slate-200/60" />
                    <div className="h-3 w-5/6 rounded-full bg-slate-200/50" />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="h-3 w-16 rounded-full bg-slate-200/60" />
                    <div className="h-3 w-12 rounded-full bg-slate-200/50" />
                  </div>
                </div>
              ))
            : repositories.map((repo) => (
                <motion.a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeUpVariants}
                  className="group relative rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_28px_90px_-65px_rgba(15,23,42,0.4)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_38px_120px_-80px_rgba(15,23,42,0.45)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-5 w-5 text-slate-400"
                      >
                        <path d="M4.5 3.75h15a.75.75 0 0 1 .75.75v15.75L12 15l-8.25 5.25V4.5a.75.75 0 0 1 .75-.75Z" />
                      </svg>
                      <span className="text-base font-semibold text-slate-900">{repo.name}</span>
                    </div>
                    {repo.description ? (
                      <p className="text-sm text-slate-600">{repo.description}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {repo.language ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: repo.language?.color ?? "#94a3b8" }}
                          />
                          {repo.language?.name}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {repo.stargazerCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitBranch className="h-3.5 w-3.5" />
                        {repo.forkCount}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        Last update · {formatUpdated(repo.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <span className="pointer-events-none absolute right-5 top-5 text-xs uppercase tracking-[0.3em] text-slate-300 transition group-hover:text-slate-500">
                    visit →
                  </span>
                </motion.a>
              ))}
        </div>
      </div>
    </motion.section>
  );
};

export default GithubPortfolioSection;

