import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LoginLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-neutral-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="w-full max-w-6xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

