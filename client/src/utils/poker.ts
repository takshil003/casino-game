import { Card, Suit, Rank, Player, GameState, GamePhase } from '../types/poker';
import { evaluateHand, findBestHand } from './handEvaluator';

const suits: Suit[] = ['♠', '♣', '♥', '♦'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SMALL_BLIND = 10;
const BIG_BLIND = 20;

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function dealCards(gameState: GameState): GameState {
  const newState = { ...gameState };
  const deck = [...newState.deck];

  // Deal two cards to each player
  newState.players = newState.players.map(player => ({
    ...player,
    cards: [deck.pop()!, deck.pop()!],
    isActive: true,
    bet: 0
  }));

  // Post blinds
  const smallBlindIndex = (newState.dealerIndex + 1) % newState.players.length;
  const bigBlindIndex = (newState.dealerIndex + 2) % newState.players.length;

  newState.players[smallBlindIndex].chips -= SMALL_BLIND;
  newState.players[smallBlindIndex].bet = SMALL_BLIND;
  newState.players[bigBlindIndex].chips -= BIG_BLIND;
  newState.players[bigBlindIndex].bet = BIG_BLIND;
  newState.pot = SMALL_BLIND + BIG_BLIND;
  newState.currentBet = BIG_BLIND;

  newState.deck = deck;
  return newState;
}

export function dealCommunityCards(gameState: GameState): GameState {
  const newState = { ...gameState };
  const deck = [...newState.deck];

  switch (newState.phase) {
    case 'flop':
      newState.communityCards = [deck.pop()!, deck.pop()!, deck.pop()!];
      break;
    case 'turn':
    case 'river':
      newState.communityCards = [...newState.communityCards, deck.pop()!];
      break;
  }

  newState.deck = deck;
  return newState;
}

export function nextPhase(currentPhase: GamePhase): GamePhase {
  const phases: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const currentIndex = phases.indexOf(currentPhase);
  return phases[currentIndex + 1];
}

export function initializeGame(players: Player[]): GameState {
  const deck = createDeck();
  const dealerIndex = Math.floor(Math.random() * players.length);
  
  return {
    players: players.map((player, index) => ({
      ...player,
      cards: [],
      bet: 0,
      isActive: true,
      isTurn: index === (dealerIndex + 3) % players.length,
      isDealer: index === dealerIndex
    })),
    communityCards: [],
    pot: 0,
    currentBet: 0,
    phase: 'preflop',
    activePlayerIndex: (dealerIndex + 3) % players.length,
    dealerIndex,
    deck
  };
}

export function getNextActivePlayer(gameState: GameState): number {
  const { players, activePlayerIndex } = gameState;
  let nextIndex = (activePlayerIndex + 1) % players.length;
  
  while (!players[nextIndex].isActive && nextIndex !== activePlayerIndex) {
    nextIndex = (nextIndex + 1) % players.length;
  }
  
  return nextIndex;
}

export function determineWinner(gameState: GameState): Player[] {
  const activePlayers = gameState.players.filter(p => p.isActive);
  const playerHands = activePlayers.map(player => ({
    player,
    hand: findBestHand(player.cards, gameState.communityCards)
  }));

  // Sort by hand score (descending)
  playerHands.sort((a, b) => b.hand.score - a.hand.score);

  // Find all players with the highest score (could be multiple in case of a tie)
  const highestScore = playerHands[0].hand.score;
  const winners = playerHands
    .filter(ph => ph.hand.score === highestScore)
    .map(ph => ({
      ...ph.player,
      chips: ph.player.chips + Math.floor(gameState.pot / playerHands.length)
    }));

  return winners;
}

export function handlePlayerAction(
  gameState: GameState,
  action: 'fold' | 'check' | 'call' | 'raise',
  raiseAmount?: number
): GameState {
  const newState = { ...gameState };
  const activePlayer = newState.players[newState.activePlayerIndex];

  switch (action) {
    case 'fold':
      activePlayer.isActive = false;
      break;
    case 'check':
      if (newState.currentBet > activePlayer.bet) {
        return newState; // Invalid action
      }
      break;
    case 'call':
      const callAmount = newState.currentBet - activePlayer.bet;
      if (callAmount > 0) {
        activePlayer.chips -= callAmount;
        activePlayer.bet += callAmount;
        newState.pot += callAmount;
      }
      break;
    case 'raise':
      if (raiseAmount && raiseAmount > newState.currentBet) {
        const totalBet = raiseAmount;
        const additionalBet = totalBet - activePlayer.bet;
        activePlayer.chips -= additionalBet;
        activePlayer.bet = totalBet;
        newState.pot += additionalBet;
        newState.currentBet = totalBet;
      }
      break;
  }

  // Update player turns
  activePlayer.isTurn = false;
  const nextPlayerIndex = getNextActivePlayer(newState);
  newState.players[nextPlayerIndex].isTurn = true;
  newState.activePlayerIndex = nextPlayerIndex;

  // Check if round is complete
  const activePlayers = newState.players.filter(p => p.isActive);
  const allPlayersActed = activePlayers.every(p => p.bet === newState.currentBet);

  // Check if only one player remains
  if (activePlayers.length === 1) {
    newState.phase = 'showdown';
    const winner = activePlayers[0];
    winner.chips += newState.pot;
    return newState;
  }

  if (allPlayersActed) {
    newState.phase = nextPhase(newState.phase);
    if (newState.phase === 'showdown') {
      // Determine winner and distribute pot
      const winners = determineWinner(newState);
      winners.forEach(winner => {
        const winningPlayer = newState.players.find(p => p.id === winner.id)!;
        winningPlayer.chips = winner.chips;
      });
    } else {
      newState.players.forEach(p => p.bet = 0);
      newState.currentBet = 0;
      if (newState.phase === 'flop' || newState.phase === 'turn' || newState.phase === 'river') {
        return dealCommunityCards(newState);
      }
    }
  }

  return newState;
} 