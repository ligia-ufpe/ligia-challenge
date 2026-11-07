import Icon from './Icon.jsx';
import './Audience.css';

// Icon.jsx has no design glyph, so this pen tool is drawn here in the same 24px line style.
function PenIcon({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 19l7-7 3 3-7 7z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
      <path d="M2 2l7.6 7.6" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

const PROFILES = [
  {
    icon: <Icon name="code" size={26} />,
    title: 'Tecnologia',
    text: 'Devs e pessoas de engenharia e dados, estudantes ou profissionais, que querem construir AI agents que funcionam de verdade.',
  },
  {
    icon: <Icon name="rocket" size={26} />,
    title: 'Empreendedorismo',
    text: 'Founders e empreendedores, ainda na universidade ou já no mercado, que veem em AI agents o centro do produto ou da operação.',
  },
  {
    icon: <PenIcon size={26} />,
    title: 'Design',
    text: 'Estudantes e profissionais de design que querem dar forma à experiência de quem usa AI agents no dia a dia.',
  },
];

const PERKS = [
  'Mentoria de profissionais do mercado',
  'Networking com participantes e parceiros',
  'Infraestrutura para construir seu projeto',
  'Palco para os 5 finalistas apresentarem ao vivo',
  'Avaliação por um júri de especialistas',
  'Prêmios para os três melhores projetos',
  'US$ 25 em créditos de inferência da Featherless',
];

export default function Audience() {
  return (
    <section id="who" className="section audience" aria-labelledby="who-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow" data-reveal>
            03 / Para quem é
          </p>
          <h2 id="who-title" className="title" data-reveal style={{ '--d': '80ms' }}>
            Feito para <em>builders</em>.
          </h2>
          <p className="lede" data-reveal style={{ '--d': '160ms' }}>
            Estudantes e profissionais do <strong>Nordeste</strong> em <strong>tecnologia</strong>,{' '}
            <strong>empreendedorismo</strong> e <strong>design</strong> que querem passar um fim de semana criando AI
            agents com quem constrói como eles. Os participantes são selecionados a partir das inscrições, e a régua é
            uma só: procuramos quem <strong>já construiu algo real</strong>, como agentes, ferramentas ou side projects de IA.
          </p>
        </div>

        <div className="audience__cards">
          {PROFILES.map((p, i) => (
            <article className="audience__card spotlight" key={p.title} data-reveal style={{ '--d': `${i * 100}ms` }}>
              <span className="audience__icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>

        <div className="audience__perks" data-reveal>
          <h3 className="audience__perks-title">
            O que você <em className="serif">ganha</em>
          </h3>
          <ul>
            {PERKS.map((perk) => (
              <li key={perk}>
                <Icon name="check" size={18} stroke={2.2} />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
