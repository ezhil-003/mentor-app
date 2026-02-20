import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { headers } from "next/headers";
import { env } from "@/env";
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),

  title: {
    default: "Mentor Merlin Slot App",
    template: "%s | Mentor Merlin",
  },

  description: "Book and manage your training schedule efficiently.",

  keywords: ["training", "booking", "calendar", "mentorship"],

  authors: [{ name: "Mentor Team" }],

  openGraph: {
    type: "website",
    title: "Mentor Merlin Training Portal",
    description: "Manage your modules and schedule your training sessions.",
    url: env.NEXT_PUBLIC_BASE_URL,
    siteName: "Mentor Merlin",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mentor Training Portal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mentor Merlin Training Portal",
    description: "Manage your modules and schedule your training sessions.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce");

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        {/* 🚫 Mobile Blocker */}
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted md:hidden">
          <div className="rounded-xl border bg-card p-8 shadow-lg text-center space-y-4">
            <h1 className="text-2xl font-semibold">
              Mentor Merlin
            </h1>
            <p className="text-muted-foreground text-sm">
              This application is currently available on desktop devices only.
            </p>
          </div>
        </div>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
