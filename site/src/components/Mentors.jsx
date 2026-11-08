import './Mentors.css';

// Banca e mentores da apresentação de abertura. Novos nomes entram aqui.
const MENTORS = [
  {
    name: 'Matheus Teixeira',
    role: (
      <>
        Founding Associate da <strong>Canastra Ventures</strong>.
      </>
    ),
    tags: ['Mentor', 'Jurado'],
  },
  {
    name: 'André Spanguero',
    role: (
      <>
        Engenheiro de software na <strong>Tako</strong>, cientista da computação pela USP.
      </>
    ),
    tags: ['Mentor', 'Jurado'],
  },
  {
    name: 'Thais Gaudencio',
    role: (
      <>
        Professora do <strong>Centro de Informática da UFPB</strong>.
      </>
    ),
    tags: ['Jurada'],
  },
  {
    name: 'Tales Nobre',
    role: (
      <>
        Data scientist na <strong>Dharma-ai</strong>, formado em Ciência de Dados e IA na UFPB.
      </>
    ),
    tags: ['Mentor'],
  },
  {
    name: 'Pedro Kruta',
    role: (
      <>
        Engenheiro de software na <strong>Tako</strong> e estudante de Ciência de Dados e IA na UFPB.
      </>
    ),
    tags: ['Mentor'],
  },
  {
    name: 'Mônica do Carmo',
    role: (
      <>
        Tech recruiter na <strong>Tako</strong>.
      </>
    ),
    tags: ['Time Tako'],
  },
];

// Skips lowercase words, so "Mônica do Carmo" reads MC and not Md.
const initials = (name) =>
  name
    .split(' ')
    .filter((w) => /^\p{Lu}/u.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

export default function Mentors() {
  return (
    <section id="mentors" className="section section--deep mentors" aria-labelledby="mentors-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow" data-reveal>
            07 / Mentores
          </p>
          <h2 id="mentors-title" className="title" data-reveal style={{ '--d': '80ms' }}>
            Mentores e <em>jurados</em>.
          </h2>
        </div>

        <ul className="mentors__list" role="list">
          {MENTORS.map((m, i) => (
            <li key={m.name} className="mentors__card spotlight" data-reveal style={{ '--d': `${i * 100}ms` }}>
              <span className="mentors__avatar" aria-hidden="true">
                {initials(m.name)}
              </span>
              <div>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
                <ul className="mentors__tags" aria-label="Papel no evento">
                  {m.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>

        <p className="mentors__more" data-reveal>
          + novos nomes serão anunciados em breve
        </p>
      </div>
    </section>
  );
}
