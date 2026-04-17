import type { Metadata } from "next";
import { Kanit, Sarabun, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["800", "900"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TLC-mission CRM — ระบบติดตามพันธกิจ",
  description: "ระบบติดตามพันธกิจคริสตจักรแบบครบวงจร สำหรับทีมพันธกิจกาฬสินธุ์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} ${sarabun.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-deep text-text-main">
        {children}
      </body>
    </html>
  );
}
