import type { Metadata } from "next";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

import { PageLayout } from "@/components/PageLayout";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

export const metadata: Metadata = {
  title: "Logistics Inventory – Электрондық компоненттерді басқару жүйесі",
  description: "IL үшін тегін және ашық электрондық компоненттерді басқару жүйесі",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: Session | null = await getServerSession();

  return (
    <html lang="kk">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/icon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Logistics Inventory" />
        <meta
          property="og:description"
          content="IL үшін тегін және ашық электрондық компоненттерді басқару жүйесі"
        />
        <meta
          name="description"
          content="IL үшін тегін және ашық электрондық компоненттерді басқару жүйесі"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Logistics Inventory" />
        <meta
          name="keywords"
          content="Logistics Inventory, Электрондық компоненттер, Басқару жүйесі, LCSC, BOM"
        />
        <meta name="google" content="notranslate" />
      </head>
      <body>
      <PageLayout session={session}>
        {children}
      </PageLayout>
      </body>
    </html>
  );
} 