"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MapPin, MessageSquareText, Phone, Send, Sparkles, Users } from "lucide-react";

const contactChannels = [
  {
    id: "email",
    label: "Email",
    value: "kittithat.dev@gmail.com",
    description: "ตอบกลับภายใน 24 ชั่วโมง",
    href: "mailto:kittithat.dev@gmail.com",
    accent: "bg-lime-100 text-lime-700",
  },
  {
    id: "phone",
    label: "Phone / Line",
    value: "+66 95 643 3948",
    description: "พร้อมคุยทุกวัน 10:00 - 18:00 น.",
    href: "tel:+66956433948",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    id: "office",
    label: "Office",
    value: "Phitsanulok, Thailand",
    description: "พร้อมนัดเจอแบบ on-site",
    href: "https://maps.google.com/?q=Phitsanulok",
    accent: "bg-orange-100 text-orange-700",
  },
];

const contactStats = [
  { id: "projects", label: "Projects delivered", value: "25+" },
  // { id: "clients", label: "Clients worldwide", value: "15" },
  { id: "response", label: "Avg. response time", value: "< 2 hrs" },
];

const ContactShowcase = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availability = useMemo(
    () => [
      { day: "Mon – Fri", time: "09:00 – 20:00 ICT" },
      { day: "Sat", time: "10:00 – 16:00 ICT" },
      { day: "Sun", time: "วันพักผ่อน (ตอบฉุกเฉินเท่านั้น)" },
    ],
    []
  );

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const topic = formData.get("topic");
    const message = formData.get("message");

    const subject = encodeURIComponent(`[Contact] ${topic || "New inquiry"} - ${name || "Anonymous"}`);
    const body = encodeURIComponent(
      `From: ${name || "-"} (${email || "-"})\nTopic: ${topic || "-"}\n\n${message || ""}`
    );

    setSubmitting(true);
    window.location.href = `mailto:kittithat.dev@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  }, [submitting]);

  return (
    <section className="relative w-full py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      />
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-[44px] border border-slate-200 bg-white/85 px-8 py-12 shadow-[0_50px_160px_-90px_rgba(15,23,42,0.75)] sm:px-14"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
                <Sparkles className="size-4 text-lime-500" />
                Contact
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                เริ่มคุยเรื่องโปรเจคกันเลย
              </h1>
              <p className="text-base text-slate-600 sm:text-lg">
                ไม่ว่าจะเป็นงาน redesign,frontend ระบบ backend สามารถทิ้งรายละเอียดไว้ได้เลย
                ผมจะตอบกลับภายใน 24 ชั่วโมง
              </p>
              <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-600">
                {contactStats.map((stat) => (
                  <div key={stat.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.4em]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {contactChannels.map((channel) => (
                <Link
                  key={channel.id}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  className="rounded-3xl border border-slate-200 bg-white/90 px-6 w-120 py-5 transition hover:-translate-y-1"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{channel.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{channel.value}</p>
                  <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${channel.accent}`}>
                    {channel.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[32px] border border-slate-200/90 bg-white/90 px-8 py-10 shadow-[0_40px_150px_-90px_rgba(15,23,42,0.7)]"
          >
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">ส่งข้อความ</p>
              <h2 className="text-3xl font-semibold text-slate-900">เล่าไอเดียของคุณให้ฟัง</h2>
              <p className="text-sm text-slate-500">
                กรอกหัวข้อและรายละเอียดคร่าวๆ ผมจะตอบกลับพร้อมไทม์ไลน์และค่าใช้จ่ายเบื้องต้น
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  ชื่อ / Company
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    name="name"
                    placeholder="ZEnd Studio"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Email
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                หัวข้อ
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  name="topic"
                  placeholder="เช่น พัฒนา dashboard หรืองาน redesign"
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                รายละเอียด
                <textarea
                  className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  name="message"
                  placeholder="Budget, scope และ timeline ที่ต้องการ"
                  required
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-transparent hover:text-slate-900"
                disabled={submitting}
              >
                <Send className="size-4" />
                {submitting ? "กำลังเตรียมอีเมล..." : "ส่งข้อความ"}
              </button>

              {submitted ? (
                <p className="text-center text-sm font-semibold text-lime-600">
                  เปิดอีเมลใหม่ให้แล้ว! หากไม่ได้รับ กรุณาส่งมาที่ kittithat.dev@gmail.com
                </p>
              ) : null}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col rounded-[32px] border border-slate-200/90 bg-white/75 p-8 shadow-[0_40px_150px_-90px_rgba(15,23,42,0.7)]"
          >
            <div className="flex items-center gap-3 text-slate-900">
              <MessageSquareText className="size-5 text-lime-500" />
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">ช่องทางอื่น</p>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <span className="font-semibold text-slate-900">Telegram:</span> @zendlll
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
                <MessageSquareText className="size-4" />
                Discord Server
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <iframe
                  src="https://discord.com/widget?id=548828772615323649&theme=dark"
                  width="100%"
                  height="500"
                  allowtransparency="true"
                  frameBorder="0"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
                <Clock className="size-4" />
                Availability
              </div>
              <ul className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 text-sm text-slate-700">
                {availability.map((slot) => (
                  <li key={slot.day} className="flex items-center justify-between gap-3">
                    <span>{slot.day}</span>
                    <span className="text-slate-400">{slot.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.5em] text-white/70">
                <Users className="size-4" />
                Collaboration
              </div>
              <p className="text-lg font-semibold">เปิดรับงานร่วมกับเอเจนซี่ / in-house team</p>
              <p className="text-sm text-white/70">
                สามารถแชร์ deck, SOW หรือ NDA มาทางอีเมล เพื่อเริ่มขั้นตอน onboarding ได้ทันที
              </p>
              <Link
                href="mailto:kittithat.dev@gmail.com"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:bg-white hover:text-slate-900"
              >
                ส่งไฟล์แนบ
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactShowcase;

