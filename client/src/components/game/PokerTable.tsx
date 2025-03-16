import styled from 'styled-components';
import { useState, useEffect } from 'react';
import type { Player, GameState, Card } from '../../types/poker';
import { initializeGame, dealCards, handlePlayerAction } from '../../utils/poker';
import { findBestHand } from '../../utils/handEvaluator';

const TableContainer = styled.div`
  width: 1000px;
  height: 600px;
  background-color: #35654d;
  border-radius: 200px;
  position: relative;
  border: 20px solid #4a2810;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  margin: 2rem auto;
`;

const PlayerPosition = styled.div<{ position: number }>`
  position: absolute;
  width: 120px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  ${({ position }) => {
    const positions = {
      0: { bottom: '10px', left: '50%', transform: 'translateX(-50%)' },
      1: { bottom: '80px', left: '10%' },
      2: { top: '50%', left: '0', transform: 'translateY(-50%)' },
      3: { top: '80px', left: '10%' },
      4: { top: '10px', left: '50%', transform: 'translateX(-50%)' },
      5: { top: '80px', right: '10%' },
      6: { top: '50%', right: '0', transform: 'translateY(-50%)' },
      7: { bottom: '80px', right: '10%' },
    };
    return positions[position as keyof typeof positions];
  }}
`;

const PlayerAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #2c2d30;
  border: 3px solid #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const PlayerInfo = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  text-align: center;
`;

const CommunityCards = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 1rem;
`;

const CardDisplay = styled.div`
  width: 60px;
  height: 90px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${props => props.children?.toString().includes('♥') || props.children?.toString().includes('♦') ? 'red' : 'black'};
`;

const Pot = styled.div`
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #ffd700;
  font-weight: bold;
`;

const ActionButton = styled.button`
  background-color: #ffd700;
  color: #1a1b1e;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ffed4a;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
`;

const GameInfo = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(0,0,0,0.8);
  padding: 1rem;
  border-radius: 8px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HandRank = styled.div`
  background: rgba(0,0,0,0.7);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #ffd700;
`;

function formatCard(card: Card | null): string {
  if (!card) return '🂠';
  return `${card.suit}${card.rank}`;
}

