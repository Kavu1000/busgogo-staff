import type { Metadata } from "next";
import { Inter, Noto_Sans_Lao } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoFont = Noto_Sans_Lao({
  subsets: ["lao"],
  variable: "--font-noto-lao",
});

export const metadata: Metadata = {
  title: "Bus Ticket Staff",
  description: "Dashboard for Bus Ticket Staff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning />
      <body className={`${interFont.variable} ${notoFont.variable} antialiased`} suppressHydrationWarning>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
