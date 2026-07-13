import { Icon } from './Icon';

/** 방패 로고 마크 (네이비 원 + 오렌지 방패) */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-2xl bg-navy text-brand"
      style={{ width: size, height: size }}
    >
      <Icon name="shield" size={size * 0.55} filled />
    </span>
  );
}

export function LogoWordmark() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={32} />
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold text-ink">안전한 동네</p>
        <p className="text-[9px] font-semibold tracking-widest text-ink-faint">
          SAFE NEIGHBORHOOD
        </p>
      </div>
    </div>
  );
}
