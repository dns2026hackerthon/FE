import type { AiSuggestion } from '@/types';
import { delay } from './http';
import { DEFAULT_CENTER } from '@/constants/categories';

/**
 * 사진 기반 AI 위험 분석 (스텁).
 * 실제로는 서버에 이미지를 올려 카테고리/위험도/설명/위치를 추론한다.
 * 지금은 그럴듯한 예시값을 반환한다.
 */
const SAMPLES: AiSuggestion[] = [
  {
    category: 'walk',
    risk: 'high',
    title: '파손된 보도블록 주의',
    description:
      '보도블록이 깨져 보행 시 발이 걸리거나 넘어질 위험이 있습니다. 야간 보행 시 특히 주의가 필요합니다.',
    address: '서울시 성북구 정릉로 77',
    location: { lat: 37.6108, lng: 127.0189 },
  },
  {
    category: 'road',
    risk: 'mid',
    title: '도로 침하 / 포트홀 의심',
    description:
      '도로 표면이 내려앉거나 파여 차량 통행 시 위험이 예상됩니다. 우천 시 확인이 어려워 사고 위험이 있습니다.',
    address: '서울시 성북구 보국문로 14길',
    location: { lat: 37.6135, lng: 127.0102 },
  },
  {
    category: 'facility',
    risk: 'mid',
    title: '시설물 파손 / 조명 고장',
    description:
      '공공 시설물이 파손되었거나 조명이 꺼져 있어 이용에 불편과 안전 우려가 있습니다.',
    address: '서울시 성북구 솔빛공원 인근',
    location: { lat: 37.6082, lng: 127.0221 },
  },
];

export async function analyzePhoto(_imageDataUrl: string): Promise<AiSuggestion> {
  void _imageDataUrl;
  // 데모: 랜덤 샘플 하나 반환
  const pick = SAMPLES[Math.floor(Math.random() * SAMPLES.length)] ?? {
    category: 'walk',
    risk: 'mid',
    title: '',
    description: '',
    address: '현재 위치',
    location: DEFAULT_CENTER,
  };
  return delay(structuredClone(pick), 900);
}
