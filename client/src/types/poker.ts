export type Suit = '♠' | '♣' | '♥' | '♦';
export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

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

export interface Blinds {
  small: number;
  big: number;
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  deck: Card[];
  pot: number;
  currentBet: number;
  activePlayerIndex: number;
  dealerIndex: number;
  phase: GamePhase;
  blinds: Blinds;
} 