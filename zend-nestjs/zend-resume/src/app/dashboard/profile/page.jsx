"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import getMyProfile from "@/service/profile/me";
import updateProfile from "@/service/profile/update-profile";
import useImageUpload from "@/hooks/use-image-upload";

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return value;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState({
    display_name: "",
    profile_image_url: "",
    bio: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    uploadImage,
    resetUpload,
    isUploading,
    uploadedImage,
    error: uploadError,
  } = useImageUpload();

  const displayName = profile?.display_name ?? user?.username ?? "โปรไฟล์ผู้ใช้งาน";

  const initials = useMemo(() => {
    if (!displayName) return "U";
    const parts = displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase());
    if (parts.length === 0) {
      return displayName.slice(0, 2).toUpperCase();
    }
    return parts.join("").slice(0, 2);
  }, [displayName]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !token) {
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        setError("");
        const data = await getMyProfile(token);
        setProfile(data);
        setEditForm({
          display_name: data?.display_name ?? "",
          profile_image_url: data?.profile_image_url ?? "",
          bio: data?.bio ?? "",
        });
      } catch (err) {
        const message =
          err?.data?.message ||
          err?.message ||
          "ไม่สามารถดึงข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง";
        setError(message);
      } finally {
        setIsFetching(false);
      }
    };

    if (!isLoading) {
      void fetchProfile();
    }
  }, [isAuthenticated, isLoading, token]);

  useEffect(() => {
    if (uploadedImage?.url) {
      setEditForm((prev) => ({
        ...prev,
        profile_image_url: uploadedImage.url,
      }));
      setUpdateMessage("อัปโหลดรูปโปรไฟล์เรียบร้อย");
    }
  }, [uploadedImage]);

  const profileEntries = useMemo(
    () => [
      {
        label: "รหัสผู้ใช้",
        value: profile?.user_id ?? user?.id ?? "-",
      },
      {
        label: "ชื่อผู้ใช้",
        value: profile?.display_name ?? user?.username ?? "-",
      },
      {
        label: "อีเมล",
        value: user?.email ?? "-",
      },
      {
        label: "เข้าระบบล่าสุด",
        value: formatDateTime(user?.lastLoginAt),
      },
      { label: "สร้างบัญชีเมื่อ", value: formatDateTime(profile?.created_at ?? user?.createdAt) },
      { label: "อัปเดตล่าสุด", value: formatDateTime(profile?.updated_at) },
    ],
    [profile, user],
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "โพสต์ทั้งหมด",
        value: profile?.post_count ?? 0,
      },
      {
        label: "ผลงาน (Work)",
        value: profile?.work_count ?? 0,
      },
      {
        label: "ส่วนตัว (Personal)",
        value: profile?.personal_count ?? 0,
      },
    ],
    [profile],
  );

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (!token) {
      setUpdateError("จำเป็นต้องเข้าสู่ระบบก่อน");
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateMessage("");
      setUpdateError("");
      const payload = {
        display_name: editForm.display_name?.trim() || undefined,
        profile_image_url: editForm.profile_image_url?.trim() || undefined,
        bio: editForm.bio?.trim() || undefined,
      };
      const updated = await updateProfile(payload, token);
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          ...updated,
        }));
        setEditForm({
          display_name: updated.display_name ?? "",
          profile_image_url: updated.profile_image_url ?? "",
          bio: updated.bio ?? "",
        });
      }
      setUpdateMessage("อัปเดตโปรไฟล์เรียบร้อย");
    } catch (err) {
      setUpdateError(err?.data?.message || err?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUpdateError("");
      await uploadImage(file);
    } catch (err) {
      setUpdateError(err.message || "อัปโหลดรูปไม่สำเร็จ");
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFileUpload(file);
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFileUpload(file);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 text-sm text-neutral-600 shadow-sm">
          Checking your session...
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/profile">Profile</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>ข้อมูลบัญชี</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-6 bg-neutral-50/80 p-6 pt-4">
          <section className="rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-sm backdrop-blur">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative inline-flex size-14 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                  {profile?.profile_image_url ? (
                    <Image
                      src={profile.profile_image_url}
                      alt={displayName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-neutral-600">{initials}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900">{displayName}</h1>
                  <p className="text-sm text-neutral-500">
                    ตรวจสอบและจัดการรายละเอียดบัญชีของคุณ
                  </p>
                </div>
              </div>
              <div className="hidden text-sm text-neutral-500 sm:block">
                <p className="text-sm text-neutral-500">
                  {user?.email ?? "-"}
                </p>
              </div>
            </header>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-5 text-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900">
                    {isFetching ? "…" : card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[280px,1fr]">
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-6">
                <h2 className="text-sm font-semibold text-neutral-800">รูปโปรไฟล์</h2>
                <div className="mt-4 flex flex-col items-center gap-3">
                  {isFetching ? (
                    <div className="size-40 animate-pulse rounded-full bg-neutral-200" />
                  ) : profile?.profile_image_url ? (
                    <div className="relative size-40 overflow-hidden rounded-full border border-neutral-200">
                      <Image
                        src={profile.profile_image_url}
                        alt={profile.display_name || "Profile image"}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-40 items-center justify-center rounded-full border border-dashed border-neutral-300 bg-neutral-100 text-sm text-neutral-500">
                      ไม่มีรูปโปรไฟล์
                    </div>
                  )}
                  {profile?.profile_image_url ? (
                    <a
                      href={profile.profile_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
                    >
                      เปิดดูรูปเต็ม
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {profileEntries.map((entry) => (
                  <div
                    key={entry.label}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {entry.label}
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-neutral-900">
                      {isFetching ? "…" : entry.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-6">
              <h2 className="text-sm font-semibold text-neutral-800">Bio</h2>
              <p className="mt-2 text-sm text-neutral-600">
                {!isFetching && profile?.bio ? profile.bio : "ยังไม่มีข้อมูล Bio"}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">แก้ไขข้อมูลโปรไฟล์</h2>
                <p className="text-sm text-neutral-500">ข้อมูลนี้จะถูกดึงไปใช้ทั้งหน้า Public และ dashboard</p>
              </div>
            </header>
            <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleProfileUpdate}>
              <div
                className={`lg:col-span-2 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${isDragging ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"} ${isUploading ? "opacity-60" : ""}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <UploadCloud className="mx-auto size-8 text-neutral-400" />
                <p className="mt-3 text-sm font-semibold text-neutral-800">อัปโหลดรูปไปยัง R2</p>
                <p className="text-xs text-neutral-500">รองรับไฟล์รูปภาพไม่เกิน 10MB</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-neutral-900 px-4 py-1.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                    disabled={isUploading}
                  >
                    {isUploading ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
                  </button>
                  {editForm.profile_image_url ? (
                    <a
                      href={editForm.profile_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      ดูตัวอย่าง
                    </a>
                  ) : null}
                </div>
                {isUploading ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                    <Loader2 className="size-3.5 animate-spin" />
                    กำลังอัปโหลดไปที่ R2...
                  </div>
                ) : null}
                {uploadError ? <p className="mt-3 text-xs text-red-600">{uploadError}</p> : null}
                {editForm.profile_image_url ? (
                  <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border border-neutral-200 bg-white/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Preview</p>
                    <div className="mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editForm.profile_image_url} alt="Profile preview" className="w-full object-cover" />
                    </div>
                  </div>
                ) : null}
              </div>
              <label className="space-y-2 text-sm font-semibold text-neutral-700">
                Display name
                <input
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                  name="display_name"
                  value={editForm.display_name}
                  onChange={handleEditChange}
                  placeholder="ZEnd"
                  required
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-neutral-700">
                Profile image URL
                <input
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                  name="profile_image_url"
                  value={editForm.profile_image_url}
                  onChange={handleEditChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-neutral-700 lg:col-span-2">
                Bio
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditChange}
                  placeholder="เล่าเกี่ยวกับตัวคุณ..."
                />
              </label>
              <div className="mt-2 flex flex-wrap gap-3 lg:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-transparent hover:text-neutral-900"
                  disabled={updateLoading}
                >
                  {updateLoading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                {profile?.profile_image_url || editForm.profile_image_url ? (
                  <a
                    href={editForm.profile_image_url || profile?.profile_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                  >
                    ดูรูป
                  </a>
                ) : null}
              </div>
            </form>
            {updateMessage ? (
              <p className="mt-4 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-700">{updateMessage}</p>
            ) : null}
            {updateError ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{updateError}</p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">โพสต์ล่าสุด</h2>
                <p className="text-sm text-neutral-500">
                  แสดงรายการโพสต์จากโปรไฟล์ของคุณ
                </p>
              </div>
            </header>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {isFetching ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100/60"
                  >
                    <div className="aspect-[4/5] rounded-t-2xl bg-neutral-200" />
                    <div className="space-y-2 p-4">
                      <div className="h-3 rounded bg-neutral-200" />
                      <div className="h-3 w-2/3 rounded bg-neutral-200" />
                    </div>
                  </div>
                ))
              ) : profile?.posts?.length ? (
                profile.posts.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div
                      className="relative w-full overflow-hidden"
                      style={{
                        aspectRatio: `${post.ratio_width ?? 4}/${post.ratio_height ?? 5}`,
                      }}
                    >
                      <img
                        src={post.image_url}
                        alt={post.description || "โพสต์"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-sm font-semibold text-neutral-900">
                        {post.description || "ไม่มีคำอธิบาย"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>หมวดหมู่: {post.category || "-"}</span>
                        <span>{formatDateTime(post.created_at)}</span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 p-6 text-center text-sm text-neutral-500">
                  ยังไม่มีโพสต์ในโปรไฟล์ของคุณ
                </div>
              )}
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

