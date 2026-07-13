import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** 하단에서 올라오는 시트 형태의 모달 */
export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-navy/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-app rounded-t-3xl bg-surface p-5 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10" />
        {title && (
          <h3 className="mb-4 text-center text-[16px] font-bold text-ink">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}
