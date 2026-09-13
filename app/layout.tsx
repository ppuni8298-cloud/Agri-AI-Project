import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agri AI",
  description: "AI-Based Agricultural Advisory System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}