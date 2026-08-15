import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-brand-600 text-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <svg
            viewBox="0 -64 640 640"
            className="h-10 w-auto shrink-0 animate-drive-in fill-stone-900"
            aria-hidden="true"
          >
            <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
          </svg>

          <span className="text-2xl font-bold tracking-tight text-white">
            Bus<span className="text-stone-900">CAR</span>
          </span>
        </Link>

        <span className="text-sm text-brand-100">Ribeirão Preto - SP</span>
      </div>
    </header>
  );
}