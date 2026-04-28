import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinSight — AI-Powered Financial Literacy",
  description:
    "An AI-driven portfolio dashboard that explains market movements in plain language. Educational insights powered by Google Gemini for retail investors.",
  keywords: ["finance", "AI", "portfolio", "financial literacy", "stock analysis", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} dark`}
    >
      <body className="min-h-screen bg-[#0a0a0f] text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
