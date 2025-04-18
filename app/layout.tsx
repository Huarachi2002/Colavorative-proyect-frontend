import { Work_Sans } from "next/font/google";

import "./globals.css";

import Room from "./Room";
import { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "IUXC",
  description: "Primer Parcial SW 1",
};

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body className={`${workSans.className} bg-primary-grey-200`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
