import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "365Scores Quiz",
  description: "Compete for the top spot on the 365Scores live quiz leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <main className="flex  justify-center bg-gradient-to-br from-zinc-50 via-white to-blue-50 px-6 pt-30 pb-16 font-sans dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/40">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
