import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import "./globals.css";
import { initDatabase } from '@/db/init';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "图书管理系统",
  description: "图书馆管理系统 - 基于 Next.js 和 Ant Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在应用启动时初始化数据库
  initDatabase().catch(console.error);

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
} 