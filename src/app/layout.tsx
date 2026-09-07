import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'MathLab Kids - 대한민국 초등 연산 학습 연구소',
  description: '규칙 기반 초등 수학 연산 문제 생성, 온라인 풀이, A4 학습지 인쇄 서비스',
  icons: {
    icon: [
      { url: '/Math/favicon.ico' },
      { url: '/favicon.ico' },
      { url: '/Math/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/Math/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/Math/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/Math/favicon.ico', '/favicon.ico'],
    apple: ['/Math/apple-touch-icon.png', '/apple-touch-icon.png'],
  },
  manifest: '/Math/site.webmanifest',
  appleWebApp: {
    title: 'MathLab Kids',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 브라우저 탭 아이콘 즉각 표시를 위한 SVG 데이터 URI (캐시/경로 문제 100% 방지) */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='100%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%2310B981'/%3E%3Cstop offset='100%25' stop-color='%232DD4BF'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='512' height='512' rx='130' fill='url(%23g)'/%3E%3Ctext x='50%25' y='53%25' font-family='system-ui, -apple-system, sans-serif' font-weight='900' font-size='270' fill='%23FFFFFF' text-anchor='middle' dominant-baseline='middle' letter-spacing='-10'%3EM+%3C/text%3E%3C/svg%3E"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/Math/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Math/favicon-16x16.png" />
        <link rel="shortcut icon" href="/Math/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/Math/apple-touch-icon.png" />
      </head>
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
