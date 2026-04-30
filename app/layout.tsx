import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelRecipe",
  description: "유튜브 쇼츠에서 레시피를 추출해요",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body style={{margin:0, padding:0, background:'#F9F7F5'}}>{children}</body>
    </html>
  );
}