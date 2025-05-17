import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foresight Protocol",
  description: "Decentralized prediction markets powered by Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              duration: 5000,
              style: {
                background: '#1C1C22',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                borderRadius: '0.5rem',
              },
              success: {
                iconTheme: {
                  primary: '#13ADC7',
                  secondary: '#1C1C22',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF5A5A',
                  secondary: '#1C1C22', 
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
