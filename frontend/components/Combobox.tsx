'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
};

export default function Combobox({ value, onChange, options, placeholder, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = value
    ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
    : options;

  useEffect(() => {
    if (highlighted < 0 || !listRef.current) return;
    const item = listRef.current.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  function select(option: string) {
    onChange(option);
    setOpen(false);
    setHighlighted(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlighted((prev) => (prev + 1) % filtered.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (event.key === 'Enter') {
      if (open && highlighted >= 0 && filtered[highlighted]) {
        event.preventDefault();
        select(filtered[highlighted]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      setHighlighted(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-32">
      <input
        className="border border-brand-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-stone-100"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
      />

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-brand-200 rounded-lg shadow-lg"
        >
          {filtered.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                className={`w-full text-left px-3 py-2 text-sm transition ${
                  index === highlighted
                    ? 'bg-brand-500 text-white font-medium'
                    : 'hover:bg-brand-50'
                }`}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => select(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}