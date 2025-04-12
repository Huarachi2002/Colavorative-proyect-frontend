import { Work_Sans } from "next/font/google";

import "./globals.css";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

import Room from "./Room";

export const metadata = {
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
        <Room>{children}</Room>
      </body>
    </html>
  );
}

// export default RootLayout;
// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang='en'>
//       <body>{children}</body>
//     </html>
//   );
// }
