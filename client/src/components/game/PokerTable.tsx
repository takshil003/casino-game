import styled from 'styled-components';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import type { Player, GameState, Card } from '../../types/poker';
import { initializeGame, dealCards, handlePlayerAction } from '../../utils/poker';
import { findBestHand } from '../../utils/handEvaluator';
import { GameConfig } from './GameConfig';
import { getAdvancedAIDecision } from '../../utils/advancedAI';
import { PlayingCard } from './PlayingCard';
import { ChipStack } from './ChipStack';

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

const NewGameButton = styled.button`
  padding: 12px 24px;
  margin-left: 20px;
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

function formatCard(card: Card | null): string {
  if (!card) return '🂠';
  return `${card.suit}${card.rank}`;
}

interface PokerTableProps {
  state: GameState;
  setState: Dispatch<SetStateAction<GameState | null>>;
  config: GameConfig;
  onNewGame: () => void;
}

export default function PokerTable({ state, setState, config, onNewGame }: PokerTableProps) {
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [winners, setWinners] = useState<Player[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [movingChips, setMovingChips] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    if (state) {
      setRaiseAmount(state.blinds.big * 2);
    }
  }, [state?.blinds.big]);

  useEffect(() => {
    if (!state) return;
    
    const currentPlayer = state.players[state.activePlayerIndex];
    if (!currentPlayer || currentPlayer.id === 1 || !currentPlayer.isActive) return;

    setAiThinking(true);
    const aiDecisionDelay = Math.random() * 1000 + 500;

    const timeoutId = setTimeout(() => {
      try {
        const action = getAdvancedAIDecision(currentPlayer, state, config.botDifficulty);
        setMovingChips(true);
        const newState = handlePlayerAction(state, action.action, action.raiseAmount);
        setState(newState);

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
      } catch (error) {
        console.error('Error in AI decision:', error);
      } finally {
        setTimeout(() => {
          setMovingChips(false);
          setAiThinking(false);
        }, 500);
      }
    }, aiDecisionDelay);

    return () => clearTimeout(timeoutId);
  }, [state?.activePlayerIndex, config?.botDifficulty]);

  const handleAction = (action: 'fold' | 'check' | 'call' | 'raise') => {
    if (!state || state.activePlayerIndex !== 0 || aiThinking) return;

    setMovingChips(true);
    const newState = handlePlayerAction(state, action, action === 'raise' ? raiseAmount : undefined);
    setState(newState);

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

    setTimeout(() => setMovingChips(false), 500);
  };

  return (
    <div>
      {!state ? (
        <div>Loading game state...</div>
      ) : (
        <>
          <TableContainer>
            {state.players.map((player) => (
              <PlayerPosition key={player.id} position={player.position}>
                <PlayerAvatar 
                  style={{
                    border: `3px solid ${
                      winners.some(w => w.id === player.id)
                        ? '#00ff00'
                        : player.isTurn
                          ? '#ff0000'
                          : player.isDealer
                            ? '#ffd700'
                            : '#666'
                    }`,
                    animation: aiThinking && player.isTurn ? 'pulse 1s infinite' : 'none'
                  }}
                >
                  {player.name[0]}
                </PlayerAvatar>
                <PlayerInfo>
                  <div>{player.name} {player.isDealer ? '(D)' : ''}</div>
                  <div>${player.chips}</div>
                  {player.bet > 0 && (
                    <ChipStack amount={player.bet} isMoving={movingChips} />
                  )}
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    {player.cards.map((card, index) => (
                      <PlayingCard
                        key={index}
                        card={card}
                        isDealt={!isDealing}
                        isRevealed={player.id === 1 || state.phase === 'showdown'}
                      />
                    ))}
                  </div>
                  {state.phase === 'showdown' && player.isActive && (
                    <HandRank>
                      {findBestHand(player.cards, state.communityCards).rank}
                    </HandRank>
                  )}
                </PlayerInfo>
              </PlayerPosition>
            ))}
            
            <Pot>
              <ChipStack amount={state.pot} isMoving={movingChips} />
            </Pot>
            
            <CommunityCards>
              {state.communityCards.map((card, index) => (
                <PlayingCard
                  key={index}
                  card={card}
                  isDealt={!isDealing}
                  isRevealed={true}
                />
              ))}
            </CommunityCards>
          </TableContainer>

          <ActionButtons>
            <ActionButton 
              disabled={state.activePlayerIndex !== 0 || aiThinking}
              onClick={() => handleAction('fold')}
            >
              Fold
            </ActionButton>
            <ActionButton 
              disabled={state.activePlayerIndex !== 0 || state.currentBet > 0 || aiThinking}
              onClick={() => handleAction('check')}
            >
              Check
            </ActionButton>
            <ActionButton 
              disabled={state.activePlayerIndex !== 0 || aiThinking}
              onClick={() => handleAction('call')}
            >
              Call ${state.currentBet}
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
                disabled={
                  state.activePlayerIndex !== 0 || 
                  raiseAmount <= state.currentBet || 
                  aiThinking
                }
                onClick={() => handleAction('raise')}
              >
                Raise
              </ActionButton>
            </div>
          </ActionButtons>

          <GameInfo>
            <div>Phase: {state.phase}</div>
            {state.phase === 'showdown' && winners.length > 0 && (
              <div>
                Winner{winners.length > 1 ? 's' : ''}: {winners.map(w => w.name).join(', ')}
                <NewGameButton onClick={onNewGame}>New Game</NewGameButton>
              </div>
            )}
          </GameInfo>
        </>
      )}
    </div>
  );
} 