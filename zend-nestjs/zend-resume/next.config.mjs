/** @type {import('next').NextConfig} */
const allowedImageDomains =
  process.env.NEXT_IMAGE_DOMAINS?.split(",").map((domain) => domain.trim()).filter(Boolean) ?? [];

if (!allowedImageDomains.includes("example.com")) {
  allowedImageDomains.push("example.com");
}

const r2PublicUrl = process.env.R2_PUBLIC_URL;
if (r2PublicUrl) {
  try {
    const { hostname } = new URL(r2PublicUrl);
    if (hostname && !allowedImageDomains.includes(hostname)) {
      allowedImageDomains.push(hostname);
    }
  } catch (error) {
    console.warn("Invalid R2_PUBLIC_URL:", error);
  }
}

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      ...allowedImageDomains.map((hostname) => ({
        protocol: "https",
        hostname,
      })),
    ],
  },
};

export default nextConfig;
