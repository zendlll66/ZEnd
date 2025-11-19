import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <div className="fixed top-0 z-10 w-full"> <Navbar /></div>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 md:pt-0 relative">
        {children}
      </main>
      <Footer />
    </div>
  );
}

