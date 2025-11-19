"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, RefreshCw, Save, Trash2, UploadCloud } from "lucide-react";
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
import getEducationHistory, {
  createEducationHistory,
  deleteEducationHistory,
  updateEducationHistory,
} from "@/service/education-history";
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

const emptyForm = {
  institution_name: "",
  degree: "",
  field_of_study: "",
  education_level: "",
  start_date: "",
  end_date: "",
  is_current: false,
  gpa: "",
  description: "",
  achievements: "",
  institution_logo_url: "",
  proof_attachment_url: "",
};

export default function EducationHistoryDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const logoInputRef = useRef(null);
  const proofInputRef = useRef(null);
  const [logoDragging, setLogoDragging] = useState(false);
  const [proofDragging, setProofDragging] = useState(false);

  const {
    uploadImage: uploadLogo,
    uploadedImage: uploadedLogo,
    isUploading: isUploadingLogo,
    error: logoError,
  } = useImageUpload();

  const {
    uploadImage: uploadProof,
    uploadedImage: uploadedProof,
    isUploading: isUploadingProof,
    error: proofError,
  } = useImageUpload({ allowedTypes: ["image/", "application/pdf"] });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchItems = useCallback(async () => {
    try {
      setListLoading(true);
      const data = await getEducationHistory();
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
    if (uploadedLogo?.url) {
      setForm((prev) => ({
        ...prev,
        institution_logo_url: uploadedLogo.url,
      }));
      setMessage("อัปโหลดโลโก้สถาบันเรียบร้อย");
    }
  }, [uploadedLogo]);

  useEffect(() => {
    if (uploadedProof?.url) {
      setForm((prev) => ({
        ...prev,
        proof_attachment_url: uploadedProof.url,
      }));
      setMessage("อัปโหลดเอกสารอ้างอิงเรียบร้อย");
    }
  }, [uploadedProof]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedItem(null);
    setMessage("");
    setError("");
  };

  const buildPayload = () => ({
    institution_name: form.institution_name?.trim(),
    degree: form.degree?.trim() || undefined,
    field_of_study: form.field_of_study?.trim() || undefined,
    education_level: form.education_level?.trim() || undefined,
    start_date: form.start_date || undefined,
    end_date: form.is_current ? null : form.end_date || undefined,
    is_current: Boolean(form.is_current),
    gpa: form.gpa?.trim() || undefined,
    description: form.description?.trim() || undefined,
    achievements: form.achievements?.trim() || undefined,
    institution_logo_url: form.institution_logo_url?.trim() || undefined,
    proof_attachment_url: form.proof_attachment_url?.trim() || undefined,
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
        await updateEducationHistory(selectedItem.id, payload, token);
        setMessage("อัปเดตประวัติการศึกษาเรียบร้อย");
      } else {
        await createEducationHistory(payload, token);
        setMessage("เพิ่มประวัติการศึกษาเรียบร้อย");
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
      institution_name: item.institution_name ?? "",
      degree: item.degree ?? "",
      field_of_study: item.field_of_study ?? "",
      education_level: item.education_level ?? "",
      start_date: item.start_date ? item.start_date.slice(0, 10) : "",
      end_date: item.end_date ? item.end_date.slice(0, 10) : "",
      is_current: Boolean(item.is_current),
      gpa: item.gpa ?? "",
      description: item.description ?? "",
      achievements: item.achievements ?? "",
      institution_logo_url: item.institution_logo_url ?? "",
      proof_attachment_url: item.proof_attachment_url ?? "",
    });
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
      await deleteEducationHistory(deleteTarget.id, token);
      setMessage("ลบประวัติการศึกษาเรียบร้อย");
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

  const buildDropzoneProps = (type) => {
    const inputRef = type === "logo" ? logoInputRef : proofInputRef;
    const isDragging = type === "logo" ? logoDragging : proofDragging;
    const setDragging = type === "logo" ? setLogoDragging : setProofDragging;
    const isUploading = type === "logo" ? isUploadingLogo : isUploadingProof;
    const errorText = type === "logo" ? logoError : proofError;
    const fieldValue = type === "logo" ? form.institution_logo_url : form.proof_attachment_url;

    const onDrop = (event) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      void (type === "logo" ? uploadLogo(file) : uploadProof(file));
    };

    return {
      containerProps: {
        className: `rounded-2xl border-2 border-dashed px-4 py-5 text-center transition ${
          isDragging ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
        } ${isUploading ? "opacity-60" : ""}`,
        onDragOver: (event) => {
          event.preventDefault();
          setDragging(true);
        },
        onDragLeave: (event) => {
          event.preventDefault();
          setDragging(false);
        },
        onDrop,
      },
      inputRef,
      fieldValue,
      errorText,
      isUploading,
      handleSelect: () => inputRef.current?.click(),
      accept: type === "logo" ? "image/*" : "image/*,.pdf",
      uploadHandler: type === "logo" ? uploadLogo : uploadProof,
    };
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
                <BreadcrumbPage>Education History</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-6 bg-neutral-50/80 p-6 pt-4">
          <section className="grid gap-6 lg:grid-cols-[360px,1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">
                  {selectedItem ? `แก้ไข #${selectedItem.id}` : "เพิ่มประวัติการศึกษา"}
                </p>
                <h2 className="text-2xl font-semibold text-neutral-900">Education History</h2>
                <p className="text-sm text-neutral-500">จัดการประวัติการศึกษาเพื่อใช้บนหน้า public</p>
              </header>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  ชื่อสถาบัน *
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="institution_name"
                    value={form.institution_name}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  วุฒิ/ปริญญา
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="degree"
                    value={form.degree}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  สาขา
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="field_of_study"
                    value={form.field_of_study}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  ระดับการศึกษา
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="education_level"
                    value={form.education_level}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    เริ่มต้น *
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-700">
                    สิ้นสุด
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
                  <input
                    type="checkbox"
                    name="is_current"
                    checked={form.is_current}
                    onChange={handleInputChange}
                    className="size-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  กำลังศึกษาอยู่
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  GPA
                  <input
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    name="gpa"
                    value={form.gpa}
                    onChange={handleInputChange}
                    placeholder="3.80"
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

                {["logo", "proof"].map((type) => {
                  const { containerProps, inputRef, accept, isUploading, fieldValue, errorText, handleSelect, uploadHandler } =
                    buildDropzoneProps(type);
                  const label = type === "logo" ? "Institution logo URL" : "Proof URL";
                  return (
                    <div key={type} className="space-y-2 text-sm font-semibold text-neutral-700">
                      {label}
                      <div {...containerProps}>
                        <input
                          ref={inputRef}
                          type="file"
                          accept={accept}
                          className="hidden"
                          onChange={(event) => void uploadHandler(event.target.files?.[0])}
                        />
                        <UploadCloud className="mx-auto size-8 text-neutral-400" />
                        <p className="mt-3 text-sm font-semibold text-neutral-800">
                          อัปโหลดไฟล์ไปยัง R2
                        </p>
                        <p className="text-xs text-neutral-500">
                          {type === "logo" ? "รองรับไฟล์รูปภาพ" : "รองรับรูปภาพหรือ PDF ขนาดไม่เกิน 10MB"}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                          <button
                            type="button"
                            onClick={handleSelect}
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
                        {fieldValue && type === "logo" ? (
                          <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border border-neutral-200 bg-white/60 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Preview</p>
                            <div className="mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={fieldValue} alt={`${label} preview`} className="w-full object-cover" />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <input
                        type="hidden"
                        name={type === "logo" ? "institution_logo_url" : "proof_attachment_url"}
                        value={fieldValue || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  );
                })}

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
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">รายการประวัติการศึกษา</p>
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
                      <th className="px-3 py-2">สถาบัน</th>
                      <th className="px-3 py-2">วุฒิ</th>
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
                          <td className="px-3 py-3 text-sm font-semibold text-neutral-900">{item.institution_name}</td>
                          <td className="px-3 py-3 text-sm text-neutral-700">{item.degree || "—"}</td>
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
              <GraduationCap className="size-5 text-neutral-400" />
              <div>
                <h3 className="text-lg font-semibold">เส้นที่ใช้</h3>
                <p className="text-sm text-neutral-500">GET /education-history · POST /education-history · PUT /education-history/:id · DELETE /education-history/:id</p>
              </div>
            </header>
            <p className="mt-4 text-sm text-neutral-600">
              ข้อมูลจะถูกโหลดจากเส้น public `/education-history` ส่วนการสร้าง/แก้ไข/ลบจะต้องส่ง token ปัจจุบันให้ backend ตรวจสอบสิทธิ์ก่อน
            </p>
          </section>

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            title="ยืนยันการลบประวัติการศึกษา"
            description={`คุณต้องการลบ "${deleteTarget?.institution_name}" หรือไม่?`}
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

