import { EVENT } from '../config.js';
import AsciiTorus from './AsciiTorus.jsx';
import Icon from './Icon.jsx';
import { Logo, ORGANIZERS, PARTNERS, SUPPORTERS } from './Logos.jsx';
import logo from '../assets/logos/converge-logo.svg';
import './Hero.css';

export default function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__grid" />
      </div>
      {/* The torus may drift behind the nav, the title and the logo strip: the mask
          on .hero__art dims it under copy, and the nav pill and the strip are frosted glass. */}
      <div className="hero__art" aria-hidden="true">
        <AsciiTorus className="hero__torus" />
      </div>

      <div className="container hero__inner">
        <p className="hero__badge rise" style={{ '--i': 0 }}>
          <span className="hero__dot" />
          <span>Inscrições de {EVENT.applications}</span>
        </p>

        <h1 id="hero-title" className="hero__title rise" style={{ '--i': 1 }}>
          <img src={logo} alt="Converge Challenge, powered by Tako" width="1080" height="503" />
        </h1>

        <p className="hero__sub rise" style={{ '--i': 3 }}>
          O hackathon de <em>AI Agents</em> do Nordeste.
        </p>

        <ul className="hero__meta rise" style={{ '--i': 5 }}>
          <li>
            <Icon name="calendar" size={18} /> {EVENT.dates}
          </li>
          <li>
            <Icon name="clock" size={18} /> {EVENT.hours}
          </li>
          <li>
            <Icon name="check" size={18} /> Gratuito
          </li>
          {/* Forces the second row: place and seats. */}
          <li className="hero__meta-break" aria-hidden="true" />
          <li className="hero__meta-venue">
            <Icon name="pin" size={18} /> {EVENT.venue} · {EVENT.city}
          </li>
          <li>
            <Icon name="users" size={18} /> Vagas limitadas
          </li>
        </ul>

        <div className="hero__ctas rise" style={{ '--i': 6 }}>
          <a href="#register" className="btn">
            Inscreva-se <Icon name="arrow" size={18} className="arrow" />
          </a>
          {/* Sponsor section hidden for now.
          <a href="#sponsor" className="btn btn--ghost">
            Seja patrocinador
          </a>
          */}
        </div>
      </div>

      {/* Organizers lead in colour; partners and supporters share one quiet, smaller row. */}
      <div className="hero__strip rise" style={{ '--i': 8 }}>
        <div className="container hero__logos">
          <div className="hero__logo-group hero__logo-group--lead">
            <span className="hero__logo-label">Organizado por</span>
            <div className="hero__logo-list">
              {ORGANIZERS.map((o) => (
                <Logo key={o.id} logo={o} />
              ))}
            </div>
          </div>
          <div className="hero__logo-group hero__logo-group--quiet">
            <span className="hero__logo-label">Parceiros e apoio</span>
            <div className="hero__logo-list">
              {[...PARTNERS, ...SUPPORTERS].map((l) => (
                <Logo key={l.id} logo={l} className="logo--mono" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
