import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Papergraph - 学术论文排行榜平台",
  description: "一个基于多维度评价体系的学术论文排名和分享平台，让优质研究获得应有的关注。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <NavBar />
          <main className="pt-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}