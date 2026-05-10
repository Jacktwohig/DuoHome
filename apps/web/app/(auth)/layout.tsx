import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{
          background: "linear-gradient(135deg, #E8526A 0%, #f472b6 40%, #6366F1 100%)",
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm">
              {/* Two interlocking hearts SVG */}
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
              >
                <path
                  d="M18 10c-4 0-8 3-8 8 0 6 8 13 14 18 6-5 14-12 14-18 0-5-4-8-8-8-2.5 0-4.5 1.2-6 3-1.5-1.8-3.5-3-6-3z"
                  fill="white"
                  opacity="0.9"
                />
                <path
                  d="M26 14c-3 0-6 2.5-6 6 0 4.5 6 10 10.5 13.5 4.5-3.5 10.5-9 10.5-13.5 0-3.5-3-6-6-6-1.8 0-3.5 0.9-4.5 2.2-1-1.3-2.7-2.2-4.5-2.2z"
                  fill="white"
                  opacity="0.6"
                />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">
              DuoHome
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Run your home,
            <br />
            together.
          </h1>
          <p className="text-white/80 text-lg mb-10 max-w-sm">
            The all-in-one app for couples to manage finances, meals, chores, goals, and everything in between.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Finance",
              "Meal Planning",
              "Chores",
              "Goals",
              "Calendar",
              "Habits",
              "Notes",
              "Travel",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-sm font-medium backdrop-blur-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
          <p className="text-white/90 text-sm leading-relaxed">
            "DuoHome changed how we manage our household. We finally feel in sync about money, chores, and our future plans."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 fill-amber-300" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white/70 text-xs">Sarah & Mike, married 3 years</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAF8]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary-500">
              <svg viewBox="0 0 48 48" fill="none" className="h-5 w-5">
                <path
                  d="M18 10c-4 0-8 3-8 8 0 6 8 13 14 18 6-5 14-12 14-18 0-5-4-8-8-8-2.5 0-4.5 1.2-6 3-1.5-1.8-3.5-3-6-3z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1C1917]">DuoHome</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
