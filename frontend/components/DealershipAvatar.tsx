import { photoUrl } from '@/lib/api';

type Props = {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: 'h-11 w-11 text-sm',
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
    const src = logoUrl.startsWith('blob:') || logoUrl.startsWith('http')
      ? logoUrl
      : photoUrl(logoUrl);

    return (
      <img
        src={src}
        alt=""
        className={`${SIZES[size]} shrink-0 rounded-full object-cover border border-brand-200 bg-white`}
      />
    );
  }

  return (
    <div
      className={`${SIZES[size]} shrink-0 rounded-full bg-white text-brand-700 font-bold flex items-center justify-center border border-brand-200`}
    >
      {initials}
    </div>
  );
}