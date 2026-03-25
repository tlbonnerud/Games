import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixelHeading = Press_Start_2P({
  variable: "--font-pixel-heading",
  subsets: ["latin"],
  weight: "400",
});

const pixelBody = VT323({
  variable: "--font-pixel-body",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Pixel Chicken Farm Factory",
  description: "Incremental pixel-art clicker med chicken factory-progresjon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`${pixelHeading.variable} ${pixelBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
