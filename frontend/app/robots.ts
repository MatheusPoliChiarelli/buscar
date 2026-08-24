import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscar-omega.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/entrar', '/anunciar', '/meus-anuncios', '/minha-revenda', '/redefinir-senha', '/esqueci-senha'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}