import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";
import { isClerkConfigured } from "@/lib/clerk-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REMTX — Gestão de Locadora",
  description: "REMTX — Sistema de gestão para locadora de veículos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );

  if (!isClerkConfigured()) {
    return body;
  }

  return <ClerkProvider localization={ptBR}>{body}</ClerkProvider>;
}
