import { EVENT, LUMA } from '../config.js';
import { asciiOrb } from '../lib/ascii.js';
import Icon from './Icon.jsx';
import ScrambleText from './ScrambleText.jsx';
import './Register.css';

const ORB = asciiOrb(110, 52);

export default function Register() {
  return (
    <section id="register" className="section register" aria-labelledby="register-title">
      <pre className="ascii-bg register__orb" data-art={ORB} aria-hidden="true" />

      <div className="container register__grid">
        <div className="register__text">
          <p className="eyebrow" data-reveal>
            10 / Inscrição
          </p>
          <h2 id="register-title" className="register__title" data-reveal style={{ '--d': '80ms' }}>
            Pronto para <em>convergir</em>?
          </h2>
          <p className="lede" data-reveal style={{ '--d': '160ms' }}>
            Inscrições <strong>gratuitas</strong>, de <strong>{EVENT.applications}</strong>, pelo Luma. Entre os inscritos,{' '}
            <strong>{EVENT.builders}&nbsp;participantes</strong> serão selecionados para passar dois dias construindo AI
            agents que fazem trabalho de verdade.
          </p>

          <ul className="register__facts" data-reveal style={{ '--d': '220ms' }}>
            <li>
              <Icon name="clock" size={20} />
              <span>
                <small>Inscrições gratuitas</small>
                {EVENT.applications} · {EVENT.builders} participantes selecionados
              </span>
            </li>
            <li>
              <Icon name="calendar" size={20} />
              <span>
                <small>Quando</small>
                {EVENT.dates}, das {EVENT.hours}
              </span>
            </li>
            <li>
              <Icon name="pin" size={20} />
              <span>
                <small>Onde</small>
                {EVENT.venueAddress} · {EVENT.city}
              </span>
            </li>
            <li>
              <Icon name="users" size={20} />
              <span>
                <small>Quem</small>
                Tecnologia, empreendedorismo e design · estudantes e profissionais
              </span>
            </li>
          </ul>

          <a href={LUMA.eventUrl} target="_blank" rel="noreferrer" className="btn" data-reveal>
            Inscreva-se agora <Icon name="arrow" size={18} className="arrow" />
            <span className="visually-hidden"> (abre em nova aba)</span>
          </a>

          <p className="register__consent">
            Ao se inscrever, você concorda em compartilhar seus dados com a Ligia (CIn-UFPE), a TAIL (UFPB), a
            Tako e os demais patrocinadores e parceiros do evento, e autoriza o envio de novidades, anúncios e outras
            comunicações dessas organizações.
          </p>
        </div>

        <div className="register__embed" data-reveal="scale" style={{ '--d': '120ms' }}>
          <div className="register__window">
            <div className="register__bar" aria-hidden="true">
              <span className="term__dots">
                <i />
                <i />
                <i />
              </span>
              <ScrambleText text={LUMA.eventUrl.replace(/^https?:\/\//, '')} className="register__url" />
            </div>
            <iframe
              src={LUMA.embedUrl}
              title="Inscrição do Converge Challenge no Luma"
              width="600"
              height="800"
              loading="lazy"
              allow="fullscreen; payment"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
