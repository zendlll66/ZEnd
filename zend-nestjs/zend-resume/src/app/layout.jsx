import localFont from "next/font/local";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

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
      <body
        className={`${miSans.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col overflow-x-hidden ">
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 md:pt-0 relative">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
