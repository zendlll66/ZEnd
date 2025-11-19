"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, ListFilter, Loader2, RefreshCw, Save, Trash2, UploadCloud } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import getPosts, { createPost, deleteMyPost, updateMyPost } from "@/service/posts";
import useImageUpload from "@/hooks/use-image-upload";
import ConfirmDialog from "@/components/common/confirm-dialog";

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

const CATEGORY_OPTIONS = [
  { label: "Catalog", value: "catalog" },
  { label: "Work", value: "work" },
  { label: "Personal", value: "personal" },
];

const emptyForm = {
  image_url: "",
  description: "",
  ratio_width: "4",
  ratio_height: "5",
  category: "catalog",
};

export default function DashboardPostsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("create");
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    uploadImage,
    resetUpload: resetUploadImage,
    isUploading: isUploadingImage,
    uploadedImage,
    error: uploadError,
  } = useImageUpload();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchPosts = useCallback(async () => {
    try {
      setListLoading(true);
      const data = await getPosts(token);
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
      setActionError(error?.data?.message || error?.message || "ไม่สามารถโหลดโพสต์ได้");
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      void fetchPosts();
    }
  }, [fetchPosts, isLoading]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setMode("create");
    setSelectedPost(null);
    resetUploadImage();
  };

  const buildPayload = () => {
    const toNumber = (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    return {
      image_url: form.image_url?.trim(),
      description: form.description?.trim() || undefined,
      ratio_width: toNumber(form.ratio_width),
      ratio_height: toNumber(form.ratio_height),
      category: form.category || undefined,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setActionError("จำเป็นต้องเข้าสู่ระบบก่อนจัดการโพสต์");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setActionMessage("");
      const payload = buildPayload();

      if (!payload.image_url) {
        setActionError("กรุณาระบุลิงก์รูปภาพ");
        setActionLoading(false);
        return;
      }

      if (mode === "create") {
        await createPost(payload, token);
        setActionMessage("สร้างโพสต์ใหม่เรียบร้อย");
      } else if (selectedPost?.id) {
        await updateMyPost(selectedPost.id, payload, token);
        setActionMessage("อัปเดตโพสต์เรียบร้อย");
      }

      resetForm();
      await fetchPosts();
    } catch (error) {
      console.error("Post action failed", error);
      setActionError(error?.data?.message || error?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (post) => {
    setMode("edit");
    setSelectedPost(post);
    setForm({
      image_url: post.image_url ?? "",
      description: post.description ?? "",
      ratio_width: post.ratio_width?.toString() ?? "",
      ratio_height: post.ratio_height?.toString() ?? "",
      category: post.category ?? "catalog",
    });
    resetUploadImage();
  };

  const handleDelete = (post) => {
    setDeleteTarget(post);
    setActionError("");
    setActionMessage("");
  };

  const confirmDelete = async () => {
    if (!token || !deleteTarget) {
      setActionError("จำเป็นต้องเข้าสู่ระบบก่อนลบโพสต์");
      return;
    }

    try {
      setActionLoading(true);
      await deleteMyPost(deleteTarget.id, token);
      setActionMessage("ลบโพสต์เรียบร้อย");
      if (mode === "edit" && selectedPost?.id === deleteTarget.id) {
        resetForm();
      }
      setDeleteTarget(null);
      await fetchPosts();
    } catch (error) {
      console.error("Delete post failed", error);
      setActionError(error?.data?.message || error?.message || "ไม่สามารถลบโพสต์ได้");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (filterCategory === "all") {
      return posts;
    }
    return posts.filter((post) => post.category === filterCategory);
  }, [posts, filterCategory]);

  useEffect(() => {
    if (uploadedImage?.url) {
      setForm((prev) => ({
        ...prev,
        image_url: uploadedImage.url,
      }));
      setActionMessage("อัปโหลดรูปไปยัง R2 เรียบร้อยแล้ว");
    }
  }, [uploadedImage]);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;
      try {
        setActionError("");
        await uploadImage(file);
      } catch (error) {
        setActionError(error.message || "อัปโหลดรูปไม่สำเร็จ");
      }
    },
    [uploadImage],
  );

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
                <BreadcrumbPage>Posts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-6 bg-neutral-50/80 p-6 pt-4">
          <section className="grid gap-6 lg:grid-cols-[360px,1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">
                  {mode === "create" ? "สร้างโพสต์" : `แก้ไขโพสต์ #${selectedPost?.id}`}
                </p>
                <h2 className="text-2xl font-semibold text-neutral-900">
                  {mode === "create" ? "เพิ่มโพสต์ใหม่" : "ปรับปรุงรายละเอียดโพสต์"}
                </h2>
                <p className="text-sm text-neutral-500">
                  กำหนดลิงก์รูป คำอธิบาย สัดส่วนภาพ และหมวดหมู่ได้ตามต้องการ
                </p>
              </header>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div
                  className={`rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${isDragging ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"} ${isUploadingImage ? "opacity-60" : ""}`}
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
                  <p className="mt-3 text-sm font-semibold text-neutral-800">
                    อัปโหลดรูปไปเก็บใน R2
                  </p>
                  <p className="text-xs text-neutral-500">
                    รองรับไฟล์ .jpg .png .webp ไม่เกิน 10MB
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full border border-neutral-900 px-4 py-1.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
                    </button>
                    {form.image_url ? (
                      <a
                        href={form.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                      >
                        ดูตัวอย่าง
                      </a>
                    ) : null}
                  </div>
                  {isUploadingImage ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                      <Loader2 className="size-3.5 animate-spin" />
                      กำลังอัปโหลดไปที่ R2...
                    </div>
                  ) : null}
                  {uploadError ? (
                    <p className="mt-3 text-xs text-red-600">{uploadError}</p>
                  ) : null}
                  {form.image_url ? (
                    <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border border-neutral-200 bg-white/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                        Preview
                      </p>
                      <div className="mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.image_url}
                          alt="Post preview"
                          className="w-full object-cover"
                          style={{
                            aspectRatio: `${form.ratio_width || 4}/${form.ratio_height || 5}`,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  ลิงก์รูปภาพ *
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="image_url"
                    placeholder="https://example.com/image.jpg"
                    value={form.image_url}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  คำอธิบาย
                  <textarea
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="description"
                    rows={3}
                    placeholder="เล่าเกี่ยวกับรูปนี้..."
                    value={form.description}
                    onChange={handleInputChange}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Ratio width
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      type="number"
                      min="1"
                      name="ratio_width"
                      value={form.ratio_width}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Ratio height
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      type="number"
                      min="1"
                      name="ratio_height"
                      value={form.ratio_height}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  หมวดหมู่
                  <select
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-transparent hover:text-neutral-900"
                    disabled={actionLoading}
                  >
                    <Save className="size-4" />
                    {mode === "create" ? "บันทึกโพสต์" : "อัปเดตโพสต์"}
                  </button>
                  {mode === "edit" ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      ยกเลิก
                    </button>
                  ) : null}
                </div>
              </form>

              {actionMessage ? (
                <p className="mt-4 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-700">
                  {actionMessage}
                </p>
              ) : null}

              {actionError ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">รายการโพสต์</p>
                  <h2 className="text-lg font-semibold text-neutral-900">จัดการโพสต์ทั้งหมด</h2>
                  <p className="text-sm text-neutral-500">
                    ใช้ข้อมูลจาก API <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px]">/posts</code>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-neutral-900"
                    value={filterCategory}
                    onChange={(event) => setFilterCategory(event.target.value)}
                  >
                    <option value="all">ทั้งหมด</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => fetchPosts()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <RefreshCw className="size-4" />
                    รีเฟรช
                  </button>
                </div>
              </header>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                      <th className="px-3 py-2">รูป</th>
                      <th className="px-3 py-2">คำอธิบาย</th>
                      <th className="px-3 py-2">หมวดหมู่</th>
                      <th className="px-3 py-2">Ratio</th>
                      <th className="px-3 py-2">อัปเดตล่าสุด</th>
                      <th className="px-3 py-2 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <tr key={`loading-${index}`} className="border-b border-neutral-50">
                          <td className="px-3 py-3">
                            <div className="size-16 animate-pulse rounded-xl bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-3 w-48 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-3 w-32 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3" />
                        </tr>
                      ))
                    ) : filteredPosts.length ? (
                      filteredPosts.map((post) => (
                        <tr key={post.id} className="border-b border-neutral-100">
                          <td className="px-3 py-3">
                            <div className="relative size-16 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                              {post.image_url ? (
                                <Image
                                  src={post.image_url}
                                  alt={post.description || `post-${post.id}`}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-neutral-400">
                                  <ImageIcon className="size-5" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="max-w-xs px-3 py-3 align-top text-sm text-neutral-800">
                            <p className="line-clamp-2">{post.description || "—"}</p>
                          </td>
                          <td className="px-3 py-3 text-xs uppercase tracking-wide text-neutral-500">
                            {post.category || "-"}
                          </td>
                          <td className="px-3 py-3 text-sm text-neutral-600">
                            {post.ratio_width ?? "-"}:{post.ratio_height ?? "-"}
                          </td>
                          <td className="px-3 py-3 text-xs text-neutral-500">
                            {formatDateTime(post.updated_at)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                                onClick={() => handleEdit(post)}
                              >
                                แก้ไข
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-500"
                                onClick={() => handleDelete(post)}
                                disabled={actionLoading}
                              >
                                <Trash2 className="size-3.5" />
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-neutral-500">
                          ไม่พบโพสต์ในหมวดหมู่นี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
            <header className="flex items-center gap-3 text-neutral-900">
              <ListFilter className="size-5 text-neutral-400" />
              <div>
                <h3 className="text-lg font-semibold">เส้นที่ใช้</h3>
                <p className="text-sm text-neutral-500">
                  POST /posts · GET /posts · PUT /posts/my-post/:id · DELETE /posts/my-post/:id
                </p>
              </div>
            </header>
            <p className="mt-4 text-sm text-neutral-600">
              หน้าแดชบอร์ดนี้ผูกกับ API จริงของ NestJS ผ่าน service `src/service/posts.js` เพื่อทำ CRUD ครบถ้วน
              โดยการสร้างโพสต์จะใช้ profile จาก token (logic ฝั่ง backend) ส่วนการอัปเดตและลบจะเรียกเฉพาะโพสต์ของตนเอง
            </p>
          </section>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            title="ยืนยันการลบโพสต์"
            description={`คุณต้องการลบโพสต์ #${deleteTarget?.id} หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            confirmText="ลบโพสต์"
            cancelText="ยกเลิก"
            loading={actionLoading}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

