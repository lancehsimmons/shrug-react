import './Info.css';

const SECTIONS = [
  {
    id: 'contact',
    title: 'Contact',
    body: 'TODO: add contact info (email, socials, etc.)',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    body: 'Current shipping costs only include USA. If you would like to order elsewhere in the world please get in touch. Physical media should generally ship within a week unless otherwise noted. Media-mail is the default shipping mode which can also take extra time. As stated, Shrug is a private endeavor so please allow for a loose shipping timeframe.',
  },
  {
    id: 'legal',
    title: 'Legal',
    body: 'Unless otherwise stated, including information external to this site, all content is private copyright of the owner and operator.',
  },
];

export default function Info() {
  return (
    <div className="info-page">
      <div className="info-intro">Shrug is a private entity providing access to raw sound forms. We will try to serve this objective as best we can. Shrug is neither a functioning business nor a unit of corporate production (though some corporate portals are utilized in achieving our objective). Please procede with discretion</div>
      {SECTIONS.map(section => (
        <section key={section.id} className="info-section">
          <h2 className="info-section-title">{section.title}</h2>
          <p className="info-section-body">{section.body}</p>
        </section>
      ))}
    </div>
  );
}
