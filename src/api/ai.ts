import type { AiSuggestion } from '@/types';
import { delay } from './http';

/**
 * 사진 기반 AI 위험 분석 (스텁).
 * 실제로는 서버에 이미지를 올려 위험 유형/위험도/설명을 추론한다.
 * 위치는 AI가 아니라 기기 GPS로 얻으므로 여기서 제안하지 않는다.
 */
const SAMPLES: AiSuggestion[] = [
  {
    hazardType: '도로 파손',
    risk: 8,
    title: '파손된 보도블록 주의',
    description:
      '보도블록이 깨져 보행 시 발이 걸리거나 넘어질 위험이 있습니다. 야간 보행 시 특히 주의가 필요합니다.',
  },
  {
    hazardType: '싱크홀',
    risk: 6,
    title: '도로 침하 / 포트홀 의심',
    description:
      '도로 표면이 내려앉거나 파여 차량 통행 시 위험이 예상됩니다. 우천 시 확인이 어려워 사고 위험이 있습니다.',
  },
  {
    hazardType: '누전',
    risk: 5,
    title: '시설물 파손 / 조명 고장',
    description:
      '공공 시설물이 파손되었거나 조명이 꺼져 있어 이용에 불편과 안전 우려가 있습니다.',
  },
];

export async function analyzePhoto(_imageDataUrl: string): Promise<AiSuggestion> {
  void _imageDataUrl;
  // 데모: 랜덤 샘플 하나 반환
  const pick = SAMPLES[Math.floor(Math.random() * SAMPLES.length)] ?? {
    hazardType: '기타',
    risk: 5,
    title: '',
    description: '',
  };
  return delay(structuredClone(pick), 900);
}
