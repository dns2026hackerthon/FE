import type { ViewMode } from '@/types';
import { Icon } from '@/components/common/Icon';

interface Props {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}

/** 지도뷰 ↔ 피드뷰 세그먼트 토글 */
export function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="mx-4 mt-2 flex rounded-2xl bg-black/[0.04] p-1">
      <Segment
        active={value === 'map'}
        onClick={() => onChange('map')}
        icon="map"
        label="지도뷰"
      />
      <Segment
        active={value === 'feed'}
        onClick={() => onChange('feed')}
        icon="list"
        label="피드뷰"
      />
    </div>
  );
}

function Segment({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: 'map' | 'list';
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold transition ${
        active ? 'bg-surface text-ink shadow-card' : 'text-ink-faint'
      }`}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  );
}
