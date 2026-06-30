import { Footer } from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import "@/styles/globals.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

import styles from "./layout.module.scss";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "LinguaBoost — Умный тренажер английского языка",
  description:
    "Эффективное запоминание английской лексики с помощью ИИ-образов и аудио-озвучки",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className={styles.wrapper}>
            <Header />
            <main className={styles.mainContent}>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
