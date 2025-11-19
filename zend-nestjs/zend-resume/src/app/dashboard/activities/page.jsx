"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, RefreshCw, Save, Trash2, UploadCloud } from "lucide-react";
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
import getActivities, { createActivity, updateActivity, deleteActivity } from "@/service/activities";
import ConfirmDialog from "@/components/common/confirm-dialog";
import useImageUpload from "@/hooks/use-image-upload";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
};

const defaultTechJson = `{
  "topics": ["AI/ML", "Node.js"],
  "tools": ["Docker"]
}`;

const emptyForm = {
  title: "",
  type: "",
  role: "",
  organization: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  achievements: "",
  link: "",
  main_image_url: "",
  certificate_url: "",
};

const createId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const objectToEntries = (stack) =>
  stack && typeof stack === "object"
    ? Object.entries(stack).map(([name, items]) => ({
      id: createId(),
      name,
      items: Array.isArray(items) ? items : [],
    }))
    : [];

const entriesToObject = (entries) =>
  entries.reduce((acc, entry) => {
    const key = entry.name?.trim();
    if (!key) return acc;
    const values = entry.items.map((item) => item.trim()).filter(Boolean);
    if (values.length) acc[key] = values;
    return acc;
  }, {});

export default function ActivitiesDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [galleryEntries, setGalleryEntries] = useState([]);
  const [manualGalleryUrl, setManualGalleryUrl] = useState("");
  const [techEntries, setTechEntries] = useState(objectToEntries(JSON.parse(defaultTechJson)));
  const [techJsonInput, setTechJsonInput] = useState(defaultTechJson);
  const [techJsonError, setTechJsonError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStackInputs, setNewStackInputs] = useState({});
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const mainInputRef = useRef(null);
  const certificateInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const {
    uploadImage: uploadMainImage,
    uploadedImage: uploadedMainImage,
    isUploading: isUploadingMainImage,
    error: mainUploadError,
  } = useImageUpload();

  const {
    uploadImage: uploadCertificate,
    uploadedImage: uploadedCertificate,
    isUploading: isUploadingCertificate,
    error: certificateUploadError,
  } = useImageUpload({ allowedTypes: ["image/", "application/pdf"] });

  const {
    uploadImage: uploadGalleryImage,
    uploadedImage: uploadedGalleryImage,
    isUploading: isUploadingGalleryImage,
    error: galleryUploadError,
  } = useImageUpload();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchItems = useCallback(async () => {
    try {
      setListLoading(true);
      const data = await getActivities();
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

  useEffect(() => {
    if (uploadedMainImage?.url) {
      setForm((prev) => ({ ...prev, main_image_url: uploadedMainImage.url }));
      setMessage("อัปโหลดรูปหลักเรียบร้อย");
    }
  }, [uploadedMainImage]);

  useEffect(() => {
    if (uploadedCertificate?.url) {
      setForm((prev) => ({ ...prev, certificate_url: uploadedCertificate.url }));
      setMessage("อัปโหลดเอกสารเรียบร้อย");
    }
  }, [uploadedCertificate]);

  useEffect(() => {
    if (uploadedGalleryImage?.url) {
      setGalleryEntries((prev) => [...prev, { id: createId(), url: uploadedGalleryImage.url }]);
      setMessage("เพิ่มรูปแกลเลอรีเรียบร้อย");
    }
  }, [uploadedGalleryImage]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setGalleryEntries([]);
    setManualGalleryUrl("");
    setTechEntries(objectToEntries(JSON.parse(defaultTechJson)));
    setTechJsonInput(defaultTechJson);
    setTechJsonError("");
    setNewCategory("");
    setNewStackInputs({});
    setTags([]);
    setNewTag("");
    setSelectedItem(null);
    setMessage("");
    setError("");
  };

  const handleAddTag = () => {
    const value = newTag.trim();
    if (!value) return;
    setTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setNewTag("");
  };

  const handleRemoveTag = (index) => {
    setTags((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddGalleryUrl = () => {
    const value = manualGalleryUrl.trim();
    if (!value) return;
    setGalleryEntries((prev) => [...prev, { id: createId(), url: value }]);
    setManualGalleryUrl("");
  };

  const handleRemoveGalleryUrl = (id) => {
    setGalleryEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    setTechEntries((prev) => [...prev, { id: createId(), name, items: [] }]);
    setNewCategory("");
  };

  const handleAddStackItem = (id) => {
    const value = newStackInputs[id]?.trim();
    if (!value) return;
    setTechEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
            ...entry,
            items: entry.items.includes(value) ? entry.items : [...entry.items, value],
          }
          : entry,
      ),
    );
    setNewStackInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const handleRemoveStackItem = (id, index) => {
    setTechEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, items: entry.items.filter((_, idx) => idx !== index) }
          : entry,
      ),
    );
  };

  const importTechJson = () => {
    try {
      const parsed = JSON.parse(techJsonInput || "{}");
      if (typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      setTechEntries(objectToEntries(parsed));
      setTechJsonError("");
    } catch {
      setTechJsonError("JSON ไม่ถูกต้อง");
    }
  };

  const buildPayload = () => ({
    title: form.title?.trim(),
    type: form.type?.trim() || undefined,
    role: form.role?.trim() || undefined,
    organization: form.organization?.trim() || undefined,
    location: form.location?.trim() || undefined,
    start_date: form.start_date || undefined,
    end_date: form.is_current ? null : form.end_date || undefined,
    is_current: Boolean(form.is_current),
    description: form.description?.trim() || undefined,
    achievements: form.achievements?.trim() || undefined,
    tech_stack: entriesToObject(techEntries),
    main_image_url: form.main_image_url?.trim() || undefined,
    gallery_urls: galleryEntries.map((entry) => entry.url),
    certificate_url: form.certificate_url?.trim() || undefined,
    link: form.link?.trim() || undefined,
    tags,
  });

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
        await updateActivity(selectedItem.id, payload, token);
        setMessage("อัปเดตกิจกรรมเรียบร้อย");
      } else {
        await createActivity(payload, token);
        setMessage("เพิ่มกิจกรรมเรียบร้อย");
      }
      resetForm();
      await fetchItems();
    } catch (err) {
      setError(err?.data?.message || err?.message || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm({
      title: item.title ?? "",
      type: item.type ?? "",
      role: item.role ?? "",
      organization: item.organization ?? "",
      location: item.location ?? "",
      start_date: item.start_date ? item.start_date.slice(0, 10) : "",
      end_date: item.end_date ? item.end_date.slice(0, 10) : "",
      is_current: Boolean(item.is_current),
      description: item.description ?? "",
      achievements: item.achievements ?? "",
      link: item.link ?? "",
      main_image_url: item.main_image_url ?? "",
      certificate_url: item.certificate_url ?? "",
    });
    setGalleryEntries(
      Array.isArray(item.gallery_urls)
        ? item.gallery_urls.map((url) => ({ id: createId(), url }))
        : [],
    );
    const entries = objectToEntries(item.tech_stack ?? {});
    setTechEntries(entries.length ? entries : objectToEntries(JSON.parse(defaultTechJson)));
    setTechJsonInput(JSON.stringify(item.tech_stack ?? {}, null, 2));
    setTechJsonError("");
    setNewCategory("");
    setNewStackInputs({});
    setTags(Array.isArray(item.tags) ? item.tags : []);
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
      await deleteActivity(deleteTarget.id, token);
      setMessage("ลบกิจกรรมเรียบร้อย");
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
        const dateA = new Date(a.start_date || 0).getTime();
        const dateB = new Date(b.start_date || 0).getTime();
        return dateB - dateA;
      }),
    [items],
  );

  const buildDropzone = ({ inputRef, accept, isUploading, errorText, onUpload }) => (
    <div className="rounded-2xl border-2 border-dashed px-4 py-5 text-center">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => void onUpload(event.target.files?.[0])} />
      <UploadCloud className="mx-auto size-8 text-neutral-400" />
      <p className="mt-3 text-sm font-semibold text-neutral-800">อัปโหลดไฟล์ไปยัง R2</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-neutral-900 px-4 py-1.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          disabled={isUploading}
        >
          {isUploading ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
        </button>
      </div>
      {isUploading ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
          <Loader2 className="size-3.5 animate-spin" />
          กำลังอัปโหลด...
        </div>
      ) : null}
      {errorText ? <p className="mt-3 text-xs text-red-600">{errorText}</p> : null}
    </div>
  );

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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Activities</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-6 bg-neutral-50/80 p-6 pt-4">
          <section className="grid gap-6 lg:grid-cols-[360px,1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">{selectedItem ? `แก้ไข #${selectedItem.id}` : "เพิ่มกิจกรรม"}</p>
                <h2 className="text-2xl font-semibold text-neutral-900">Activities</h2>
                <p className="text-sm text-neutral-500">อัปเดตกิจกรรมที่ต้องการโชว์ในหน้า public</p>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Type
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="type"
                      value={form.type}
                      onChange={handleInputChange}
                      placeholder="Conference, Workshop..."
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Role
                    <input
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      placeholder="Speaker, Mentor..."
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Organization
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="organization"
                    value={form.organization}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Location
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    Start Date
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    End Date
                    <input
                      type="date"
                      disabled={form.is_current}
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700">
                  <input type="checkbox" name="is_current" checked={form.is_current} onChange={handleInputChange} className="size-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                  กำลังดำเนินอยู่
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
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Achievements
                  <textarea
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="achievements"
                    rows={3}
                    value={form.achievements}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  External Link
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="link"
                    value={form.link}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </label>

                <div className="space-y-2 text-sm font-semibold text-neutral-700">
                  Main Image
                  {buildDropzone({
                    inputRef: mainInputRef,
                    accept: "image/*",
                    isUploading: isUploadingMainImage,
                    errorText: mainUploadError,
                    onUpload: uploadMainImage,
                  })}
                  {form.main_image_url ? (
                    <div className="mx-auto mt-4 w-full max-w-xs rounded-2xl border border-neutral-200 bg-white/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Preview</p>
                      <div className="mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.main_image_url} alt="Main image preview" className="w-full object-cover" />
                      </div>
                      <a
                        href={form.main_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center justify-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                      >
                        เปิดรูปเต็ม
                      </a>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2 text-sm font-semibold text-neutral-700">
                  Certificate / Proof
                  {buildDropzone({
                    inputRef: certificateInputRef,
                    accept: "image/*,.pdf",
                    isUploading: isUploadingCertificate,
                    errorText: certificateUploadError,
                    onUpload: uploadCertificate,
                  })}
                  {form.certificate_url ? (
                    form.certificate_url.toLowerCase().endsWith(".pdf") ? (
                      <a
                        href={form.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center rounded-full border border-neutral-200 px-4 py-1 text-xs font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                      >
                        เปิดไฟล์ PDF
                      </a>
                    ) : (
                      <div className="mx-auto mt-4 w-full max-w-xs rounded-2xl border border-neutral-200 bg-white/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Preview</p>
                        <div className="mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={form.certificate_url} alt="Certificate preview" className="w-full object-cover" />
                        </div>
                        <a
                          href={form.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center justify-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                        >
                          เปิดรูปเต็ม
                        </a>
                      </div>
                    )
                  ) : null}
                </div>

                <div className="space-y-2 text-sm font-semibold text-neutral-700">
                  Gallery
                  {buildDropzone({
                    inputRef: galleryInputRef,
                    accept: "image/*",
                    isUploading: isUploadingGalleryImage,
                    errorText: galleryUploadError,
                    onUpload: uploadGalleryImage,
                  })}
                  <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {galleryEntries.length ? (
                      galleryEntries.map((entry, index) => (
                        <div key={entry.id} className="rounded-2xl border border-neutral-200 bg-white/80 shadow-sm">
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={entry.url} alt={`Gallery image ${index + 1}`} className="h-40 w-full rounded-t-2xl object-cover" />
                            <button
                              type="button"
                              className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-red-600 shadow hover:bg-white"
                              onClick={() => handleRemoveGalleryUrl(entry.id)}
                            >
                              ลบ
                            </button>
                          </div>
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border-t border-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:text-neutral-900"
                          >
                            เปิดรูปที่ {index + 1}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-400">ยังไม่มีรูปในแกลเลอรี</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      placeholder="เพิ่ม URL ด้วยตัวเอง https://..."
                      value={manualGalleryUrl}
                      onChange={(event) => setManualGalleryUrl(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      เพิ่ม URL
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Tech Stack</p>
                      <p className="text-sm text-neutral-500">เพิ่มหมวดและเทคโนโลยีทีละรายการ</p>
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        className="flex-1 rounded-2xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                        placeholder="เพิ่มหมวด เช่น frontend"
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
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
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              className="flex-1 rounded-2xl border border-neutral-200 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-700 outline-none transition focus:border-neutral-900"
                              value={entry.name}
                              onChange={(event) =>
                                setTechEntries((prev) =>
                                  prev.map((item) => (item.id === entry.id ? { ...item, name: event.target.value } : item)),
                                )
                              }
                            />
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-2xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-500"
                              onClick={() => setTechEntries((prev) => prev.filter((item) => item.id !== entry.id))}
                            >
                              <Trash2 className="size-3.5" />
                              ลบหมวด
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {entry.items.length ? (
                              entry.items.map((item, index) => (
                                <span key={`${entry.id}-${item}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                                  {item}
                                  <button type="button" className="text-neutral-400 hover:text-red-500" onClick={() => handleRemoveStackItem(entry.id, index)}>
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
                              className="rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                              onClick={() => handleAddStackItem(entry.id)}
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
                  Advanced Tech Stack JSON
                  <textarea
                    className="min-h-[160px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    value={techJsonInput}
                    onChange={(event) => setTechJsonInput(event.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <button
                      type="button"
                      onClick={importTechJson}
                      className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      นำเข้า JSON
                    </button>
                    {techJsonError ? <span className="text-red-600">{techJsonError}</span> : null}
                  </div>
                </label>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.length ? (
                      tags.map((tag, index) => (
                        <span key={`${tag}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                          {tag}
                          <button type="button" className="text-neutral-400 hover:text-red-500" onClick={() => handleRemoveTag(index)}>
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
                      placeholder="เพิ่มแท็ก เช่น workshop"
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>

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

              {message ? <p className="mt-4 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-700">{message}</p> : null}
              {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">รายการกิจกรรม</p>
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
                      <th className="px-3 py-2">ชื่อกิจกรรม</th>
                      <th className="px-3 py-2">องค์กร</th>
                      <th className="px-3 py-2">ช่วงเวลา</th>
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
                            <div className="h-3 w-40 animate-pulse rounded bg-neutral-200" />
                          </td>
                          <td className="px-3 py-3" />
                        </tr>
                      ))
                    ) : sortedItems.length ? (
                      sortedItems.map((item) => (
                        <tr key={item.id} className="border-b border-neutral-100">
                          <td className="px-3 py-3 text-sm font-semibold text-neutral-900">{item.title}</td>
                          <td className="px-3 py-3 text-sm text-neutral-700">{item.organization || "—"}</td>
                          <td className="px-3 py-3 text-xs text-neutral-500">
                            {formatDate(item.start_date)} – {item.is_current ? "ปัจจุบัน" : formatDate(item.end_date)}
                          </td>
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
              <div>
                <h3 className="text-lg font-semibold">เส้นที่ใช้</h3>
                <p className="text-sm text-neutral-500">GET /activities · POST /activities · PUT /activities/my-activity/:id · DELETE /activities/my-activity/:id</p>
              </div>
            </header>
            <p className="mt-4 text-sm text-neutral-600">
              ข้อมูล public มาจาก `/activities` ส่วนสร้าง/แก้ไข/ลบจะต้องแนบ token ปัจจุบันเพื่อให้ backend ตรวจสอบสิทธิ์ก่อนบันทึก
            </p>
          </section>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            title="ยืนยันการลบกิจกรรม"
            description={`คุณต้องการลบ "${deleteTarget?.title}" หรือไม่?`}
            confirmText="ลบรายการ"
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

