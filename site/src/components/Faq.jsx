import { useState } from 'react';
import { CONTACT, EVENT } from '../config.js';
import Icon from './Icon.jsx';
import './Faq.css';

const QUESTIONS = [
  {
    q: 'Quem pode se inscrever?',
    a: 'Estudantes e profissionais de três áreas que querem construir com AI agents: tecnologia (desenvolvimento, engenharia e dados), empreendedorismo (founders e empreendedores) e design. A seleção procura quem já construiu algo real, como agentes, ferramentas ou side projects de IA. O evento reúne talentos do Nordeste.',
  },
  {
    q: 'Quanto custa?',
    a: 'Nada. O Converge Challenge é totalmente gratuito, tanto a inscrição quanto a participação nos dois dias.',
  },
  {
    q: 'Quando e onde acontece?',
    a: `Presencialmente, no ${EVENT.venueAddress}, em ${EVENT.city}: sábado, 7 de novembro, das 08h30 às 17h, e domingo, 8 de novembro, das 08h30 às 17h30. A presença nos dois dias é obrigatória para os aprovados.`,
  },
  {
    q: 'Como funciona a seleção?',
    a: `As inscrições vão de ${EVENT.applications}, pelo formulário no Luma. Os ${EVENT.builders} participantes são selecionados a partir delas, com a mesma régua para quem se inscreve sozinho ou em time: procuramos quem já construiu algo real. O resultado sai até ${EVENT.results}, e os aprovados entram no grupo de WhatsApp do hackathon.`,
  },
  {
    q: 'Preciso ter um time?',
    a: 'Não. Você pode se inscrever sozinho ou em time de 2 a 4 pessoas. No time, cada integrante faz a própria inscrição e informa o nome do time no formulário. Quem for aprovado sozinho pode formar um time no check-in.',
  },
  {
    q: 'O que devo levar?',
    a: 'Seu notebook, carregador e adaptadores: não há computadores no local, mas há tomadas. Chegue com o setup pronto (repositório configurado, chaves de API ativas e ambiente de desenvolvimento instalado e testado), porque não haverá tempo de setup no dia. Os aprovados recebem um guia de preparação na semana do evento.',
  },
  {
    q: 'O que vamos construir?',
    a: 'Soluções agênticas, não chatbots ou ferramentas estáticas. Pense em agentes conectados a processos reais como recrutamento, back-office, suporte ao cliente ou vendas, que tornam operações eficientes.',
  },
  {
    q: 'O que os participantes ganham?',
    a: 'Mentoria de profissionais do mercado, US$ 25 em créditos de inferência da Featherless, networking com participantes e parceiros, um Demo Day ao vivo diante de um júri e prêmios para os três melhores projetos, com mais de US$ 20 mil em prêmios combinados e R$ 3.000 em dinheiro para o 1º lugar.',
  },
  // Hidden along with the sponsor section.
  // {
  //   q: 'Quero patrocinar, mentorar ou ser parceiro. Com quem falo?',
  //   a: (
  //     <>
  //       Escreva para{' '}
  //       <a href={`mailto:${CONTACT.email}`} className="faq__link">
  //         {CONTACT.email}
  //       </a>{' '}
  //       e retornamos com as opções de patrocínio.
  //     </>
  //   ),
  // },
];

export default function Faq() {
  // Deep-linkable: ?faq=2 opens the third question on load.
  const [open, setOpen] = useState(() => {
    const n = Number(new URLSearchParams(window.location.search).get('faq'));
    return Number.isInteger(n) && n >= 0 && n < QUESTIONS.length ? n : 0;
  });

  const sync = (i) => {
    setOpen(i);
    const url = new URL(window.location.href);
    if (i < 0) url.searchParams.delete('faq');
    else url.searchParams.set('faq', String(i));
    window.history.replaceState(null, '', url);
  };

  return (
    <section id="faq" className="section faq" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div className="section-head faq__head">
          <p className="eyebrow" data-reveal>
            09 / FAQ
          </p>
          <h2 id="faq-title" className="title" data-reveal style={{ '--d': '80ms' }}>
            Perguntas, <em>respondidas</em>.
          </h2>
          <p className="lede" data-reveal style={{ '--d': '160ms' }}>
            Mais alguma dúvida? Fale com a gente em <a href={`mailto:${CONTACT.email}`} className="faq__link">{CONTACT.email}</a>.
          </p>
        </div>

        <div className="faq__list">
          {QUESTIONS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              // data-reveal lives on the static inner wrapper: the outer div's
              // className is rewritten by React on every toggle, which would
              // wipe the observer-added .is-in class and hide the item.
              <div key={q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
                <div data-reveal style={{ '--d': `${i * 60}ms` }}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => sync(isOpen ? -1 : i)}
                    >
                      <span className="faq__num" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="faq__q">{q}</span>
                      <span className="faq__icon">
                        <Icon name="plus" size={18} stroke={2} />
                      </span>
                    </button>
                  </h3>
                  <div className="faq__panel" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                    <div>
                      <p>{a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
