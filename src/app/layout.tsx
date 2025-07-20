// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // Importe o provedor

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meritta Auth",
  description: "Projeto de autenticação com Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* Envolva os 'children' com o Providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}