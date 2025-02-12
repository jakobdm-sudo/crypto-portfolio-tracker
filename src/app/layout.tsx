import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "~/styles/globals.css";
import { ThemeProvider } from "~/components/theme-provider";
import type React from "react"; // Added import for React
import ClientSessionProvider from "~/components/providers";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Portfolio",
  description: "A simple crypto portfolio tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TRPCReactProvider>
          <ClientSessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange


          >
              {children}
            </ThemeProvider>
          </ClientSessionProvider>
        </TRPCReactProvider>
      </body>
    </html>


  );
}
