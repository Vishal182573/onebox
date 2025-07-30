import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EmailProvider } from "@/context/EmailContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Onebox",
  description: "Your AI-Powered Email Onebox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-100" suppressHydrationWarning>
      <body className={`${inter.className} h-full`}>
        <EmailProvider>{children}</EmailProvider>
      </body>
    </html>
  );
}