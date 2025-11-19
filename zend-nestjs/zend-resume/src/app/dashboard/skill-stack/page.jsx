"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
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
import { deleteSkillStack, getMySkillStack, getSkillStacks, updateSkillStack } from "@/service/skill-stack";
import ConfirmDialog from "@/components/common/confirm-dialog";

const defaultSkillsTemplate = `{
  "tools": ["Git", "Docker"],
  "backend": ["Node.js", "NestJS"],
  "frontend": ["React", "Next.js"]
}`;

const createId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const objectToEntries = (skills) => {
  if (!skills || typeof skills !== "object") {
    return [];
  }
  return Object.entries(skills).map(([name, items]) => ({
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

export default function SkillStackDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [skillsEntries, setSkillsEntries] = useState(objectToEntries(JSON.parse(defaultSkillsTemplate)));
  const [jsonInput, setJsonInput] = useState(defaultSkillsTemplate);
  const [jsonError, setJsonError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newItemInputs, setNewItemInputs] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchItems = useCallback(async () => {
    try {
      setListLoading(true);
      let data = [];
      if (token) {
        const mine = await getMySkillStack(token);
        if (mine) {
          data = [mine];
        }
      }
      if (!data.length) {
        data = await getSkillStacks();
      }
      setItems(Array.isArray(data) ? data : data ? [data] : []);
      setError("");
    } catch (err) {
      setError(err?.data?.message || err?.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      void fetchItems();
    }
  }, [fetchItems, isLoading]);

  const resetForm = () => {
    setDescription("");
    setSkillsEntries(objectToEntries(JSON.parse(defaultSkillsTemplate)));
    setJsonInput(defaultSkillsTemplate);
    setJsonError("");
    setNewCategory("");
    setNewItemInputs({});
    setSelectedItem(null);
    setMessage("");
    setError("");
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput || "{}");
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("รูปแบบ JSON ต้องเป็น object");
      }
      const nextEntries = objectToEntries(parsed);
      if (!nextEntries.length) {
        throw new Error("JSON ต้องมีหมวดทักษะอย่างน้อย 1 หมวด");
      }
      setSkillsEntries(nextEntries);
      setJsonError("");
    } catch (err) {
      setJsonError(err.message || "JSON ไม่ถูกต้อง");
    }
  };

  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name) {
      return;
    }
    setSkillsEntries((prev) => [...prev, { id: createId(), name, items: [] }]);
    setNewCategory("");
  };

  const handleCategoryNameChange = (id, value) => {
    setSkillsEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, name: value } : entry)),
    );
  };

  const handleRemoveCategory = (id) => {
    setSkillsEntries((prev) => prev.filter((entry) => entry.id !== id));
    setNewItemInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleNewItemChange = (id, value) => {
    setNewItemInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddItem = (id) => {
    const value = newItemInputs[id]?.trim();
    if (!value) {
      return;
    }
    setSkillsEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, items: entry.items.includes(value) ? entry.items : [...entry.items, value] }
          : entry,
      ),
    );
    setNewItemInputs((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleRemoveItem = (id, index) => {
    setSkillsEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, items: entry.items.filter((_, i) => i !== index) } : entry,
      ),
    );
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
      const skillsPayload = entriesToObject(skillsEntries);
      if (!Object.keys(skillsPayload).length) {
        throw new Error("กรุณาเพิ่มหมวดทักษะอย่างน้อย 1 หมวด");
      }

      const payload = {
        description: description?.trim() || undefined,
        skills: skillsPayload,
      };

      const updated = await updateSkillStack(payload, token);
      if (updated) {
        setSelectedItem(updated);
      }
      setMessage("บันทึก Skill Stack เรียบร้อย");
      await fetchItems();
    } catch (err) {
      setError(err?.message || err?.data?.message || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setDescription(item.description ?? "");
    const entries = objectToEntries(item.skills ?? {});
    setSkillsEntries(entries.length ? entries : objectToEntries(JSON.parse(defaultSkillsTemplate)));
    setJsonInput(JSON.stringify(item.skills ?? {}, null, 2));
    setNewItemInputs({});
    setMessage("");
    setError("");
  };

  const confirmDelete = async () => {
    if (!token) {
      setError("จำเป็นต้องเข้าสู่ระบบก่อนลบ");
      return;
    }
    try {
      setActionLoading(true);
      await deleteSkillStack(token);
      setMessage("ลบ Skill Stack เรียบร้อย");
      resetForm();
      await fetchItems();
    } catch (err) {
      setError(err?.data?.message || err?.message || "ไม่สามารถลบข้อมูลได้");
    } finally {
      setActionLoading(false);
      setDeleteConfirm(false);
    }
  };

  const previewCategories = useMemo(
    () => skillsEntries.map((entry) => entry.name).filter(Boolean),
    [skillsEntries],
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
                <BreadcrumbPage>Skill Stack</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex flex-1 flex-col gap-6 bg-neutral-50/80 p-6 pt-4">
          <section className="grid gap-6 lg:grid-cols-[360px,1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">
                  {selectedItem ? "แก้ไข Skill Stack" : "อัปเดต Skill Stack"}
                </p>
                <h2 className="text-2xl font-semibold text-neutral-900">Skill Stack</h2>
                <p className="text-sm text-neutral-500">จัดการชุดทักษะที่ใช้แสดงบนหน้า public</p>
              </header>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Description
                  <textarea
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="คำอธิบายชุดทักษะโดยรวม"
                  />
                </label>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Categories</p>
                      <p className="text-sm text-neutral-500">เพิ่มหมวดและ stack ทีละรายการ</p>
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
                        onClick={handleAddCategory}
                        className="inline-flex items-center gap-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                      >
                        <Plus className="size-4" />
                        เพิ่มหมวด
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {skillsEntries.length ? (
                      skillsEntries.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-neutral-200 bg-white/90 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <input
                              className="flex-1 rounded-2xl border border-neutral-200 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-700 outline-none transition focus:border-neutral-900"
                              value={entry.name}
                              onChange={(event) => handleCategoryNameChange(entry.id, event.target.value)}
                              placeholder="ชื่อหมวด"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(entry.id)}
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
                                    onClick={() => handleRemoveItem(entry.id, index)}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-neutral-400">ยังไม่มี stack</span>
                            )}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <input
                              className="flex-1 rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                              placeholder="เพิ่ม stack เช่น React"
                              value={newItemInputs[entry.id] ?? ""}
                              onChange={(event) => handleNewItemChange(entry.id, event.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddItem(entry.id)}
                              className="rounded-2xl border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                            >
                              เพิ่ม
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500">ยังไม่มีหมวดทักษะ</p>
                    )}
                  </div>
                </div>

                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Advanced JSON (optional)
                  <textarea
                    className="min-h-[180px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 font-mono text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                    value={jsonInput}
                    onChange={(event) => setJsonInput(event.target.value)}
                    placeholder='{ "tools": ["Git"], "backend": ["Node.js"] }'
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span>กด "นำเข้า JSON" เพื่อเขียนทับรายการด้านบน</span>
                    <button
                      type="button"
                      onClick={handleImportJson}
                      className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    >
                      นำเข้า JSON
                    </button>
                  </div>
                  {jsonError ? <p className="text-xs text-red-600">{jsonError}</p> : null}
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
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="inline-flex items-center justify-center rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-500"
                  >
                    ลบ Skill Stack
                  </button>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">รายการ Skill Stack</p>
                  <h2 className="text-lg font-semibold text-neutral-900">รายการทั้งหมด</h2>
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
                      <th className="px-3 py-2">รายละเอียด</th>
                      <th className="px-3 py-2">หมวดทักษะ</th>
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
                          <td className="px-3 py-3" />
                        </tr>
                      ))
                    ) : items.length ? (
                      items.map((item) => (
                        <tr key={item.id ?? "my-skill-stack"} className="border-b border-neutral-100">
                          <td className="px-3 py-3 align-top text-sm text-neutral-800">{item.description || "—"}</td>
                          <td className="px-3 py-3 text-sm text-neutral-700">
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(item.skills || {}).map((key) => (
                                <span key={key} className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                                  {key}
                                </span>
                              ))}
                              {!Object.keys(item.skills || {}).length ? "—" : null}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                              onClick={() => handleEdit(item)}
                            >
                              โหลดใส่ฟอร์ม
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-sm text-neutral-500">
                          ยังไม่มี Skill Stack
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
              <BookOpenCheck className="size-5 text-neutral-400" />
              <div>
                <h3 className="text-lg font-semibold">เส้นที่ใช้</h3>
                <p className="text-sm text-neutral-500">GET /skill-stack/me/my-skills · PUT /skill-stack/me/my-skills · DELETE /skill-stack/me/my-skills</p>
              </div>
            </header>
            <p className="mt-4 text-sm text-neutral-600">
              หน้าแดชบอร์ดนี้จะส่งคำขอโดยใช้ token ปัจจุบันเพื่อจัดการ Skill Stack ของคุณโดยตรง ถ้าไม่มีข้อมูลจะ fallback มาแสดงรายการสาธารณะให้ดูเป็นตัวอย่าง
            </p>
          </section>

          <ConfirmDialog
            open={deleteConfirm}
            title="ยืนยันการลบ Skill Stack"
            description="คุณต้องการลบ Skill Stack ของคุณหรือไม่?"
            confirmText="ลบ Skill Stack"
            cancelText="ยกเลิก"
            loading={actionLoading}
            onCancel={() => setDeleteConfirm(false)}
            onConfirm={confirmDelete}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

