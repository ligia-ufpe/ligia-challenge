import { useRef } from 'react';
import useInView from '../hooks/useInView.js';
import { EVENT } from '../config.js';
import CountUp from './CountUp.jsx';
import ScrambleText from './ScrambleText.jsx';
import './About.css';

const STATS = [
  { value: EVENT.builders, label: 'Participantes selecionados' },
  { value: '10h', label: 'De hacking intensivo' },
  { value: '2', label: `Dias no ${EVENT.venue}` },
  { value: '1', label: 'Demo Day com pitches ao vivo' },
];

export default function About() {
  const wordsRef = useRef(null);
  const wordsIn = useInView(wordsRef, { threshold: 0.4 });

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__grid">
          <div className="about__text">
            <p className="eyebrow" data-reveal>
              01 / Sobre
            </p>
            <h2 id="about-title" className="title" data-reveal style={{ '--d': '80ms' }}>
              Construindo o <em>ecossistema de AI Agents</em> do Nordeste.
            </h2>
            <p className="lede" data-reveal style={{ '--d': '160ms' }}>
              O <strong>Converge Challenge</strong> é um hackathon presencial que reúne builders:{' '}
              <strong>talentos de IA, engenheiros, designers e fundadores</strong> criando soluções reais com{' '}
              <strong>AI Agents</strong>. Conecta a comunidade de IA do <strong>Nordeste</strong>, com ligas como{' '}
              <strong>Ligia (UFPE)</strong>, <strong>TAIL (UFPB)</strong> e <strong>LIAO (UFBA)</strong>, ao ecossistema
              nacional de IA.
            </p>
          </div>

          <div className="about__words" ref={wordsRef} data-reveal="left" style={{ '--d': '200ms' }}>
            {['Construir.', 'Criar.', 'Convergir.'].map((w, i) => (
              <ScrambleText key={w} text={w} as="span" play={wordsIn} delay={i * 220} className="about__word" />
            ))}
          </div>
        </div>

        <dl className="about__stats">
          {STATS.map((s, i) => (
            <div className="about__stat spotlight" key={s.label} data-reveal style={{ '--d': `${i * 90}ms` }}>
              <dt>{s.label}</dt>
              <dd>
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
