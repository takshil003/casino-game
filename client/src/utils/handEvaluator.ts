import { Card, Rank } from '../types/poker';

type HandRank = 
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

interface HandResult {
  rank: HandRank;
  score: number;
  cards: Card[];
}

const rankValues: { [key in Rank]: number } = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2
};

function sortByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);
}

function isFlush(cards: Card[]): boolean {
  return cards.every(card => card.suit === cards[0].suit);
}

function isStraight(cards: Card[]): boolean {
  const sortedCards = sortByRank(cards);
  const ranks = sortedCards.map(card => rankValues[card.rank]);
  
  // Check for Ace-low straight (A,2,3,4,5)
  if (ranks[0] === 14 && ranks[1] === 5) {
    ranks.shift();
    ranks.push(1);
  }

  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i] - ranks[i + 1] !== 1) return false;
  }
  return true;
}

function getGroupedRanks(cards: Card[]): Map<number, Card[]> {
  const groups = new Map<number, Card[]>();
  cards.forEach(card => {
    const value = rankValues[card.rank];
    if (!groups.has(value)) {
      groups.set(value, []);
    }
    groups.get(value)!.push(card);
  });
  return groups;
}

export function evaluateHand(cards: Card[]): HandResult {
  const sortedCards = sortByRank(cards);
  const isHandFlush = isFlush(cards);
  const isHandStraight = isStraight(sortedCards);
  const groups = getGroupedRanks(cards);
  const groupSizes = Array.from(groups.values()).map(g => g.length).sort((a, b) => b - a);

  // Royal Flush
  if (isHandFlush && isHandStraight && rankValues[sortedCards[0].rank] === 14) {
    return { rank: 'Royal Flush', score: 1000, cards: sortedCards };
  }

  // Straight Flush
  if (isHandFlush && isHandStraight) {
    return { rank: 'Straight Flush', score: 900 + rankValues[sortedCards[0].rank], cards: sortedCards };
  }

  // Four of a Kind
  if (groupSizes[0] === 4) {
    const fourCards = Array.from(groups.entries()).find(([_, cards]) => cards.length === 4)![1];
    const kicker = cards.find(card => !fourCards.includes(card))!;
    return { rank: 'Four of a Kind', score: 800 + rankValues[fourCards[0].rank], cards: [...fourCards, kicker] };
  }

  // Full House
  if (groupSizes[0] === 3 && groupSizes[1] === 2) {
    return { rank: 'Full House', score: 700 + rankValues[sortedCards[0].rank], cards: sortedCards };
  }

  // Flush
  if (isHandFlush) {
    return { rank: 'Flush', score: 600 + rankValues[sortedCards[0].rank], cards: sortedCards };
  }

  // Straight
  if (isHandStraight) {
    return { rank: 'Straight', score: 500 + rankValues[sortedCards[0].rank], cards: sortedCards };
  }

  // Three of a Kind
  if (groupSizes[0] === 3) {
    const threeCards = Array.from(groups.entries()).find(([_, cards]) => cards.length === 3)![1];
    const kickers = cards.filter(card => !threeCards.includes(card));
    return { rank: 'Three of a Kind', score: 400 + rankValues[threeCards[0].rank], cards: [...threeCards, ...kickers] };
  }

  // Two Pair
  if (groupSizes[0] === 2 && groupSizes[1] === 2) {
    const pairs = Array.from(groups.entries())
      .filter(([_, cards]) => cards.length === 2)
      .sort(([rankA], [rankB]) => rankB - rankA);
    const kicker = cards.find(card => !pairs[0][1].includes(card) && !pairs[1][1].includes(card))!;
    return { 
      rank: 'Two Pair', 
      score: 300 + rankValues[pairs[0][1][0].rank] * 14 + rankValues[pairs[1][1][0].rank],
      cards: [...pairs[0][1], ...pairs[1][1], kicker]
    };
  }

  // One Pair
  if (groupSizes[0] === 2) {
    const pair = Array.from(groups.entries()).find(([_, cards]) => cards.length === 2)![1];
    const kickers = cards.filter(card => !pair.includes(card));
    return { rank: 'One Pair', score: 200 + rankValues[pair[0].rank], cards: [...pair, ...kickers] };
  }

  // High Card
  return { rank: 'High Card', score: 100 + rankValues[sortedCards[0].rank], cards: sortedCards };
}

export function findBestHand(playerCards: Card[], communityCards: Card[]): HandResult {
  const allCards = [...playerCards, ...communityCards];
  let bestHand: HandResult = { rank: 'High Card', score: 0, cards: [] };

  // Generate all possible 5-card combinations
  for (let i = 0; i < allCards.length - 4; i++) {
    for (let j = i + 1; j < allCards.length - 3; j++) {
      for (let k = j + 1; k < allCards.length - 2; k++) {
        for (let l = k + 1; l < allCards.length - 1; l++) {
          for (let m = l + 1; m < allCards.length; m++) {
            const hand = evaluateHand([
              allCards[i],
              allCards[j],
              allCards[k],
              allCards[l],
              allCards[m]
            ]);
            if (hand.score > bestHand.score) {
              bestHand = hand;
            }
          }
        }
      }
    }
  }

  return bestHand;
} 