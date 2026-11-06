// Clock and schedule overlay for the venue TVs. agendaAt() works out what applies
// at a given moment from schedule.js; createAgenda() writes it to the page once a
// second, on the second, in Recife time whatever the device's timezone is.
import { HIDE_AT, LIMITS, SECTIONS, TIMEZONE } from './schedule.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

const hideAt = Date.parse(HIDE_AT);
const sections = SECTIONS.map((s, i) => {
  const next = SECTIONS[i + 1];
  const start = Date.parse(s.start);
  return { title: s.title, open: Boolean(s.open), start, end: next ? Date.parse(next.start) : Infinity };
});
const limits = LIMITS.map((l) => {
  const at = Date.parse(l.at);
  return { ...l, at, showFrom: Date.parse(l.showFrom), closedUntil: at + (l.closedMinutes ?? 0) * MINUTE };
});

function urgencyOf(limit, left) {
  if (left <= limit.criticalMinutes * MINUTE) return 'critical';
  if (left <= limit.urgentMinutes * MINUTE) return 'urgent';
  return 'calm';
}

function limitAt(t) {
  for (const limit of limits) {
    if (t < limit.showFrom) continue;
    if (t < limit.at) return { ...limit, left: limit.at - t, level: urgencyOf(limit, limit.at - t) };
    if (t < limit.closedUntil) return { ...limit, level: 'closed' };
  }
  return null;
}

// What the overlay shows at time t (ms since the epoch). `limit` fills the card at
// the top: the countdown to the start before the event, then the hard limits.
export function agendaAt(t) {
  if (t >= hideAt) return { visible: false };
  const first = sections[0];
  return {
    visible: true,
    current: sections.find((s) => s.start <= t && t < s.end) ?? null,
    next: sections.find((s) => s.start > t) ?? null,
    limit:
      t < first.start
        ? { title: 'O evento começa em', at: first.start, left: first.start - t, level: 'start' }
        : limitAt(t),
  };
}

const format = (options) => new Intl.DateTimeFormat('pt-BR', { timeZone: TIMEZONE, ...options });
// h23, because hour12: false turns midnight into 24:00 in some browsers.
const clockFormat = format({ hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateFormat = format({ weekday: 'long', day: 'numeric', month: 'long' });
const weekdayFormat = format({ weekday: 'long' });

const pad = (n) => String(n).padStart(2, '0');
const hourMinute = (t) => clockFormat.format(t).slice(0, 5);
const sameDay = (a, b) => dateFormat.format(a) === dateFormat.format(b);

// Durations round up, so they never read zero while there is still time left.
function duration(ms) {
  const minutes = Math.ceil(ms / MINUTE);
  const h = Math.floor(minutes / 60);
  if (!h) return `${minutes}min`;
  return minutes % 60 ? `${h}h ${pad(minutes % 60)}min` : `${h}h`;
}

const timeLeft = (ms) => {
  const left = duration(ms);
  return `${left === '1min' || left === '1h' ? 'falta' : 'faltam'} ${left}`;
};

// [number, unit] pairs: hours and minutes, then minutes and seconds in the last hour.
// Units, not 12:45, so a countdown can't be mistaken for the clock next to it.
function countdown(ms) {
  const seconds = Math.ceil(ms / SECOND);
  if (seconds <= 3600) return [[pad(Math.floor(seconds / 60)), 'min'], [pad(seconds % 60), 's']];
  const minutes = Math.ceil(seconds / 60);
  return [[pad(Math.floor(minutes / 60)), 'h'], [pad(minutes % 60), 'min']];
}

// "2026-11-08T12:45" (seconds optional) as Recife time; anything else is ignored.
function simulatedOffset(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value ?? '')) return 0;
  const t = Date.parse(`${value}-03:00`);
  return Number.isNaN(t) ? 0 : t - Date.now();
}

const put = (el, text) => {
  if (el.textContent !== text) el.textContent = text;
};

export function createAgenda(root, { now: simulated, onVisibility }) {
  const offset = simulatedOffset(simulated);
  const part = (selector) => root.querySelector(`.agenda__${selector}`);
  const hm = part('hm');
  const ss = part('ss');
  const date = part('date');
  const card = part('limit');
  const cardTitle = part('limit-title');
  const cardTime = part('countdown');
  const cardNumbers = cardTime.querySelectorAll('span');
  const cardUnits = cardTime.querySelectorAll('small');
  const cardNote = part('limit-note');
  const nowItem = part('now');
  const nowTitle = nowItem.querySelector('.agenda__title');
  const nowMeta = nowItem.querySelector('.agenda__meta');
  const nextItem = part('next');
  const nextTitle = nextItem.querySelector('.agenda__title');
  const nextMeta = nextItem.querySelector('.agenda__meta');

  // Read by main.js: `visible` moves the art aside, `covers` means nothing shows behind.
  const state = { visible: false, covers: false };

  function setVisible(visible) {
    state.visible = visible;
    root.hidden = !visible;
    root.parentElement.classList.toggle('tv--agenda', visible);
  }

  function renderCard(t, limit) {
    card.hidden = !limit;
    root.dataset.level = limit?.level ?? 'none';
    state.covers = limit?.level === 'critical';
    if (!limit) return;

    const closed = limit.level === 'closed';
    put(cardTitle, closed ? limit.closedTitle : limit.title);
    cardTime.hidden = closed;
    if (!closed) {
      countdown(limit.left).forEach(([number, unit], i) => {
        put(cardNumbers[i], number);
        put(cardUnits[i], unit);
      });
    }

    const day = sameDay(t, limit.at) ? 'hoje' : weekdayFormat.format(limit.at);
    const at = hourMinute(limit.at);
    if (closed) put(cardNote, `O prazo encerrou às ${at}`);
    else if (limit.level === 'critical') put(cardNote, `Envie agora: encerra às ${at}`);
    else if (limit.level === 'start') put(cardNote, `${day} às ${at}`);
    else put(cardNote, limit.note ?? `Encerra ${day} às ${at}`);
  }

  function renderSections(t, { current, next }) {
    nowItem.hidden = !current;
    if (current) {
      put(nowTitle, current.title);
      nowMeta.hidden = current.open;
      put(nowMeta, current.open ? '' : `${timeLeft(current.end - t)} · até ${hourMinute(current.end)}`);
    }

    nextItem.hidden = !next;
    if (next) {
      const day = sameDay(t, next.start) ? '' : `${weekdayFormat.format(next.start)} `;
      put(nextTitle, next.title);
      put(nextMeta, `${day}${hourMinute(next.start)} · em ${duration(next.start - t)}`);
    }
  }

  function render(t) {
    const agenda = agendaAt(t);
    if (agenda.visible !== state.visible) setVisible(agenda.visible);
    state.covers = false;
    if (!agenda.visible) return;

    const clock = clockFormat.format(t);
    put(hm, clock.slice(0, 5));
    put(ss, clock.slice(5));
    put(date, dateFormat.format(t));
    renderCard(t, agenda.limit);
    renderSections(t, agenda);
  }

  function tick() {
    const t = Date.now() + offset;
    // Queue the next tick first: one bad render must not leave a frozen clock on the TV.
    setTimeout(tick, SECOND - (t % SECOND));
    const before = state.visible;
    render(t);
    if (state.visible !== before) onVisibility();
  }

  render(Date.now() + offset);
  setTimeout(tick, SECOND - ((Date.now() + offset) % SECOND));
  return state;
}
