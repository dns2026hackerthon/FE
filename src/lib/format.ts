// 시간/숫자 포맷 유틸

/** ISO 문자열을 "오늘 09:42", "어제 20:16", "3일 전" 형태로 변환 */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const time = `${hh}:${mm}`;

  if (dayDiff === 0) return `오늘 ${time}`;
  if (dayDiff === 1) return `어제 ${time}`;
  if (dayDiff < 7) return `${dayDiff}일 전`;

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** "1시간 전", "방금 전" 같은 짧은 상대시간 (댓글용) */
export function formatShortRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

/** 1234 -> "1.2k" 는 과하니 그대로 표시. 자리수 콤마만. */
export function formatCount(n: number): string {
  return n.toLocaleString('ko-KR');
}
