import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers";

const miSans = localFont({
  src: [
    {
      path: "../../public/fonts/MiSansMU-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/MiSansMU-Normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/MiSansMU-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/MiSansMU-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-mi-sans",
  display: "swap",
});

export const metadata = {
  title: "ZEnd",
  description: "My webportfolio,ZEnd",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${miSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
