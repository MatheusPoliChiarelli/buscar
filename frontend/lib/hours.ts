export type HourBlock = {
  days: string[];
  open: string;
  close: string;
};

export const DAYS = [
  { key: 'mon', label: 'Seg' },
  { key: 'tue', label: 'Ter' },
  { key: 'wed', label: 'Qua' },
  { key: 'thu', label: 'Qui' },
  { key: 'fri', label: 'Sex' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
];

const ORDER = DAYS.map((d) => d.key);

function labelOf(key: string): string {
  return DAYS.find((d) => d.key === key)?.label || key;
}

function groupDays(days: string[]): string {
  const sorted = [...days].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  if (sorted.length === 0) return '';

  const ranges: string[][] = [];
  let current: string[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevIndex = ORDER.indexOf(sorted[i - 1]);
    const currIndex = ORDER.indexOf(sorted[i]);

    if (currIndex === prevIndex + 1) {
      current.push(sorted[i]);
    } else {
      ranges.push(current);
      current = [sorted[i]];
    }
  }
  ranges.push(current);

  return ranges
    .map((range) => {
      if (range.length === 1) return labelOf(range[0]);
      if (range.length === 2) return `${labelOf(range[0])} e ${labelOf(range[1])}`;
      return `${labelOf(range[0])} a ${labelOf(range[range.length - 1])}`;
    })
    .join(', ');
}

export function formatHours(json: string | null | undefined): string {
  if (!json) return '';

  try {
    const blocks: HourBlock[] = JSON.parse(json);
    if (!Array.isArray(blocks) || blocks.length === 0) return '';

    return blocks
      .filter((b) => b.days.length > 0 && b.open && b.close)
      .map((b) => `${groupDays(b.days)}: ${b.open} às ${b.close}`)
      .join(' · ');
  } catch {
    return '';
  }
}