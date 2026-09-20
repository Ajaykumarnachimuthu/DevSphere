export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <section className="auth-card">
        {subtitle && <p className="eyebrow">{subtitle}</p>}
        <h1>{title}</h1>
        {children}
      </section>
    </div>
  );
}
