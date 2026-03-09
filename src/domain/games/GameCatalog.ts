export type GameId = 'battle' | 'crapette' | 'tarot' | 'belote' | 'president';

export interface GameDefinition {
  id: GameId;
  title: string;
  description: string;
  playerMode: string;
  status: 'playable' | 'coming_soon';
}

export const GAME_CATALOG: GameDefinition[] = [
  {
    id: 'battle',
    title: 'Bataille',
    description: 'Une premiere version jouable contre une IA locale simple.',
    playerMode: '1 joueur vs IA',
    status: 'playable'
  },
  {
    id: 'crapette',
    title: 'Crapette',
    description: 'Jeu annonce pour une prochaine iteration.',
    playerMode: 'A definir',
    status: 'coming_soon'
  },
  {
    id: 'tarot',
    title: 'Tarot',
    description: 'Catalogue present, regles a implementer.',
    playerMode: 'A definir',
    status: 'coming_soon'
  },
  {
    id: 'belote',
    title: 'Belote',
    description: 'Catalogue present, regles a implementer.',
    playerMode: 'A definir',
    status: 'coming_soon'
  },
  {
    id: 'president',
    title: 'President',
    description: 'Catalogue present, regles a implementer.',
    playerMode: 'A definir',
    status: 'coming_soon'
  }
];
