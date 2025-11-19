"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await login({
        email: formState.email,
        password: formState.password,
      });
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-2xl shadow-[0_25px_90px_-40px_rgba(15,23,42,0.45)]">
        <div className="grid gap-12 lg:grid-cols-[1fr,1.2fr]">
          <div className="hidden h-full rounded-l-3xl bg-neutral-900 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                Welcome back
              </p>
              <h1 className="mt-6 text-3xl font-semibold leading-tight">
                Access your ZEnd dashboard
              </h1>
              <p className="mt-4 text-sm text-neutral-300">
                Log in to manage your projects, update your portfolio content,
                and keep your profile up to date with the latest work.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-neutral-400">
                Need help?
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                <li>Email: kittithat.dev@gmail.com</li>
                <li>Phone: +66 95 643 3948</li>
              </ul>
            </div>
          </div>
          <div className="px-8 py-12 sm:px-12">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
                ZEnd
              </p>
              <h2 className="text-3xl font-semibold text-neutral-900">
                Sign in
              </h2>
              {/* <p className="text-sm text-neutral-500">
                Continue to your workspace. Don&apos;t have an account yet?{" "}
                <Link
                  href="/register"
                  className="font-medium text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600"
                >
                  Create one
                </Link>
              </p> */}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-neutral-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="you@zend.studio"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-neutral-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formState.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 shadow-[0_1px_0_rgba(15,23,42,0.04)] outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formState.remember}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:ring-offset-0"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-neutral-900 underline underline-offset-4 transition hover:text-neutral-600"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-900/15 transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 disabled:cursor-not-allowed disabled:bg-neutral-700"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-dashed border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-neutral-400">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { provider: "Google", href: "#google" },
                  { provider: "GitHub", href: "#github" },
                  { provider: "LinkedIn", href: "#linkedin" },
                ].map((provider) => (
                  <Link
                    key={provider.provider}
                    href={provider.href}
                    className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-neutral-900/20 hover:text-neutral-900"
                  >
                    {provider.provider}
                  </Link>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;

