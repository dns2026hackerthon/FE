'use client';

import { useEffect, useState } from 'react';
import type { CategoryId } from '@/types';
import { useUiStore } from '@/store/uiStore';
import { CATEGORIES, HAZARDS_BY_CATEGORY, CATEGORY_MAP } from '@/constants/categories';
import { Icon } from '@/components/common/Icon';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * 왼쪽 슬라이드 사이드바(드로어) — 카테고리 세분화 필터.
 * 대분류 4개 아래에 세부 위험유형을 계층으로 나열하고, 상단에 위험유형을
 * 직접 입력해 필터링(검색)할 수 있다.
 */
export function CategorySidebar({ open, onClose }: Props) {
  const { category, hazardType, setCategory, setHazardType } = useUiStore();
  const [text, setText] = useState('');

  // 드로어를 열 때 현재 필터 상태를 입력창에 반영, 배경 스크롤 잠금
  useEffect(() => {
    if (open) {
      setText(hazardType ?? '');
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const selectAll = () => {
    setCategory(null);
    setHazardType(null);
    onClose();
  };

  const selectCategory = (c: CategoryId) => {
    setCategory(c);
    setHazardType(null);
    onClose();
  };

  const selectHazard = (c: CategoryId, hazard: string) => {
    setCategory(c);
    setHazardType(hazard);
    onClose();
  };

  const submitText = () => {
    const v = text.trim();
    // 직접 입력은 필터링 전용 검색 — 대분류는 해제하고 유형 텍스트로만 거른다.
    setHazardType(v || null);
    setCategory(null);
    onClose();
  };

  const isAll = !category && !hazardType;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 왼쪽 패널 */}
      <aside className="safe-bottom relative flex h-full w-[82%] max-w-[320px] flex-col bg-canvas shadow-2xl">
        <header className="flex items-center justify-between border-b border-black/5 px-4 py-3.5">
          <h2 className="text-[16px] font-bold text-ink">카테고리</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink active:bg-black/5"
            aria-label="닫기"
          >
            <Icon name="x" size={20} />
          </button>
        </header>

        {/* 직접 입력 검색 */}
        <form
          className="px-4 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            submitText();
          }}
        >
          <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-surface px-3 py-2.5">
            <Icon name="search" size={16} className="text-ink-faint" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="위험 유형 직접 입력"
              className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
            />
            {text && (
              <button type="button" onClick={() => setText('')} aria-label="지우기">
                <Icon name="x" size={15} className="text-ink-faint" />
              </button>
            )}
          </div>
        </form>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* 전체 */}
          <button
            onClick={selectAll}
            className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-bold ${
              isAll ? 'bg-navy text-white' : 'text-ink active:bg-black/5'
            }`}
          >
            전체
            {isAll && <Icon name="check" size={16} />}
          </button>

          {/* 대분류 + 세부 유형 */}
          {CATEGORIES.map((c) => {
            const hazards = HAZARDS_BY_CATEGORY[c.id];
            const catActive = category === c.id && !hazardType;
            return (
              <div key={c.id} className="mt-1">
                <button
                  onClick={() => selectCategory(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-bold ${
                    catActive ? 'bg-navy text-white' : 'text-ink active:bg-black/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_MAP[c.id].color }}
                    />
                    {c.label}
                  </span>
                  {catActive && <Icon name="check" size={16} />}
                </button>

                {hazards.length > 0 && (
                  <div className="mb-1 mt-1 flex flex-wrap gap-1.5 pl-5">
                    {hazards.map((h) => {
                      const active = hazardType === h;
                      return (
                        <button
                          key={h}
                          onClick={() => selectHazard(c.id, h)}
                          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                            active
                              ? 'bg-brand text-white'
                              : 'bg-surface text-ink-muted border border-black/10'
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* 배경 (클릭 시 닫힘) */}
      <button
        className="h-full flex-1 bg-navy/40"
        onClick={onClose}
        aria-label="사이드바 닫기"
      />
    </div>
  );
}
