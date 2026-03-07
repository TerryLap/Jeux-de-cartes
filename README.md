# Jeux de cartes

Base technique pour développer un jeu de cartes multi-supports:
- navigateur desktop
- mobile (PWA installable Android/iOS)

## Stack

- React + TypeScript
- Vite
- PWA (`vite-plugin-pwa`)
- ESLint

## Démarrage

```bash
npm install
npm run dev
```

Application accessible sur `http://localhost:5173`.

## Scripts

- `npm run dev`: serveur de développement
- `npm run build`: build de production
- `npm run preview`: prévisualiser le build
- `npm run lint`: vérification du code
- `npm run check`: lint + build

## Structure

- `src/components/`: composants UI
- `src/game/`: logique de jeu (moteur, règles, modèles)
- `public/`: assets statiques, icônes PWA

## Étapes suivantes recommandées

1. Implémenter les règles du jeu ciblé dans `src/game/`.
2. Ajouter un store global (Redux Toolkit/Zustand) pour l'état de partie.
3. Ajouter des tests unitaires du moteur (Vitest).
4. Préparer un packaging natif (Capacitor) si besoin d'app store.
