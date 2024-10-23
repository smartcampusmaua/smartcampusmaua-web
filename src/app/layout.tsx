import type { Metadata } from "next";
import {montserrat} from "@/app/ui/fonts";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "EcoVision",
  description: "SmartCampus Mauá",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className} antialiased`}>{children}</body>
    </html>
  );
}
