import type { Metadata } from "next";
import { Staatliches } from "next/font/google";
import "./globals.css";

const staatliches = Staatliches({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ANTTIPARK — Visual Designer",
  description: "Visual design and creative direction work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className={`${staatliches.className} h-full w-full bg-[#0a0a0a] text-white m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}
