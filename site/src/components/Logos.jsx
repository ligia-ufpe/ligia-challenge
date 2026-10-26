import tako from '../assets/logos/tako.png';
import ligia from '../assets/logos/ligia.svg';
import tail from '../assets/logos/tail.png';
import canastra from '../assets/logos/canastra.svg';
import portoDigital from '../assets/logos/porto-digital.png';
import cinUfpe from '../assets/logos/cin-ufpe.png';
import cesar from '../assets/logos/cesar.png';
import aws from '../assets/logos/aws.svg';
import featherless from '../assets/logos/featherless.svg';
import './Logos.css';

// Partner tiers, from the event's partner chart:
// - Tako bought naming rights: it always appears next to the event logo (see converge-logo.svg).
// - Organizers: show whenever possible.
// - Partners and supporters: endorsement only, show when there is room.

export const POWERED_BY = {
  id: 'tako',
  name: 'Tako',
  src: tako,
  width: 453,
  height: 120,
  url: 'https://tako.ai/',
  blurb: (
    <>
      A Tako está repensando como as empresas <strong>recrutam</strong> no Brasil, com{' '}
      <strong>agentes de IA</strong> como a Nara, sua recrutadora por voz.
    </>
  ),
};

export const ORGANIZERS = [
  {
    id: 'ligia',
    name: 'Ligia',
    src: ligia,
    width: 384,
    height: 127,
    url: 'https://www.instagram.com/ligia.ufpe/',
    blurb: (
      <>
        A liga acadêmica de Inteligência Artificial do <strong>CIn-UFPE</strong>, formada por estudantes e
        pesquisadores focados em <strong>IA e suas aplicações em problemas reais</strong>.
      </>
    ),
  },
  {
    id: 'tail',
    name: 'TAIL',
    src: tail,
    width: 309,
    height: 74,
    url: 'https://tail-tech.com/',
    blurb: (
      <>
        Liga de <strong>estudantes e professores da UFPB</strong> dedicada à{' '}
        <strong>pesquisa e ao ensino de IA</strong>, da graduação ao doutorado.
      </>
    ),
  },
];

export const PARTNERS = [
  { id: 'canastra', name: 'Canastra Ventures', src: canastra, width: 685, height: 200 },
  { id: 'porto-digital', name: 'Porto Digital', src: portoDigital, width: 440, height: 160 },
  { id: 'cin-ufpe', name: 'CIn-UFPE', src: cinUfpe, width: 523, height: 160 },
  { id: 'cesar', name: 'CESAR', src: cesar, width: 334, height: 200 },
];

// Gave tools and prizes to the participants.
export const SUPPORTERS = [
  { id: 'aws', name: 'AWS', src: aws, width: 304, height: 182 },
  { id: 'featherless', name: 'Featherless', src: featherless, width: 200, height: 200, label: true },
];

// One logo, optionally followed by its name for icon-only marks.
// Pass alt="" when the logo sits inside an already-labeled link.
export function Logo({ logo, className = '', alt }) {
  return (
    <span className={`logo logo--${logo.id} ${className}`}>
      <img src={logo.src} alt={alt ?? (logo.label ? '' : logo.name)} width={logo.width} height={logo.height} loading="lazy" />
      {logo.label && <span className="logo__name">{logo.name}</span>}
    </span>
  );
}
