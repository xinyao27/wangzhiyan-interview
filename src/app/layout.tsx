import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
export const metadata: Metadata = {
  title: "Simple Chat Component",
  description: "A simple AI chat interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
