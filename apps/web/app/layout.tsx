import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DuoHome — Run your home together",
  description:
    "The all-in-one home management app for couples. Manage finances, chores, meals, goals, and more — together.",
  keywords: ["home management", "couples app", "household management", "budget", "chores"],
  openGraph: {
    title: "DuoHome — Run your home together",
    description:
      "The all-in-one home management app for couples.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
