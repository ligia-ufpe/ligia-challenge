// Official schedule for the TV overlay, in Recife time (UTC-3). To change a time,
// edit it here and reload the TVs.

export const TIMEZONE = 'America/Recife';

// Each section runs until the next one starts. `open: true` marks a section with
// no known end, which shows no time left.
export const SECTIONS = [
  { start: '2026-11-07T08:30:00-03:00', title: 'Credenciamento e café da manhã' },
  { start: '2026-11-07T09:30:00-03:00', title: 'Abertura' },
  { start: '2026-11-07T10:30:00-03:00', title: 'Hacking e rodadas de mentoria' },
  { start: '2026-11-07T13:00:00-03:00', title: 'Almoço no local' },
  { start: '2026-11-07T14:00:00-03:00', title: 'Continuação do hacking' },
  { start: '2026-11-07T17:00:00-03:00', title: 'Encerramento do dia', open: true },

  { start: '2026-11-08T08:30:00-03:00', title: 'Café da manhã' },
  // 09:30 comes from an older planning sheet; the organizers' email only says "manhã".
  { start: '2026-11-08T09:30:00-03:00', title: 'Hacking e rodadas de mentoria' },
  { start: '2026-11-08T13:00:00-03:00', title: 'Almoço no local' },
  { start: '2026-11-08T14:00:00-03:00', title: 'Banca avalia os projetos e seleciona o top 5' },
  { start: '2026-11-08T16:00:00-03:00', title: 'Pitch dos 5 finalistas' },
  { start: '2026-11-08T17:30:00-03:00', title: 'Premiação e encerramento', open: true },
];

// Hard limits are instants, separate from the sections, in time order. The first
// one showing wins the card at the top of the overlay.
//   showFrom         when its countdown appears
//   urgentMinutes    stronger from this many minutes before
//   criticalMinutes  strongest, full screen, from this many minutes before
//   closedMinutes    how long "closed" stays up after it passes
export const LIMITS = [
  {
    title: 'Início do hacking',
    at: '2026-11-07T10:30:00-03:00',
    showFrom: '2026-11-07T08:30:00-03:00',
    note: 'Nenhum código do projeto antes deste horário',
  },
  {
    title: 'Prazo final de submissão',
    at: '2026-11-08T13:00:00-03:00',
    showFrom: '2026-11-07T10:30:00-03:00',
    urgentMinutes: 60,
    criticalMinutes: 10,
    closedMinutes: 60,
    closedTitle: 'Submissões encerradas',
  },
];

// The last section has no known end, so the overlay leaves at a set time.
export const HIDE_AT = '2026-11-08T20:00:00-03:00';
