'use client';

import { DAYS, type HourBlock } from '@/lib/hours';

type Props = {
  value: HourBlock[];
  onChange: (value: HourBlock[]) => void;
};

export default function OpeningHoursFields({ value, onChange }: Props) {
  function updateBlock(index: number, patch: Partial<HourBlock>) {
    onChange(value.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function toggleDay(index: number, day: string) {
    const block = value[index];
    const days = block.days.includes(day)
      ? block.days.filter((d) => d !== day)
      : [...block.days, day];
    updateBlock(index, { days });
  }

  function addBlock() {
    onChange([...value, { days: [], open: '08:00', close: '18:00' }]);
  }

  function removeBlock(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {value.map((block, index) => (
        <div key={index} className="border border-brand-200 rounded-lg p-4">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const selected = block.days.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(index, day.key)}
                  className={`h-9 w-11 rounded-lg text-sm font-medium transition ${
                    selected
                      ? 'bg-brand-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">Das</span>
              <input
                type="time"
                value={block.open}
                onChange={(e) => updateBlock(index, { open: e.target.value })}
                className="border border-brand-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">às</span>
              <input
                type="time"
                value={block.close}
                onChange={(e) => updateBlock(index, { close: e.target.value })}
                className="border border-brand-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {value.length > 1 && (
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="ml-auto text-sm text-stone-500 hover:text-red-600 transition"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        + Adicionar outro horário
      </button>
    </div>
  );
}