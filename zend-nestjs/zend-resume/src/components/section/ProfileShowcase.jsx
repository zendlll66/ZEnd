"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, Menu, MoreHorizontal } from "lucide-react";
import getProfiles from "@/service/profile/profiles";
import { Skeleton } from "@/components/ui/skeleton";

const fallbackProfile = Object.freeze({
  id: 2,
  display_name: "ZEnd",
  profile_image_url: "https://example.com/profile-image.jpg",
  bio: "คำอธิบายสั้นๆ เกี่ยวกับตัวคุณ",
  post_count: 1,
  work_count: 0,
  personal_count: 0,
  posts: [
    {
      id: 3,
      image_url: "https://example.com/image.jpg",
      description: "คำอธิบายรูป",
      ratio_width: 4,
      ratio_height: 5,
      category: "catalog",
    },
  ],
});

const ratioToAspect = (width = 1, height = 1) => {
  if (!width || !height) {
    return "4 / 5";
  }
  return `${width} / ${height}`;
};

const ProfileShowcase = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profiles = await getProfiles();
        if (!ignore) {
          if (Array.isArray(profiles) && profiles.length) {
            setProfile(profiles[0]);
          } else {
            setProfile(fallbackProfile);
          }
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setProfile(fallbackProfile);
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const posts = useMemo(() => {
    return Array.isArray(profile?.posts) ? profile.posts : [];
  }, [profile]);

  const stats = useMemo(
    () => ({
      posts: profile?.post_count ?? posts.length,
      work: profile?.work_count ?? 0,
      personal: profile?.personal_count ?? 0,
    }),
    [profile, posts.length]
  );

  const username = profile?.display_name ?? "zend";

  return (
    <section className="w-full py-20 sm:py-24">
      <div className="space-y-10">
        <div className="rounded-[40px] border border-slate-200/80 bg-white/85 px-6 py-10 shadow-[0_45px_160px_-100px_rgba(15,23,42,0.75)] sm:px-12">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
              <Skeleton className="mx-auto aspect-square w-40 rounded-full" />
              <Skeleton className="h-40 rounded-3xl" />
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
              <div className="flex justify-center md:justify-start">
                <div className="relative size-36 sm:size-44">
                  {profile?.profile_image_url ? (
                    <Image
                      src={profile.profile_image_url}
                      alt={username}
                      fill
                      className="rounded-full object-cover"
                      sizes="(max-width: 768px) 40vw, 220px"
                      priority
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-full bg-slate-900 text-3xl font-semibold uppercase tracking-wide text-white">
                      {username?.slice(0, 2)}
                    </div>
                  )}
                  <span className="absolute -bottom-2 -right-1 rounded-full border border-white bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-white">
                    Creator
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3 text-slate-900">
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{username}</p>
                  <BadgeCheck className="size-5 text-lime-500" />
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-800 transition hover:border-slate-900"
                  >
                    Follow
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-800 transition hover:border-slate-900"
                  >
                    Message
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-800 transition hover:border-slate-900"
                    aria-label="More profile actions"
                  >
                    <MoreHorizontal className="size-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-700">
                  <span>
                    <strong className="text-base text-slate-900">{stats.posts}</strong> posts
                  </span>
                  <span>
                    <strong className="text-base text-slate-900">{stats.work}</strong> work
                  </span>
                  <span>
                    <strong className="text-base text-slate-900">{stats.personal}</strong> personal
                  </span>
                </div>

                {profile?.bio ? <p className="text-sm leading-relaxed text-slate-600">{profile.bio}</p> : null}
              </div>
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <div className="mt-6 columns-2 gap-3 md:columns-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`profile-post-skeleton-${index}`} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl">
                  <Skeleton className="h-60 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          ) : posts.length ? (
            <div className="mt-6 columns-2 gap-3 md:columns-3">
              {posts.map((post) => {
                const aspectRatio = ratioToAspect(post?.ratio_width, post?.ratio_height);
                return (
                  <motion.div
                    key={post?.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-slate-100"
                    style={{ aspectRatio }}
                  >
                    {post?.image_url ? (
                      <Image
                        src={post.image_url}
                        alt={post?.description ?? "Post image"}
                        fill
                        className="object-cover transition duration-500 hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 opacity-0 transition hover:opacity-100">
                      <div className="flex h-full w-full flex-col justify-end bg-linear-to-t from-black/70 via-transparent to-transparent p-4 text-white">
                        <p className="text-xs uppercase tracking-[0.3em]">{post?.category}</p>
                        {post?.description ? <p className="text-sm font-semibold">{post.description}</p> : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="rounded-full border border-slate-200 p-6">
                <Menu className="size-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900">ยังไม่มีโพสต์</p>
              <p className="text-sm text-slate-500">เมื่อมีโพสต์ใหม่ จะแสดงในตารางนี้ทันที</p>
            </div>
          )}

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              ไม่สามารถโหลดข้อมูลจริงได้ จึงแสดงข้อมูลตัวอย่างแทน
            </p>
          ) : null}
        </div>

        {/* <div className="rounded-[36px] border border-slate-200 bg-white/80 px-8 py-8 text-center shadow-[0_35px_120px_-70px_rgba(15,23,42,0.6)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Need more?</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">ต่อยอดข้อมูล profile ผ่าน API /profiles หรือ /profiles/:id</h3>
          <p className="mt-2 text-sm text-slate-600">
            รองรับการเพิ่มหมวดหมู่โพสต์, reels, highlights และลิงก์ต่างๆ เช่นเดียวกับ IG จริง
          </p>
          <Link
            href="/work"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            ดูผลงานอื่น ๆ
          </Link>
        </div> */}
      </div>
    </section>
  );
};

export default ProfileShowcase;

