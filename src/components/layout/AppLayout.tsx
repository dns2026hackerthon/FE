import type { ReactNode } from 'react';

/**
 * 모바일 앱 셸.
 * 데스크톱에서도 480px 폭으로 중앙 정렬되어 모바일 웹처럼 보인다.
 * withNav=true 이면 하단 탭바 공간을 확보한다.
 */
export function AppLayout({
  children,
  withNav = true,
}: {
  children: ReactNode;
  withNav?: boolean;
}) {
  return (
    <div className="app-shell flex min-h-full flex-col">
      <div className={`flex flex-1 flex-col ${withNav ? 'pb-20' : ''}`}>
        {children}
      </div>
    </div>
  );
}
