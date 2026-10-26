import { CONTACT, EVENT, LUMA, NAV_LINKS } from '../config.js';
import logo from '../assets/logos/converge-logo.svg';
import Icon from './Icon.jsx';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <img src={logo} alt="Converge Challenge, powered by Tako" width="1080" height="503" loading="lazy" />
            <p>
              O hackathon de AI Agents do Nordeste. {EVENT.dates} · {EVENT.venueAddress}, {EVENT.city}.
            </p>
          </div>

          <nav className="footer__col" aria-label="Rodapé">
            <h2>Navegação</h2>
            {NAV_LINKS.map(({ id, label }) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className="footer__col">
            <h2>Contato</h2>
            <a href={`mailto:${CONTACT.email}`}>
              <Icon name="mail" size={16} /> {CONTACT.email}
            </a>
            <a href={CONTACT.instagram.url} target="_blank" rel="noreferrer">
              <Icon name="instagram" size={16} /> {CONTACT.instagram.handle}
              <span className="visually-hidden"> (Instagram, abre em nova aba)</span>
            </a>
          </div>

          <div className="footer__col">
            <h2>Inscrição</h2>
            <a href={LUMA.eventUrl} target="_blank" rel="noreferrer">
              Inscreva-se no Luma <Icon name="arrowUpRight" size={16} />
              <span className="visually-hidden"> (abre em nova aba)</span>
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Converge Challenge · Ligia (CIn-UFPE) &amp; TAIL (UFPB).</p>
          <a href="#top" className="footer__top-link">
            Voltar ao topo <Icon name="arrowDown" size={14} style={{ transform: 'rotate(180deg)' }} />
          </a>
        </div>
      </div>

      <p className="footer__giant" aria-hidden="true">
        CONVERGE
      </p>
    </footer>
  );
}
