import { Icon } from '@/components/common/Icon';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Enter로 검색을 확정했을 때 (지도뷰: 지역/장소 검색용) */
  onSubmit?: (value: string) => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = '위험 정보 검색',
  onSubmit,
}: Props) {
  return (
    <form
      className="px-4 pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 shadow-card">
        <Icon name="search" size={18} className="text-ink-faint" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} aria-label="지우기">
            <Icon name="x" size={16} className="text-ink-faint" />
          </button>
        )}
      </div>
    </form>
  );
}
