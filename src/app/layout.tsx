import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RemoveDevIndicator } from "../components/ui/RemoveDevIndicator";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ប្រព័ន្ធឌីជីថលសម្រាប់សម្គាល់អត្ថបទក្នុងឯកសារ | Government Document Intelligence System",
  description: "Official Cambodian Government Document Intelligence and OCR Recognition System",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" className="h-full">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F5F7FA] text-[#172B4D] antialiased overflow-x-hidden">
        <RemoveDevIndicator />
        {children}
      </body>
    </html>
  );
}
