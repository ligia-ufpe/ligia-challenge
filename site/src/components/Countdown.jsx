import { Fragment, useEffect, useState } from 'react';
import { EVENT } from '../config.js';
import './Countdown.css';

const START = new Date(EVENT.start).getTime();
const END = new Date(EVENT.end).getTime();

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    ['dias', Math.floor(s / 86400)],
    ['h', Math.floor((s % 86400) / 3600)],
    ['min', Math.floor((s % 3600) / 60)],
    ['s', s % 60],
  ];
}

export default function Countdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Date.now() >= END) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now >= END) {
    return (
      <section className="section countdown-section" aria-label="Contagem regressiva">
        <div className="container">
          <p className="countdown__status">Foi incrível. Até a próxima edição.</p>
        </div>
      </section>
    );
  }
  if (now >= START) {
    return (
      <section className="section countdown-section" aria-label="Contagem regressiva">
        <div className="container">
          <p className="countdown__status">
            <span className="countdown__live" /> Ao vivo: hacking em andamento
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section countdown-section" aria-label="Contagem regressiva para a abertura">
      <div className="container countdown-section__inner">
        {/* No reveal here: it sits near the fold and must show without waiting for the observer. */}
        <p className="eyebrow countdown__label">
          Abertura em
        </p>
        <div className="countdown" role="timer" aria-label="Tempo até a abertura" data-reveal style={{ '--d': '120ms' }}>
          <div className="countdown__units">
            {parts(START - now).map(([unit, value], i) => (
              <Fragment key={unit}>
                {i > 0 && (
                  <span className="countdown__sep" aria-hidden="true">
                    :
                  </span>
                )}
                <div className="countdown__unit">
                  <span className="countdown__value">{String(value).padStart(2, '0')}</span>
                  <span className="countdown__name">{unit}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
