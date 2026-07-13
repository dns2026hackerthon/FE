import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppBootstrap } from '@/components/AppBootstrap';

export const metadata: Metadata = {
  title: '안전한 동네',
  description: '동네의 위험 정보를 신고하고 공유하는 커뮤니티 안전 서비스',
  manifest: '/manifest.webmanifest',
  applicationName: '안전한 동네',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '안전한 동네',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#F59E0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        <AppBootstrap>{children}</AppBootstrap>
      </body>
    </html>
  );
}
