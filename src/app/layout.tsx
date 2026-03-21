import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import JudeChatbot from "@/components/chatbot/JudeChatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Atopary Properties | Premium Real Estate in Ghana",
  description:
    "Discover luxury properties, homes, and commercial spaces across Ghana. Atopary Properties - Your trusted real estate partner.",
  keywords: "real estate, properties, Ghana, homes, luxury, buy, sell, rent",
  authors: [{ name: "McAforo", url: "https://www.mcaforo.com" }],
  creator: "McAforo",
  publisher: "Atopary Properties",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-icon.svg",
  },
  manifest: "/manifest.json",
  other: {
    "designer": "McAforo - https://www.mcaforo.com",
    "developer": "McAforo",
    "author": "McAforo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Atopary Properties",
              url: "https://www.atopary.com",
              description: "Premium Real Estate in Ghana",
              creator: {
                "@type": "Organization",
                name: "McAforo",
                url: "https://www.mcaforo.com",
                sameAs: ["https://www.mcaforo.com"],
              },
              developer: {
                "@type": "Organization",
                name: "McAforo",
                url: "https://www.mcaforo.com",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <JudeChatbot />
        </SessionProvider>
      </body>
    </html>
  );
}
