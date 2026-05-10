"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1C1917] mb-1">Welcome back</h2>
        <p className="text-[#78716C]">
          Sign in to continue managing your home together
        </p>
      </div>

      {/* Google sign in */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-[#E7E5E4] bg-white text-[#1C1917] text-sm font-medium hover:bg-gray-50 transition-colors mb-6"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#E7E5E4]" />
        <span className="text-xs text-[#78716C]">or continue with email</span>
        <div className="flex-1 h-px bg-[#E7E5E4]" />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          leftAddon={<Mail className="h-4 w-4" />}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            autoComplete="current-password"
            leftAddon={<Lock className="h-4 w-4" />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-[#1C1917] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs text-[#78716C] hover:text-primary-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-[#78716C] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}