export default function PokerTable() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [winners, setWinners] = useState<Player[]>([]);

  // Initialize game
  useEffect(() => {
    const initialPlayers: Player[] = [
      { id: 1, name: 'You', chips: 1000, position: 0, cards: [], bet: 0, isActive: true, isTurn: false, isDealer: false },
      { id: 2, name: 'AI 1', chips: 1000, position: 2, cards: [], bet: 0, isActive: true, isTurn: false, isDealer: false },
      { id: 3, name: 'AI 2', chips: 1000, position: 4, cards: [], bet: 0, isActive: true, isTurn: false, isDealer: false },
      { id: 4, name: 'AI 3', chips: 1000, position: 6, cards: [], bet: 0, isActive: true, isTurn: false, isDealer: false },
    ];

    const newGameState = initializeGame(initialPlayers);
    setGameState(dealCards(newGameState));
  }, []);

  useEffect(() => {
    if (gameState && gameState.activePlayerIndex !== 0 && gameState.phase !== 'showdown') {
      // AI turn
      const aiAction = () => {
        const actions = ['fold', 'check', 'call', 'raise'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)] as 'fold' | 'check' | 'call' | 'raise';
        const randomRaise = Math.floor(Math.random() * 100) + gameState.currentBet + 1;
        
        setTimeout(() => {
          setGameState(prevState => {
            if (!prevState) return prevState;
            const newState = handlePlayerAction(prevState, randomAction, randomRaise);
            
            // Check for showdown
            if (newState.phase === 'showdown') {
              const activePlayers = newState.players.filter(p => p.isActive);
              if (activePlayers.length === 1) {
                setWinners([activePlayers[0]]);
              } else {
                const playerHands = activePlayers.map(player => ({
                  player,
                  hand: findBestHand(player.cards, newState.communityCards)
                }));
                const highestScore = Math.max(...playerHands.map(ph => ph.hand.score));
                const roundWinners = playerHands
                  .filter(ph => ph.hand.score === highestScore)
                  .map(ph => ph.player);
                setWinners(roundWinners);
              }
            }
            
            return newState;
          });
        }, 1000);
      };

      aiAction();
    }
  }, [gameState?.activePlayerIndex]);

  if (!gameState) return <div>Loading...</div>;

  const handleAction = (action: 'fold' | 'check' | 'call' | 'raise') => {
    if (gameState.activePlayerIndex !== 0) return; // Not player's turn
    const newState = handlePlayerAction(gameState, action, action === 'raise' ? raiseAmount : undefined);
    setGameState(newState);

    if (newState.phase === 'showdown') {
      const activePlayers = newState.players.filter(p => p.isActive);
      if (activePlayers.length === 1) {
        setWinners([activePlayers[0]]);
      } else {
        const playerHands = activePlayers.map(player => ({
          player,
          hand: findBestHand(player.cards, newState.communityCards)
        }));
        const highestScore = Math.max(...playerHands.map(ph => ph.hand.score));
        const roundWinners = playerHands
          .filter(ph => ph.hand.score === highestScore)
          .map(ph => ph.player);
        setWinners(roundWinners);
      }
    }
  };

  const playerHand = gameState.phase !== 'preflop' && gameState.players[0].cards.length === 2
    ? findBestHand(gameState.players[0].cards, gameState.communityCards)
    : null;

  return (
    <div>
      <TableContainer>
        {gameState.players.map((player) => (
          <PlayerPosition key={player.id} position={player.position}>
            <PlayerAvatar style={{
              border: `3px solid ${
                winners.some(w => w.id === player.id)
                  ? '#00ff00'
                  : player.isTurn
                    ? '#ff0000'
                    : player.isDealer
                      ? '#ffd700'
                      : '#666'
              }`
            }}>
              {player.name[0]}
            </PlayerAvatar>
            <PlayerInfo>
              <div>{player.name} {player.isDealer ? '(D)' : ''}</div>
              <div>${player.chips}</div>
              <div style={{ fontSize: '0.8em', color: '#ffd700' }}>
                {player.bet > 0 ? `Bet: $${player.bet}` : ''}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                {player.id === 1 || gameState.phase === 'showdown' ? 
                  player.cards.map(formatCard).join(' ') : 
                  player.cards.map(() => '🂠').join(' ')}
              </div>
              {gameState.phase === 'showdown' && player.isActive && (
                <HandRank>
                  {findBestHand(player.cards, gameState.communityCards).rank}
                </HandRank>
              )}
            </PlayerInfo>
          </PlayerPosition>
        ))}
        
        <Pot>Pot: ${gameState.pot}</Pot>
        
        <CommunityCards>
          {gameState.communityCards.map((card, index) => (
            <CardDisplay key={index}>{formatCard(card)}</CardDisplay>
          ))}
          {Array(5 - gameState.communityCards.length).fill(null).map((_, index) => (
            <CardDisplay key={`empty-${index}`}>🂠</CardDisplay>
          ))}
        </CommunityCards>
      </TableContainer>

      <ActionButtons>
        <ActionButton 
          disabled={gameState.activePlayerIndex !== 0}
          onClick={() => handleAction('fold')}
        >
          Fold
        </ActionButton>
        <ActionButton 
          disabled={gameState.activePlayerIndex !== 0 || gameState.currentBet > 0}
          onClick={() => handleAction('check')}
        >
          Check
        </ActionButton>
        <ActionButton 
          disabled={gameState.activePlayerIndex !== 0}
          onClick={() => handleAction('call')}
        >
          Call ${gameState.currentBet}
        </ActionButton>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: '80px',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ffd700',
              background: '#2c2d30',
              color: 'white'
            }}
          />
          <ActionButton 
            disabled={gameState.activePlayerIndex !== 0 || raiseAmount <= gameState.currentBet}
            onClick={() => handleAction('raise')}
          >
            Raise
          </ActionButton>
        </div>
      </ActionButtons>

      <GameInfo>
        <div>Phase: {gameState.phase}</div>
        {playerHand && (
          <div>Your Hand: {playerHand.rank}</div>
        )}
        {winners.length > 0 && gameState.phase === 'showdown' && (
          <div>
            Winner{winners.length > 1 ? 's' : ''}: {winners.map(w => w.name).join(', ')}
          </div>
        )}
      </GameInfo>
    </div>
  );
} 