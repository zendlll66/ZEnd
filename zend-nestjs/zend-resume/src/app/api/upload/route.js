import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";

const requiredEnv = {
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_ENDPOINT: process.env.R2_ENDPOINT,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
};

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnv.length > 0) {
  console.error("Missing R2 environment variables:", missingEnv);
}

const s3Client =
  missingEnv.length === 0
    ? new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
    : null;

export async function POST(request) {
  try {
    if (missingEnv.length > 0) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: `Missing environment variables: ${missingEnv.join(", ")}`,
        },
        { status: 500 },
      );
    }

    if (!process.env.R2_ENDPOINT.includes(".r2.cloudflarestorage.com")) {
      return NextResponse.json(
        {
          error: "Invalid R2 endpoint format",
          details: "Expected https://<ACCOUNT_ID>.r2.cloudflarestorage.com",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    const extension = file.name?.split(".").pop() ?? "bin";
    const key = `${timestamp}-${random}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      url: `${process.env.R2_PUBLIC_URL}/${key}`,
      fileName: key,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

