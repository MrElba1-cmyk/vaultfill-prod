import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/ThemeProvider";
import { ModalProvider } from "@/contexts/ModalContext";
import FloatingChat from "@/components/FloatingChat";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = "https://vaultfill.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VaultFill — Automate Your Security Questionnaires",
    template: "%s | VaultFill",
  },
  description:
    "Turn your security evidence into a searchable Knowledge Vault. Draft questionnaire answers with RAG-based citations in minutes — not weeks. SOC 2, ISO 27001, SIG, DDQ.",
  keywords: [
    "security questionnaire automation",
    "SOC 2",
    "ISO 27001",
    "SIG questionnaire",
    "DDQ automation",
    "security compliance",
    "evidence management",
    "RAG citations",
  ],
  authors: [{ name: "VaultFill", url: SITE_URL }],
  creator: "VaultFill",
  publisher: "VaultFill",
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "VaultFill",
    title: "VaultFill — Automate Your Security Questionnaires",
    description:
      "Evidence-backed answers for security questionnaires. SOC 2, ISO 27001, SIG, DDQ — done in minutes, not weeks.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "VaultFill — Security Questionnaire Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VaultFill — Automate Your Security Questionnaires",
    description:
      "Draft security questionnaire answers with RAG-based citations in minutes. Built for enterprise compliance teams.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@vaultfill",
  },
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "security-contact": "security@vaultfill.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ModalProvider>
            {children}
            <FloatingChat />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
