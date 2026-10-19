import { useEffect, useRef, useState } from 'react';
import { NAV_LINKS } from '../config.js';
import logo from '../assets/logos/converge-logo.svg';
import Icon from './Icon.jsx';
import './Nav.css';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [showBrand, setShowBrand] = useState(false);
  const progressRef = useRef(null);

  // The hero already shows the big wordmark, so the nav logo only appears
  // once that title has scrolled past the bar.
  useEffect(() => {
    const title = document.getElementById('hero-title');
    if (!title) {
      setShowBrand(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setShowBrand(!e.isIntersecting), {
      rootMargin: '-80px 0px 0px 0px',
    });
    io.observe(title);
    return () => io.disconnect();
  }, []);

  // Glass background once scrolled, hide on scroll down, show on scroll up,
  // and drive the thin progress bar.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 24);
      setHidden(y > 640 && y > lastY + 4);
      if (y < lastY - 4 || y < 640) setHidden(false);
      lastY = y;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the link of the section in the middle of the screen.
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    // Keep keyboard focus and screen readers inside the open sheet.
    const regions = [...document.querySelectorAll('main, footer')];
    for (const el of regions) el.toggleAttribute('inert', open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      for (const el of regions) el.removeAttribute('inert');
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !open ? 'is-hidden' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav__inner container">
        <a
          href="#top"
          className={`nav__brand ${showBrand || open ? 'is-visible' : ''}`}
          onClick={close}
          tabIndex={showBrand || open ? undefined : -1}
          aria-hidden={showBrand || open ? undefined : true}
          aria-label="Converge Challenge powered by Tako, voltar ao topo"
        >
          <img src={logo} alt="" width="1080" height="503" />
        </a>

        <nav className="nav__links" aria-label="Principal">
          {NAV_LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className={active === id ? 'is-active' : ''} onClick={close}>
              {label}
            </a>
          ))}
        </nav>

        <a href="#register" className="btn btn--sm nav__cta" onClick={close}>
          Inscreva-se <Icon name="arrow" size={16} className="arrow" />
        </a>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      <div id="mobile-menu" className="nav__sheet" hidden={!open}>
        <nav aria-label="Menu principal">
          {NAV_LINKS.map(({ id, label }, i) => (
            <a key={id} href={`#${id}`} onClick={close} style={{ '--i': i }}>
              <span aria-hidden="true">0{i + 1}</span>
              {label}
            </a>
          ))}
        </nav>
        <a href="#register" className="btn" onClick={close}>
          Inscreva-se <Icon name="arrow" size={18} className="arrow" />
        </a>
      </div>

      <span className="nav__progress" ref={progressRef} aria-hidden="true" />
    </header>
  );
}
