"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers3, Loader2, RefreshCw, Save, Trash2, UploadCloud, Plus } from "lucide-react";
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
import getProjects, { createProject, deleteProject, updateProject } from "@/service/projects";
import ConfirmDialog from "@/components/common/confirm-dialog";
import useImageUpload from "@/hooks/use-image-upload";

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  role: "",
  duration: "",
  github_url: "",
  demo_url: "",
  video_demo_url: "",
  main_image_url: "",
  is_featured: false,
  tags: [],
};

const defaultTechStackJson = `{
  "frontend": ["React", "Next.js"],
  "backend": ["NestJS"],
  "tools": ["Docker"]
}`;

const createId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const objectToEntries = (stack) => {
  if (!stack || typeof stack !== "object") {
    return [];
  }
  return Object.entries(stack).map(([name, items]) => ({
    id: createId(),
    name,
    items: Array.isArray(items) ? items : [],
  }));
};

const entriesToObject = (entries) =>
  entries.reduce((acc, entry) => {
    const key = entry.name?.trim();
    if (!key) {
      return acc;
    }
    const cleanItems = entry.items.map((item) => item.trim()).filter(Boolean);
    if (cleanItems.length) {
      acc[key] = cleanItems;
    }
    return acc;
  }, {});

export default function ProjectsDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [newTag, setNewTag] = useState("");
  const [galleryEntries, setGalleryEntries] = useState([]);
  const [manualGalleryUrl, setManualGalleryUrl] = useState("");
  const [techEntries, setTechEntries] = useState(objectToEntries(JSON.parse(defaultTechStackJson)));
  const [techJsonInput, setTechJsonInput] = useState(defaultTechStackJson);
  const [techJsonError, setTechJsonError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStackInputs, setNewStackInputs] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const mainImageInputRef = useRef(null);
  const [mainImageDragging, setMainImageDragging] = useState(false);
  const {
    uploadImage: uploadMainImage,
    uploadedImage: uploadedMainImage,
    isUploading: isUploadingMainImage,
    error: mainImageError,
  } = useImageUpload();
  const {
    uploadImage: uploadGalleryImage,
    uploadedImage: uploadedGalleryImage,
    isUploading: isUploadingGalleryImage,
    error: galleryImageError,
  } = useImageUpload();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (uploadedMainImage?.url) {
      setForm((prev) => ({
        ...prev,
        main_image_url: uploadedMainImage.url,
      }));
      setMessage("อัปโหลดรูปหลักเรียบร้อย");
    }
  }, [uploadedMainImage]);

  useEffect(() => {
    if (uploadedGalleryImage?.url) {
      setGalleryEntries((prev) => [
        ...prev,
        { id: createId(), url: uploadedGalleryImage.url },
      ]);
      setMessage("อัปโหลดรูปในแกลเลอรีเรียบร้อย");
    }
  }, [uploadedGalleryImage]);

  const fetchItems = useCallback(async () => {
    try {
      setListLoading(true);
      const data = await getProjects();
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err?.data?.message || err?.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      void fetchItems();
    }
  }, [fetchItems, isLoading]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setNewTag("");
    setGalleryEntries([]);
    setManualGalleryUrl("");
    setTechEntries(objectToEntries(JSON.parse(defaultTechStackJson)));
    setTechJsonInput(defaultTechStackJson);
    setTechJsonError("");
    setNewCategory("");
    setNewStackInputs({});
    setSelectedItem(null);
    setMessage("");
    setError("");
  };

  const handleAddTag = () => {
    const value = newTag.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(value) ? prev.tags : [...prev.tags, value],
    }));
    setNewTag("");
  };

  const handleRemoveTag = (index) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, idx) => idx !== index),
    }));
  };

  const parseJson = () => {
    const stackObject = entriesToObject(techEntries);
    if (Object.keys(stackObject).length) {
      return stackObject;
    }
    if (!techJsonInput) {
      return undefined;
    }
    try {
      const parsed = JSON.parse(techJsonInput);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error();
      }
      return parsed;
    } catch {
      throw new Error("JSON เทคสแตกไม่ถูกต้อง");
    }
  };

  const buildPayload = () => {
    const techStack = parseJson();
    const gallery = galleryEntries.map((entry) => entry.url).filter(Boolean);
    return {
      title: form.title?.trim(),
      subtitle: form.subtitle?.trim() || undefined,
      description: form.description?.trim() || undefined,
      role: form.role?.trim() || undefined,
      duration: form.duration?.trim() || undefined,
      github_url: form.github_url?.trim() || undefined,
      demo_url: form.demo_url?.trim() || undefined,
      video_demo_url: form.video_demo_url?.trim() || undefined,
      main_image_url: form.main_image_url?.trim() || undefined,
      gallery_urls: gallery,
      tech_stack: techStack,
      is_featured: Boolean(form.is_featured),
      tags: form.tags,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setError("จำเป็นต้องเข้าสู่ระบบก่อนบันทึก");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");
      setError("");
      const payload = buildPayload();

      if (selectedItem?.id) {
        await updateProject(selectedItem.id, payload, token);
        setMessage("อัปเดตโปรเจคเรียบร้อย");
      } else {
        await createProject(payload, token);
        setMessage("สร้างโปรเจคเรียบร้อย");
      }

      resetForm();
      await fetchItems();
    } catch (err) {
      setError(err?.message || err?.data?.message || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm({
      title: item.title ?? "",
      subtitle: item.subtitle ?? "",
      description: item.description ?? "",
      role: item.role ?? "",
      duration: item.duration ?? "",
      github_url: item.github_url ?? "",
      demo_url: item.demo_url ?? "",
      video_demo_url: item.video_demo_url ?? "",
      main_image_url: item.main_image_url ?? "",
      is_featured: Boolean(item.is_featured),
      tags: Array.isArray(item.tags) ? item.tags : [],
    });
    setGalleryEntries(
      Array.isArray(item.gallery_urls)
        ? item.gallery_urls.map((url) => ({ id: createId(), url }))
        : [],
    );
    const entries = objectToEntries(item.tech_stack ?? {});
    setTechEntries(entries.length ? entries : objectToEntries(JSON.parse(defaultTechStackJson)));
    setTechJsonInput(JSON.stringify(item.tech_stack ?? {}, null, 2));
    setTechJsonError("");
    setNewCategory("");
    setNewStackInputs({});
    setNewTag("");
    setMessage("");
    setError("");
  };

  const handleDelete = (item) => {
    setDeleteTarget(item);
    setMessage("");
    setError("");
  };

  const confirmDelete = async () => {
    if (!token || !deleteTarget) {
      setError("จำเป็นต้องเข้าสู่ระบบก่อนลบ");
      return;
    }
    try {
      setActionLoading(true);
      await deleteProject(deleteTarget.id, token);
      setMessage("ลบโปรเจคเรียบร้อย");
      if (selectedItem?.id === deleteTarget.id) {
        resetForm();
      }
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      setError(err?.data?.message || err?.message || "ไม่สามารถลบข้อมูลได้");
    } finally {
      setActionLoading(false);
    }
  };

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      }),
    [items],
  );

  const buildDropzoneProps = () => ({
    containerProps: {
      className: `rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${
        mainImageDragging ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
      } ${isUploadingMainImage ? "opacity-60" : ""}`,
      onDragOver: (event) => {
        event.preventDefault();
        setMainImageDragging(true);
      },
      onDragLeave: (event) => {
        event.preventDefault();
        setMainImageDragging(false);
      },
      onDrop: (event) => {
        event.preventDefault();
        setMainImageDragging(false);
        const file = event.dataTransfer.files?.[0];
        void uploadMainImage(file);
      },
    },
    inputRef: mainImageInputRef,
    isUploading: isUploadingMainImage,
    fieldValue: form.main_image_url,
    errorText: mainImageError,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 text-sm text-neutral-600 shadow-sm">
          Checking your session...
        </div>
      </div>
    );
  }

  const { containerProps, inputRef, isUploading, fieldValue, errorText } = buildDropzoneProps();

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
                <BreadcrumbPage>Projects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-6 bg-neutral-50/80 p-6 pt-4">
          <section className="grid gap-6 lg:grid-cols-[360px,1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">
                  {selectedItem ? `แก้ไข #${selectedItem.id}` : "เพิ่มโปรเจค"}
                </p>
                <h2 className="text-2xl font-semibold text-neutral-900">Projects</h2>
                <p className="text-sm text-neutral-500">จัดการผลงานที่แสดงบนหน้า public</p>
              </header>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Title *
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Subtitle
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Description
                  <textarea
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Role
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Duration
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="duration"
                      value={form.duration}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    GitHub URL
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="github_url"
                      value={form.github_url}
                      onChange={handleInputChange}
                      placeholder="https://github.com/..."
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Demo URL
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="demo_url"
                      value={form.demo_url}
                      onChange={handleInputChange}
                      placeholder="https://demo..."
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Video URL
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="video_demo_url"
                      value={form.video_demo_url}
                      onChange={handleInputChange}
                      placeholder="https://youtube..."
                    />
                  </label>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleInputChange}
                    className="size-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  Featured Project
                </label>

                <div className="space-y-2 text-sm font-semibold text-neutral-700">
                  Main Image
                  <div {...containerProps}>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void uploadMainImage(event.target.files?.[0])}
                    />
                    <UploadCloud className="mx-auto size-8 text-neutral-400" />
                    <p className="mt-3 text-sm font-semibold text-neutral-800">อัปโหลดรูปหลักไปยัง R2</p>
                    <p className="text-xs text-neutral-500">รองรับไฟล์รูปภาพไม่เกิน 10MB</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="rounded-full border border-neutral-900 px-4 py-1.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                        disabled={isUploading}
                      >
                        {isUploading ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
                      </button>
                      {fieldValue ? (
                        <a
                          href={fieldValue}
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
                        กำลังอัปโหลด...
                      </div>
                    ) : null}
                    {errorText ? <p className="mt-3 text-xs text-red-600">{errorText}</p> : null}
                    {fieldValue ? (
                      <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border border-neutral-200 bg-white/60 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Preview</p>
                        <div className="mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={fieldValue} alt="Project preview" className="w-full object-cover" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <input
                    type="hidden"
                    name="main_image_url"
                    value={form.main_image_url}
                    onChange={handleInputChange}
                  />
                </div>

                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Gallery URLs (comma separated)
                  <textarea
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="gallery_urls_text"
                    rows={2}
                    value={form.gallery_urls_text}
                    onChange={handleInputChange}
                    placeholder="https://..., https://..."
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Tech Stack JSON
                  <textarea
                    className="min-h-[180px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="tech_stack_text"
                    value={form.tech_stack_text}
                    onChange={handleInputChange}
                    placeholder='{ "frontend": ["React"] }'
                  />
                </label>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.tags.length ? (
                      form.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600"
                        >
                          {tag}
                          <button
                            type="button"
                            className="text-neutral-400 hover:text-red-500"
                            onClick={() => handleRemoveTag(index)}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400">ยังไม่มีแท็ก</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      className="flex-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      placeholder="เพิ่มแท็ก เช่น web app"
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="inline-flex items-center gap-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      <Plus className="size-4" />
                      เพิ่ม
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm font-semibold text-neutral-700">
                  Gallery
                  <div
                    className={`rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${
                      isUploadingGalleryImage ? "opacity-60" : ""
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const file = event.dataTransfer.files?.[0];
                      void uploadGalleryImage(file);
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void uploadGalleryImage(event.target.files?.[0])}
                    />
                    <UploadCloud className="mx-auto size-8 text-neutral-400" />
                    <p className="mt-3 text-sm font-semibold text-neutral-800">อัปโหลดรูปหลายรูปไปยัง R2</p>
                    <p className="text-xs text-neutral-500">สามารถลากไฟล์ลงในกล่องนี้เพื่อเพิ่มทีละรูป</p>
                    {isUploadingGalleryImage ? (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                        <Loader2 className="size-3.5 animate-spin" />
                        กำลังอัปโหลด...
                      </div>
                    ) : null}
                    {galleryImageError ? <p className="mt-3 text-xs text-red-600">{galleryImageError}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {galleryEntries.length ? (
                      galleryEntries.map((entry, index) => (
                        <span
                          key={entry.id}
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600"
                        >
                          {`รูปที่ ${index + 1}`}
                          <button
                            type="button"
                            className="text-neutral-400 hover:text-red-500"
                            onClick={() =>
                              setGalleryEntries((prev) => prev.filter((item) => item.id !== entry.id))
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400">ยังไม่มีรูปในแกลเลอรี</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      placeholder="เพิ่ม URL ด้วยตนเอง https://..."
                      value={manualGalleryUrl}
                      onChange={(event) => setManualGalleryUrl(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const value = manualGalleryUrl.trim();
                        if (!value) return;
                        setGalleryEntries((prev) => [...prev, { id: createId(), url: value }]);
                        setManualGalleryUrl("");
                      }}
                      className="rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      เพิ่ม URL
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Tech Stack</p>
                      <p className="text-sm text-neutral-500">เพิ่มหมวดและเทคโนโลยีทีละรายการ</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        className="rounded-2xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                        placeholder="ชื่อหมวด เช่น frontend"
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const name = newCategory.trim();
                          if (!name) return;
                          setTechEntries((prev) => [...prev, { id: createId(), name, items: [] }]);
                          setNewCategory("");
                        }}
                        className="inline-flex items-center gap-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                      >
                        <Plus className="size-4" />
                        เพิ่มหมวด
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {techEntries.length ? (
                      techEntries.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-neutral-200 bg-white/90 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <input
                              className="flex-1 rounded-2xl border border-neutral-200 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-700 outline-none transition focus:border-neutral-900"
                              value={entry.name}
                              onChange={(event) =>
                                setTechEntries((prev) =>
                                  prev.map((item) =>
                                    item.id === entry.id ? { ...item, name: event.target.value } : item,
                                  ),
                                )
                              }
                              placeholder="ชื่อหมวด"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setTechEntries((prev) => prev.filter((item) => item.id !== entry.id))
                              }
                              className="inline-flex items-center gap-1 rounded-2xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-500"
                            >
                              <Trash2 className="size-3.5" />
                              ลบหมวด
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {entry.items.length ? (
                              entry.items.map((item, index) => (
                                <span
                                  key={`${entry.id}-${item}-${index}`}
                                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600"
                                >
                                  {item}
                                  <button
                                    type="button"
                                    className="text-neutral-400 hover:text-red-500"
                                    onClick={() =>
                                      setTechEntries((prev) =>
                                        prev.map((stack) =>
                                          stack.id === entry.id
                                            ? {
                                              ...stack,
                                              items: stack.items.filter((_, i) => i !== index),
                                            }
                                            : stack,
                                        ),
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-neutral-400">ยังไม่มีรายการ</span>
                            )}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <input
                              className="flex-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                              placeholder="เพิ่มเทคโนโลยี เช่น React"
                              value={newStackInputs[entry.id] ?? ""}
                              onChange={(event) =>
                                setNewStackInputs((prev) => ({
                                  ...prev,
                                  [entry.id]: event.target.value,
                                }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const value = newStackInputs[entry.id]?.trim();
                                if (!value) return;
                                setTechEntries((prev) =>
                                  prev.map((stack) =>
                                    stack.id === entry.id
                                      ? {
                                        ...stack,
                                        items: stack.items.includes(value)
                                          ? stack.items
                                          : [...stack.items, value],
                                      }
                                      : stack,
                                  ),
                                );
                                setNewStackInputs((prev) => ({
                                  ...prev,
                                  [entry.id]: "",
                                }));
                              }}
                              className="rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                            >
                              เพิ่ม
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500">ยังไม่มี Tech Stack</p>
                    )}
                  </div>
                </div>

                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Advanced Tech Stack JSON (optional)
                  <textarea
                    className="min-h-[160px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    value={techJsonInput}
                    onChange={(event) => setTechJsonInput(event.target.value)}
                    placeholder='{ "frontend": ["React"] }'
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span>กด "นำเข้า JSON" เพื่อเขียนทับรายการด้านบน</span>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(techJsonInput || "{}");
                          if (typeof parsed !== "object" || Array.isArray(parsed)) {
                            throw new Error();
                          }
                          setTechEntries(objectToEntries(parsed));
                          setTechJsonError("");
                        } catch {
                          setTechJsonError("JSON ไม่ถูกต้อง");
                        }
                      }}
                      className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      นำเข้า JSON
                    </button>
                  </div>
                  {techJsonError ? <p className="text-xs text-red-600">{techJsonError}</p> : null}
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-transparent hover:text-neutral-900"
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {selectedItem ? "อัปเดต" : "บันทึก"}
                  </button>
                  {selectedItem ? (
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

              {message ? (
                <p className="mt-4 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-700">{message}</p>
              ) : null}
              {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">รายการโปรเจค</p>
                  <h2 className="text-lg font-semibold text-neutral-900">ทั้งหมด</h2>
                </div>
                <button
                  type="button"
                  onClick={() => fetchItems()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  <RefreshCw className="size-4" />
                  รีเฟรช
                </button>
              </header>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                      <th className="px-3 py-2">ชื่อโปรเจค</th>
                      <th className="px-3 py-2">บทบาท</th>
                      <th className="px-3 py-2">สถานะ</th>
                      <th className="px-3 py-2 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr key={`loading-${index}`} className="border-b border-neutral-50">
                          <td className="px-3 py-3">
                            <div className="h-3 w-48 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-3 w-32 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3" />
                        </tr>
                      ))
                    ) : sortedItems.length ? (
                      sortedItems.map((item) => (
                        <tr key={item.id} className="border-b border-neutral-100">
                          <td className="px-3 py-3 text-sm font-semibold text-neutral-900">{item.title}</td>
                          <td className="px-3 py-3 text-sm text-neutral-700">{item.role || "—"}</td>
                          <td className="px-3 py-3 text-xs text-neutral-500">{item.is_featured ? "Featured" : "Regular"}</td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                                onClick={() => handleEdit(item)}
                              >
                                แก้ไข
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-500"
                                onClick={() => handleDelete(item)}
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
                        <td colSpan={4} className="px-3 py-6 text-center text-sm text-neutral-500">
                          ยังไม่มีข้อมูล
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
              <Layers3 className="size-5 text-neutral-400" />
              <div>
                <h3 className="text-lg font-semibold">เส้นที่ใช้</h3>
                <p className="text-sm text-neutral-500">GET /projects · POST /projects · PUT /projects/my-project/:id · DELETE /projects/my-project/:id</p>
              </div>
            </header>
            <p className="mt-4 text-sm text-neutral-600">
              ทุกการสร้าง/แก้ไข/ลบ จะส่ง token ปัจจุบันให้ backend ตรวจสอบสิทธิ์ก่อนจัดการข้อมูลของคุณ
            </p>
          </section>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            title="ยืนยันการลบโปรเจค"
            description={`คุณต้องการลบ "${deleteTarget?.title}" หรือไม่?`}
            confirmText="ลบโปรเจค"
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

