import type { Metadata } from "next";

import Header from "@/components/Header";
import ChatAssistant from "@/components/ChatAssistant";
import ToolTabs from "@/components/Tabs";

import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto flex w-full max-w-[628px] flex-col gap-8 px-6 py-6 sm:py-10">
          <div className="flex justify-center">
            <ToolTabs />
          </div>
          {children}
        </main>
        <ChatAssistant />
      </body>
    </html>
  );
}
