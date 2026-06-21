import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeepney Jump — A Flappy Bird Adventure",
  description:
    "Pick your flyer and dodge jeepneys through the streets of the Philippines in this Flappy Bird-style game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
