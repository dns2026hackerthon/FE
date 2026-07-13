/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 배경 / 표면
        canvas: '#F5F1E8', // 크림색 앱 배경
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1F2937', // 기본 텍스트
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        // 브랜드 액센트 (오렌지)
        brand: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FEF3C7',
        },
        // 로고/네이비
        navy: '#1E293B',
        // 카테고리 컬러
        cat: {
          walk: '#0D9488', // 보행 안전
          road: '#EA580C', // 도로 위험
          facility: '#7C3AED', // 시설물
          safety: '#DB2777', // 치안
        },
        // 위험도
        risk: {
          low: '#16A34A',
          mid: '#D97706',
          high: '#DC2626',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Apple SD Gothic Neo',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 2px 8px rgba(31, 41, 55, 0.06)',
        nav: '0 -2px 12px rgba(31, 41, 55, 0.08)',
        fab: '0 6px 16px rgba(245, 158, 11, 0.4)',
      },
      maxWidth: {
        app: '480px',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
