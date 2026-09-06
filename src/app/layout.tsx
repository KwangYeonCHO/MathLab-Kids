import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'MathLab Kids - 대한민국 초등 연산 학습 연구소',
  description: '규칙 기반 초등 수학 연산 문제 생성, 온라인 풀이, A4 학습지 인쇄 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium text-slate-600">
              MathLab Kids · 대한민국 2022 개정 초등 교육과정 기준 연산 서비스
            </p>
            <p className="mt-1 text-slate-400">
              로그인 없이 모든 문제를 자유롭게 만들고, 풀고, A4로 인쇄할 수 있습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
