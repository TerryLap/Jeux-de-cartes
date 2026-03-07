export function GameShell() {
  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Base de projet</p>
        <h1>Jeux de cartes</h1>
        <p className="subtitle">
          Socle prêt pour développer les règles, le moteur de partie et l'interface mobile.
        </p>
      </header>

      <section className="panel">
        <h2>Prochaines briques</h2>
        <ul>
          <li>Moteur de cartes (`src/game/engine.ts`)</li>
          <li>Gestion d'état des manches</li>
          <li>Écrans de lobby / partie / score</li>
          <li>Mode hors-ligne via PWA</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Objectif UX</h2>
        <p>
          Interface pensée mobile d'abord, puis adaptée desktop avec des zones tactiles larges et
          une lisibilité élevée.
        </p>
      </section>
    </main>
  );
}
