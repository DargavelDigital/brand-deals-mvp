import type { Metadata } from "next";
import "@/styles/base.css";
import "@/styles/tokens.css";
import "@/app/globals.css";
import ClientBoot from "@/components/providers/ClientBoot";

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
        <ClientBoot />
        {children}
      </body>
    </html>
  );
}
