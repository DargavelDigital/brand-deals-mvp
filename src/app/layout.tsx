import type { Metadata } from "next";
import "@/styles/base.css";
import "@/styles/tokens.css";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Hyper by Hype & Swagger",
  description: "The ultimate platform for creators to discover brand partnerships and grow their business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
