import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SmartPay",
  description:
    "AI-optimized group expense management with real payment integration and immutable settlement logging. Powered by AI. Secured by Blockchain.",
  keywords: [
    "expense management",
    "AI finance",
    "group payments",
    "settlement",
    "blockchain verification",
    "fintech",
  ],
  authors: [{ name: "SmartPay" }],
  openGraph: {
    title: "SmartPay",
    description:
      "AI-optimized group expense management with real payment integration and immutable settlement logging.",
    type: "website",
    locale: "en_US",
    siteName: "SmartPay",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartPay",
    description:
      "AI-optimized group expense management with real payment integration and immutable settlement logging.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
