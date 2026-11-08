import { useEffect, useRef } from 'react';
import { EVENT } from '../config.js';
import './Schedule.css';

// Programação oficial, a mesma da página do evento no Luma.
const DAYS = [
  {
    weekday: 'Sáb',
    day: '07',
    month: 'novembro de 2026',
    date: '2026-11-07',
    label: 'Sábado, 7 de novembro de 2026',
    theme: 'Abertura & construção',
    items: [
      ['08:30', 'Credenciamento & abertura', 'Check-in dos participantes e abertura oficial do evento.'],
      ['10:30', 'Início do hacking', 'Os times começam a construir, com almoço e mentorias ao longo do dia.'],
      ['17:00', 'Encerramento do 1º dia', 'Portas fecham. Amanhã tem mais construção.'],
    ],
  },
  {
    weekday: 'Dom',
    day: '08',
    month: 'novembro de 2026',
    date: '2026-11-08',
    label: 'Domingo, 8 de novembro de 2026',
    theme: 'Finalizar & Demo Day',
    items: [
      ['08:30', 'Retomada do hacking', 'De volta à construção para a reta final.'],
      ['13:00', 'Prazo de submissão', 'Último horário para enviar os projetos.'],
      ['16:30', 'Demo Day', 'Os times apresentam ao vivo o que construíram para o júri.'],
      ['17:30', 'Premiação & encerramento', 'Anúncio dos vencedores e encerramento oficial do evento.'],
    ],
  },
];

export default function Schedule() {
  const listRef = useRef(null);

  // Fill each day's timeline rail as the reader scrolls past it.
  useEffect(() => {
    const rails = [...(listRef.current?.querySelectorAll('.schedule__items') ?? [])];
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.6;
      for (const rail of rails) {
        const r = rail.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        rail.style.setProperty('--fill', p.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section id="schedule" className="section section--paper schedule" aria-labelledby="schedule-title">
      <div className="container">
        <div className="section-head schedule__head">
          <p className="eyebrow" data-reveal>
            05 / Programação
          </p>
          <h2 id="schedule-title" className="title" data-reveal style={{ '--d': '80ms' }}>
            Dois dias para <em>criar</em>.
          </h2>
          <p className="schedule__note" data-reveal style={{ '--d': '160ms' }}>
            {EVENT.venue}, {EVENT.city} · <strong>Presença obrigatória nos dois dias</strong> para todos os aprovados
          </p>
        </div>

        <div className="schedule__days" ref={listRef}>
          {DAYS.map((d, di) => (
            <article className="schedule__day" key={d.day} data-reveal style={{ '--d': `${di * 120}ms` }}>
              {/* The visual date block is abbreviated ("Sáb 07"); screen readers and the
                  heading outline get the full date as this day's heading instead. */}
              <h3 className="visually-hidden">
                {d.label}: {d.theme}
              </h3>
              <header className="schedule__date" aria-hidden="true">
                <span className="schedule__weekday">{d.weekday}</span>
                <span className="schedule__num">{d.day}</span>
                <span className="schedule__month">
                  {d.month}
                  <small>{d.theme}</small>
                </span>
              </header>

              <ol className="schedule__items">
                {d.items.map(([time, title, text]) => (
                  <li key={time + title} className="schedule__item">
                    <time dateTime={`${d.date}T${time}-03:00`}>{time}</time>
                    <div>
                      <h4>{title}</h4>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
