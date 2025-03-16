export type Suit = '♠' | '♣' | '♥' | '♦';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: number;
  name: string;
  chips: number;
  position: number;
  cards: Card[];
  bet: number;
  isActive: boolean;
  isTurn: boolean;
  isDealer: boolean;
}

export type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  phase: GamePhase;
  activePlayerIndex: number;
  dealerIndex: number;
  deck: Card[];
} 