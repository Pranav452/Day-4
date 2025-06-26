import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Multimodal QA Agent | AI Vision Assistant",
  description: "Upload images and ask questions powered by Gemini Pro Vision. Analyze photos, extract text, identify objects, and get intelligent insights from your images.",
  keywords: ["AI", "Vision", "Image Analysis", "Gemini", "Multimodal", "Q&A", "Computer Vision"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Multimodal QA Agent",
    description: "AI-powered image analysis with natural language Q&A",
    type: "website",
    siteName: "Multimodal QA Agent",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multimodal QA Agent",
    description: "AI-powered image analysis with natural language Q&A",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${spaceMono.variable} font-sans antialiased bg-white dark:bg-gray-900 transition-colors duration-200`}
      >
        {children}
      </body>
    </html>
  );
}
