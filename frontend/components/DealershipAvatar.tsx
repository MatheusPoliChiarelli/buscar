import { photoUrl } from '@/lib/api';

type Props = {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-20 w-20 text-2xl',
};

export default function DealershipAvatar({ name, logoUrl, size = 'md' }: Props) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (logoUrl) {
    return (
      <img
        src={photoUrl(logoUrl)}
        alt={name}
        className={`${SIZES[size]} shrink-0 rounded-full object-cover border border-brand-200 bg-white`}
      />
    );
  }

  return (
    <div
      className={`${SIZES[size]} shrink-0 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center`}
    >
      {initials}
    </div>
  );
}