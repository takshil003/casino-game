import { Card, Player, GameState, GamePhase } from '../types/poker';
import { findBestHand } from './handEvaluator';

interface PositionalStrategy {
  raiseFrequency: number;
  bluffFrequency: number;
  minRaiseMultiplier: number;
  maxRaiseMultiplier: number;
}

interface HandStrength {
  score: number;
  rank: string;
  drawPotential: number;
}

type Position = 'early' | 'middle' | 'late' | 'button';

const POSITION_STRATEGIES: Record<Position, PositionalStrategy> = {
  early: {
    raiseFrequency: 0.2,
    bluffFrequency: 0.1,
    minRaiseMultiplier: 2,
    maxRaiseMultiplier: 3
  },
  middle: {
    raiseFrequency: 0.3,
    bluffFrequency: 0.15,
    minRaiseMultiplier: 2.5,
    maxRaiseMultiplier: 3.5
  },
  late: {
    raiseFrequency: 0.4,
    bluffFrequency: 0.2,
    minRaiseMultiplier: 3,
    maxRaiseMultiplier: 4
  },
  button: {
    raiseFrequency: 0.5,
    bluffFrequency: 0.25,
    minRaiseMultiplier: 2.5,
    maxRaiseMultiplier: 4
  }
};

const DIFFICULTY_MULTIPLIERS = {
  easy: 0.6,
  medium: 0.8,
  hard: 1.0,
  pro: 1.2
};

const CARD_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function calculateDrawPotential(holeCards: Card[], communityCards: Card[]): number {
  if (communityCards.length < 3) return 0;
  
  // Check for flush draws
  const suits = [...holeCards, ...communityCards].reduce((acc, card) => {
    acc[card.suit] = (acc[card.suit] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const flushDraw = Object.values(suits).some(count => count === 4);

  // Check for straight draws
  const ranks = [...holeCards, ...communityCards]
    .map(card => typeof card.rank === 'string' ? 
      CARD_VALUES[card.rank] || parseInt(card.rank) : 
      card.rank
    )
    .sort((a, b) => a - b);

  let straightDraw = false;
  for (let i = 0; i < ranks.length - 3; i++) {
    if (ranks[i + 3] - ranks[i] <= 4) {
      straightDraw = true;
      break;
    }
  }

  return (flushDraw ? 0.4 : 0) + (straightDraw ? 0.3 : 0);
}

function analyzeHandStrength(
  player: Player,
  gameState: GameState,
  difficulty: keyof typeof DIFFICULTY_MULTIPLIERS
): HandStrength {
  const hand = findBestHand(player.cards, gameState.communityCards);
  const drawPotential = calculateDrawPotential(player.cards, gameState.communityCards);
  
  // Adjust score based on difficulty
  const adjustedScore = hand.score * DIFFICULTY_MULTIPLIERS[difficulty];
  
  return {
    score: adjustedScore,
    rank: hand.rank,
    drawPotential
  };
}

function getPositionalStrategy(position: number, numPlayers: number): PositionalStrategy {
  if (position === numPlayers - 1) return POSITION_STRATEGIES.button;
  if (position === 0 || position === 1) return POSITION_STRATEGIES.early;
  if (position === numPlayers - 2) return POSITION_STRATEGIES.late;
  return POSITION_STRATEGIES.middle;
}

function calculatePotOdds(gameState: GameState, player: Player): number {
  const callAmount = gameState.currentBet - player.bet;
  return callAmount / (gameState.pot + callAmount);
}

export function getAdvancedAIDecision(
  player: Player,
  gameState: GameState,
  difficulty: keyof typeof DIFFICULTY_MULTIPLIERS
): {
  action: 'fold' | 'check' | 'call' | 'raise';
  raiseAmount?: number;
} {
  const handStrength = analyzeHandStrength(player, gameState, difficulty);
  const position = player.position;
  const strategy = getPositionalStrategy(position, gameState.players.length);
  const potOdds = calculatePotOdds(gameState, player);
  
  // Adjust strategy based on game phase
  const phaseMultiplier = {
    preflop: 1,
    flop: 1.2,
    turn: 1.4,
    river: 1.6,
    showdown: 1
  }[gameState.phase];

  const effectiveHandStrength = (handStrength.score + handStrength.drawPotential * 200) * phaseMultiplier;
  
  // Calculate aggression factor
  const aggressionThreshold = Math.random() * DIFFICULTY_MULTIPLIERS[difficulty];
  const shouldBeAggressive = Math.random() < strategy.raiseFrequency * DIFFICULTY_MULTIPLIERS[difficulty];
  
  // Decision making
  if (gameState.currentBet === 0) {
    // No bet to call
    if (effectiveHandStrength > 600 || shouldBeAggressive) {
      const raiseSize = Math.floor(
        gameState.pot * (strategy.minRaiseMultiplier + Math.random() * 
          (strategy.maxRaiseMultiplier - strategy.minRaiseMultiplier))
      );
      return { action: 'raise', raiseAmount: raiseSize };
    }
    return { action: 'check' };
  }

  // There's a bet to call
  if (effectiveHandStrength > 800 || (effectiveHandStrength > 600 && shouldBeAggressive)) {
    // Strong hand or semi-bluff
    const raiseSize = Math.floor(
      gameState.currentBet * (strategy.minRaiseMultiplier + Math.random() * 
        (strategy.maxRaiseMultiplier - strategy.minRaiseMultiplier))
    );
    return { action: 'raise', raiseAmount: raiseSize };
  }

  if (effectiveHandStrength > 400 || potOdds < 0.2) {
    // Decent hand or good pot odds
    return { action: 'call' };
  }

  // Consider bluffing
  if (Math.random() < strategy.bluffFrequency * DIFFICULTY_MULTIPLIERS[difficulty] && 
      gameState.phase !== 'river') {
    return { action: 'raise', raiseAmount: gameState.currentBet * 2.5 };
  }

  return { action: 'fold' };
} 