import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { EVENT, LUMA, SITE_URL } from './src/config.js';

// schema.org Event for search engines, built from the facts in src/config.js
// so the <head> never drifts from the page. Organizer and sponsor names/URLs
// mirror src/components/Logos.jsx.
function eventJsonLd() {
  const [locality, region] = EVENT.city.split(',').map((s) => s.trim());
  const street = EVENT.venueAddress.match(/\(([^)]+)\)/)?.[1] ?? EVENT.venueAddress;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: EVENT.name,
    description:
      `${EVENT.name} é um hackathon presencial e gratuito de AI Agents no ${EVENT.venue}, em ${locality}, ` +
      `nos dias ${EVENT.dates}. ${EVENT.builders} participantes selecionados a partir das inscrições, ` +
      'dois dias de hacking e um Demo Day ao vivo.',
    url: SITE_URL,
    image: [`${SITE_URL}og-image.jpg`],
    inLanguage: 'pt-BR',
    startDate: EVENT.start,
    endDate: EVENT.end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: true,
    maximumAttendeeCapacity: Number(EVENT.builders),
    location: {
      '@type': 'Place',
      name: EVENT.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: street,
        addressLocality: locality,
        addressRegion: region,
        addressCountry: 'BR',
      },
    },
    organizer: [
      { '@type': 'Organization', name: 'Ligia (CIn-UFPE)', url: 'https://www.instagram.com/ligia.ufpe/' },
      { '@type': 'Organization', name: 'TAIL (UFPB)', url: 'https://tail-tech.com/' },
    ],
    sponsor: { '@type': 'Organization', name: 'Tako', url: 'https://tako.ai/' },
    offers: {
      '@type': 'Offer',
      url: LUMA.eventUrl,
      price: 0,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      validFrom: EVENT.applicationsFrom,
      validThrough: EVENT.applicationsTo,
    },
  };

  return {
    name: 'event-json-ld',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(data).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ];
    },
  };
}

// Relative base so the build works from any host or sub-path
// (Vercel, GitHub Pages under /ligia-challenge/, or a plain file server).
export default defineConfig({
  base: './',
  plugins: [react(), eventJsonLd()],
});
