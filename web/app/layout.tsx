import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SettingsProvider } from "@/lib/settings-context";

const notoKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "成语学习 - 파수대 중국어 성어 학습",
  description: "파수대 연구용 기사에서 추출한 중국어 성어/관용어를 퀴즈, 빈칸 채우기, 플래시카드로 학습하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoKR.variable} ${notoSC.variable} antialiased min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30`}>
        <SettingsProvider>
          <Navigation />
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
        </SettingsProvider>
      </body>
    </html>
  );
}
