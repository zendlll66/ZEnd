"use client";

import { useState } from "react";

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export default function useImageUpload({ allowedTypes = ["image/"], maxSize = DEFAULT_MAX_SIZE } = {}) {
  const [isUploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) {
      throw new Error("No file selected");
    }
    const isAllowed = allowedTypes.some((pattern) =>
      pattern.endsWith("/")
        ? file.type.startsWith(pattern)
        : file.type === pattern,
    );
    if (!isAllowed) {
      const message = allowedTypes.includes("application/pdf")
        ? "รองรับเฉพาะรูปภาพหรือไฟล์ PDF"
        : "กรุณาเลือกไฟล์รูปภาพ";
      setError(message);
      throw new Error(message);
    }
    if (file.size > maxSize) {
      const message = "ไฟล์ต้องมีขนาดไม่เกิน 10MB";
      setError(message);
      throw new Error(message);
    }

    setUploading(true);
    setError(null);
    setUploadedImage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        const message = result?.error || "อัปโหลดไม่สำเร็จ";
        setError(message);
        throw new Error(message);
      }

      const data = {
        url: result.url,
        fileName: result.fileName,
        size: result.size,
        type: result.type,
      };

      setUploadedImage(data);
      return data;
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setError(null);
  };

  return {
    uploadImage,
    resetUpload,
    isUploading,
    uploadedImage,
    error,
  };
}

