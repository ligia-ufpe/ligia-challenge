import { Logo, SUPPORTERS } from './Logos.jsx';
import './Prizes.css';

// Prêmios da apresentação de abertura. O valor em destaque é sempre o de créditos AWS,
// para os US$ 5.000 do 2º e do 3º lugar não parecerem maiores que os R$ 3.000 do 1º.
const PODIUM = [
  {
    place: '1º lugar',
    amount: 'US$ 10.000',
    cash: 'R$ 3.000',
    extras: [
      'US$ 300 na Featherless',
      'Call direta com os sócios da Canastra para o AI Residency (fast track) ou vaga no Matchmaking 5',
    ],
  },
  {
    place: '2º lugar',
    amount: 'US$ 5.000',
    extras: ['Vaga garantida no Matchmaking 5 da Canastra'],
  },
  {
    place: '3º lugar',
    amount: 'US$ 5.000',
  },
];

const featherless = SUPPORTERS.find((s) => s.id === 'featherless');

export default function Prizes() {
  return (
    <section id="prizes" className="section prizes" aria-labelledby="prizes-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow" data-reveal>
            06 / Premiação
          </p>
          <h2 id="prizes-title" className="title" data-reveal style={{ '--d': '80ms' }}>
            O que está em <em>jogo</em>.
          </h2>
          <p className="lede" data-reveal style={{ '--d': '160ms' }}>
            <strong>US$ 20 mil em créditos AWS</strong> para os três melhores projetos, além de{' '}
            <strong>R$&nbsp;3.000 em dinheiro</strong> e <strong>US$&nbsp;300 na Featherless</strong> para o 1º lugar. Novos
            prêmios podem entrar conforme novos parceiros se juntarem ao evento.
          </p>
        </div>

        <ol className="prizes__podium" role="list">
          {PODIUM.map((p, i) => (
            <li
              key={p.place}
              className={`prizes__card spotlight ${i === 0 ? 'prizes__card--first' : ''}`}
              data-reveal
              style={{ '--d': `${i * 100}ms` }}
            >
              <span className="prizes__place">{p.place}</span>
              <p className="prizes__amount">
                {p.amount}
                <small>em créditos AWS</small>
              </p>
              {p.cash && (
                <p className="prizes__cash">
                  <strong>+ {p.cash}</strong> em dinheiro
                </p>
              )}
              {p.extras && (
                <ul className="prizes__extra" role="list">
                  {p.extras.map((extra) => (
                    <li key={extra}>{extra}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <div className="prizes__all" data-reveal>
          <span className="prizes__label">Para todos os participantes</span>
          <Logo logo={featherless} />
          <p>
            <strong>US$ 25 em créditos de inferência</strong> por participante. Rode agentes com mais de 40 mil modelos
            open source, contexto de até 256K e API compatível com OpenAI.
          </p>
          <span className="prizes__more">+ novos benefícios conforme novos parceiros se juntarem</span>
        </div>
      </div>
    </section>
  );
}
