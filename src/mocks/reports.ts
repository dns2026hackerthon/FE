import type { Report, Comment } from '@/types';

// 현재 시각 기준 상대 시각 생성 헬퍼 (오늘/어제 표시가 자연스럽게 보이도록)
const at = (dayOffset: number, hh: number, mm: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};

// Figma 시안의 4개 신고를 시드 데이터로 사용한다.
export const MOCK_REPORTS: Report[] = [
  {
    id: 'r1',
    category: 'walk',
    risk: 'high',
    title: '파손된 보도블록, 보행 주의',
    description:
      '횡단보도 인근 보도블록이 파손되어 보행 시 발이 걸릴 위험이 있습니다. 특히 야간에는 잘 보이지 않아 넘어질 수 있어 빠른 보수가 필요합니다.',
    address: '성북구 정릉로 77 인근',
    location: { lat: 37.6108, lng: 127.0189 },
    imageUrl: 'https://picsum.photos/seed/sidewalk/640/480',
    authorId: 'u2',
    authorNickname: '정릉동 주민',
    createdAt: at(0, 9, 42),
    viewCount: 128,
    likeCount: 24,
    likedByMe: false,
    commentCount: 1,
  },
  {
    id: 'r2',
    category: 'road',
    risk: 'mid',
    title: '골목길 도로 침하 구간',
    description:
      '골목길 중간에 도로가 내려앉아 물이 고이고 차량 통행 시 덜컹거립니다. 우천 시 웅덩이가 커져 보행자에게도 위험합니다.',
    address: '성북구 보국문로 14길',
    location: { lat: 37.6135, lng: 127.0102 },
    imageUrl: 'https://picsum.photos/seed/road/640/480',
    authorId: 'u3',
    authorNickname: '길음이',
    createdAt: at(0, 8, 18),
    viewCount: 83,
    likeCount: 12,
    likedByMe: false,
    commentCount: 0,
  },
  {
    id: 'r3',
    category: 'facility',
    risk: 'mid',
    title: '공원 조명 고장',
    description:
      '솔빛공원 산책로 입구 가로등이 여러 개 꺼져 있어 저녁 산책 시 매우 어둡습니다. 안전을 위해 조명 교체가 필요합니다.',
    address: '솔빛공원 산책로 입구',
    location: { lat: 37.6082, lng: 127.0221 },
    imageUrl: 'https://picsum.photos/seed/park/640/480',
    authorId: 'u4',
    authorNickname: '산책러',
    createdAt: at(-1, 20, 16),
    viewCount: 54,
    likeCount: 8,
    likedByMe: false,
    commentCount: 0,
  },
  {
    id: 'r4',
    category: 'safety',
    risk: 'low',
    title: '어두운 골목길 조명 요청',
    description:
      '아리랑로 8길 골목이 밤에 인적이 드물고 어두워 귀가 시 불안합니다. CCTV나 보안등 설치를 요청합니다.',
    address: '성북구 아리랑로 8길',
    location: { lat: 37.6051, lng: 127.0157 },
    imageUrl: 'https://picsum.photos/seed/alley/640/480',
    authorId: 'u5',
    authorNickname: '아리랑주민',
    createdAt: at(-1, 16, 5),
    viewCount: 31,
    likeCount: 5,
    likedByMe: false,
    commentCount: 0,
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    reportId: 'r1',
    authorNickname: '정릉동 주민',
    content: '어제 지나가면서도 위험해 보였어요. 빠른 조치가 필요합니다.',
    createdAt: (() => {
      const d = new Date();
      d.setHours(d.getHours() - 1);
      return d.toISOString();
    })(),
  },
];
