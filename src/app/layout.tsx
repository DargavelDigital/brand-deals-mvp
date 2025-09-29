import '@/styles/base.css';      // if you have it
import '@/app/globals.css';      // Tailwind layers + .container-page
import type { Metadata } from "next";
import ClientBoot from "@/components/providers/ClientBoot";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: "Hyper by Hype & Swagger",
  description: "The ultimate platform for creators to discover brand partnerships and grow their business.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ClientBoot />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
