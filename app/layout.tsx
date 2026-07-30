import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Header from "@/components/Header";
import ToolTabs from "@/components/Tabs";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-family-sans",
});

export const metadata: Metadata = {
  title: "AI tools",
  description: "AI tools for food images",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 py-10">
          <div className="flex justify-center">
            <ToolTabs />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
