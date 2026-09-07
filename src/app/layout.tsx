import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

export const metadata: Metadata = {
  title: 'MathLab Kids - 대한민국 초등 연산 학습 연구소',
  description: '규칙 기반 초등 수학 연산 문제 생성, 온라인 풀이, A4 학습지 인쇄 서비스',
  icons: {
    icon: [
      { url: `${cleanBasePath}/favicon.ico` },
      { url: '/favicon.ico' },
      { url: `${cleanBasePath}/favicon-32x32.png`, sizes: '32x32', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: `${cleanBasePath}/favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: `${cleanBasePath}/favicon.svg`, type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: [`${cleanBasePath}/favicon.ico`, '/favicon.ico'],
    apple: [`${cleanBasePath}/apple-touch-icon.png`, '/apple-touch-icon.png'],
  },
  manifest: `${cleanBasePath}/site.webmanifest`,
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
        <link rel="icon" type="image/png" sizes="32x32" href={`${cleanBasePath}/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${cleanBasePath}/favicon-16x16.png`} />
        <link rel="shortcut icon" href={`${cleanBasePath}/favicon.ico`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${cleanBasePath}/apple-touch-icon.png`} />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 sm:py-6 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-1.5 sm:gap-2">
            <p className="font-medium text-slate-600">
              MathLab Kids · 대한민국 2022 개정 초등 교육과정 기준 연산 서비스
            </p>
            <p className="text-slate-400">
              로그인 없이 모든 문제를 자유롭게 만들고, 풀고, A4로 인쇄할 수 있습니다.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-slate-500">
              <a
                href="https://github.com/KwangYeonCHO/MathLab-Kids"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>
                  GitHub 오픈소스:{' '}
                  <span className="underline decoration-slate-300 underline-offset-2">
                    KwangYeonCHO/MathLab-Kids
                  </span>
                </span>
              </a>
              <span className="text-slate-300 hidden sm:inline">·</span>
              <span className="text-slate-400">MIT 라이선스 (무료 오픈소스)</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
