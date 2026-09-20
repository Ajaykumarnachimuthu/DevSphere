export function PageIntro({ title, text, eyebrow = "DevSphere community" }) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </section>
  );
}
