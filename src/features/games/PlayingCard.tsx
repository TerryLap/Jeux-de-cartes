import { Card } from '../../game/engine';
import { getCardAssetPath } from './cardAssetPath';

interface PlayingCardProps {
  card: Card | null;
  alt: string;
  concealed?: boolean;
  compact?: boolean;
  className?: string;
}

export function PlayingCard({ card, alt, concealed = false, compact = false, className = '' }: PlayingCardProps) {
  const resolvedClassName =
    `playing-card${compact ? ' is-compact' : ''}${concealed ? ' is-concealed' : ' is-revealed'}` +
    (className ? ` ${className}` : '');

  if (!card) {
    return (
      <div className={`${resolvedClassName} is-empty`} aria-label={alt}>
        <span>Carte absente</span>
      </div>
    );
  }

  return (
    <div className={resolvedClassName}>
      <div className="playing-card-inner">
        <div className="playing-card-back" aria-hidden="true" />
        <div className="playing-card-front">
          <img src={getCardAssetPath(card)} alt={alt} className="playing-card-face" loading="lazy" />
        </div>
      </div>
      {concealed ? <span className="playing-card-badge">Cachee</span> : null}
    </div>
  );
}
