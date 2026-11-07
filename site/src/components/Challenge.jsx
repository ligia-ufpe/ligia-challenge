import { useRef, useState } from 'react';
import useInView from '../hooks/useInView.js';
import Terminal from './Terminal.jsx';
// Only the hidden sponsor note below uses it.
// import Icon from './Icon.jsx';
import './Challenge.css';

// As cinco direções de projeto da apresentação de abertura. Os logs do terminal são ilustrativos.
const AGENTS = [
  {
    id: 'back-office',
    title: 'Agente de back-office',
    text: 'Cuida de conciliação e faturamento de ponta a ponta.',
    lines: [
      { kind: 'cmd', text: 'converge run agent/back-office' },
      { kind: 'plan', text: 'conciliar faturas de outubro' },
      { kind: 'tool', text: 'erp.invoices(month=10)           482 ok' },
      { kind: 'exec', text: 'cruzar pagamentos ↔ faturas      471 conciliados' },
      { kind: 'check', text: 'regras de compliance (impostos, retenções) ok' },
      { kind: 'loop', text: 'sinalizar 11 divergências para revisão' },
      { kind: 'done', text: 'livros fechados · relatório enviado' },
    ],
  },
  {
    id: 'vendas',
    title: 'Agente de vendas',
    text: 'Pesquisa prospects, organiza o que encontra e mantém o CRM atualizado.',
    lines: [
      { kind: 'cmd', text: 'converge run agent/vendas' },
      { kind: 'plan', text: 'encontrar 50 prospects de fintechs no Nordeste' },
      { kind: 'tool', text: 'web.search + enrich(company, role) 50 ok' },
      { kind: 'exec', text: 'pontuar fit · redigir intros pessoais' },
      { kind: 'tool', text: 'crm.upsert(leads=50)             sincronizado' },
      { kind: 'loop', text: 'agendar follow-ups para a próxima semana' },
      { kind: 'done', text: 'pipeline +50 leads qualificados' },
    ],
  },
  {
    id: 'suporte',
    title: 'Sistema de suporte',
    text: 'Agentes que resolvem tickets de suporte ao cliente de forma autônoma.',
    lines: [
      { kind: 'cmd', text: 'converge run agent/suporte' },
      { kind: 'plan', text: 'triar 128 tickets abertos' },
      { kind: 'exec', text: 'classificar → rotear → redigir resposta' },
      { kind: 'tool', text: 'kb.search("política de reembolso")  4 resultados' },
      { kind: 'tool', text: 'helpdesk.close(ticket=4821)      resolvido' },
      { kind: 'loop', text: 'revisar 3 respostas de baixa confiança' },
      { kind: 'done', text: '125/128 resolvidos de forma autônoma' },
    ],
  },
  {
    id: 'operacoes',
    title: 'Agente de operações',
    text: 'Acompanha os processos, detecta a falha e corrige sem esperar por alguém.',
    lines: [
      { kind: 'cmd', text: 'converge run agent/operacoes' },
      { kind: 'plan', text: 'monitorar o fluxo de pedidos' },
      { kind: 'tool', text: 'logs.tail(service="pedidos")     1 erro' },
      { kind: 'exec', text: 'diagnosticar: fila parada há 12 min' },
      { kind: 'tool', text: 'queue.restart(worker=3)          ok' },
      { kind: 'check', text: 'fila normalizada · 87 pedidos reprocessados' },
      { kind: 'done', text: 'falha corrigida · incidente registrado' },
    ],
  },
  {
    id: 'rh',
    title: 'Digital worker de RH',
    text: 'O Desafio Tako: opcional, com os mesmos critérios. Tria candidatos e cuida dos follow-ups. Sinalize na submissão.',
    lines: [
      { kind: 'cmd', text: 'converge run agent/rh' },
      { kind: 'plan', text: 'triar 214 candidatos para "Backend Engineer"' },
      { kind: 'tool', text: 'ats.fetch(status="new")          214 ok' },
      { kind: 'exec', text: 'pontuar currículos pela rubrica   38 pré-selecionados' },
      { kind: 'tool', text: 'calendar.propose(slots=3)        enviado' },
      { kind: 'loop', text: 'follow-up com 6 candidatos silenciosos' },
      { kind: 'done', text: 'pipeline atualizado · 0 humanos acionados' },
    ],
  },
];

export default function Challenge() {
  const [active, setActive] = useState(0);
  const termRef = useRef(null);
  const inView = useInView(termRef, { threshold: 0.35 });

  const agent = AGENTS[active];
  return (
    <section id="challenge" className="section section--paper challenge" aria-labelledby="challenge-title">
      <div className="container">
        <div className="challenge__head">
          <p className="eyebrow" data-reveal>
            02 / CHALLENGE
          </p>
          <h2 id="challenge-title" className="challenge__title" data-reveal style={{ '--d': '80ms' }}>
            <span className="challenge__kicker">O desafio:</span>
            Construa algo <em>REAL</em>
          </h2>
          <p className="lede" data-reveal style={{ '--d': '160ms' }}>
            Não buscamos mais um chatbot ou uma ferramenta estática. Queremos <strong>soluções agênticas</strong> que
            se conectam a processos reais e tornam operações <strong>eficientes</strong>. AI agents não apenas
            respondem prompts: eles <strong>planejam, executam e iteram</strong> sozinhos. Não há vertical nem problema
            definido: o único requisito é que um agente (ou sistema multiagente) entregue <strong>trabalho de verdade</strong>,
            com potencial de virar uma startup.
          </p>
        </div>

        <div className="challenge__term" ref={termRef} data-reveal>
          <Terminal
            title={`~/converge/${agent.id}`}
            lines={agent.lines}
            play={inView}
            onDone={() => setActive((i) => (i + 1) % AGENTS.length)}
          />
        </div>

        <ul className="challenge__cards" role="list">
          {AGENTS.map((a, i) => (
            <li key={a.id} data-reveal style={{ '--d': `${i * 90}ms` }}>
              <article className="challenge__card spotlight">
                <span className="challenge__num">0{i + 1}</span>
                <h3 className="challenge__card-title">{a.title}</h3>
                <p className="challenge__card-text">{a.text}</p>
                <span className="challenge__code">agent/{a.id}</span>
              </article>
            </li>
          ))}
        </ul>

        {/* Sponsor section hidden for now.
        <a href="#sponsor" className="challenge__note" data-reveal>
          <div className="challenge__note-content">
            <span className="challenge__note-badge">
              <span className="challenge__note-dot" /> Patrocínio
            </span>
            <span className="challenge__note-text">
              Patrocinadores podem contribuir diretamente com os problemas que movem o desafio.
            </span>
          </div>
          <span className="challenge__note-cta">
            Saiba mais <Icon name="arrow" size={16} className="arrow" />
          </span>
        </a>
        */}
      </div>
    </section>
  );
}