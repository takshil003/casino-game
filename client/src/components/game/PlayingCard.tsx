import styled, { keyframes } from 'styled-components';
import { Card } from '../../types/poker';

const dealAnimation = keyframes`
  from {
    transform: translate(-50%, -200%) rotate(720deg);
    opacity: 0;
  }
  to {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
`;

const CardContainer = styled.div<{ isDealt: boolean }>`
  width: 60px;
  height: 90px;
  position: relative;
  perspective: 1000px;
  animation: ${props => props.isDealt ? dealAnimation : 'none'} 0.5s ease-out;
`;

const CardInner = styled.div<{ isRevealed: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${props => props.isRevealed ? 'rotateY(0deg)' : 'rotateY(180deg)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardFront = styled(CardFace)<{ isRed: boolean }>`
  background: white;
  border: 1px solid #ddd;
  color: ${props => props.isRed ? '#e74c3c' : '#2c3e50'};
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(45deg, #1a1a1a, #2c2c2c);
  transform: rotateY(180deg);
  border: 1px solid #000;
  
  &::before {
    content: '♠♣♥♦';
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.1);
  }
`;

interface PlayingCardProps {
  card?: Card;
  isDealt: boolean;
  isRevealed: boolean;
}

export function PlayingCard({ card, isDealt, isRevealed }: PlayingCardProps) {
  const isRed = card ? card.suit === '♥' || card.suit === '♦' : false;

  return (
    <CardContainer isDealt={isDealt}>
      <CardInner isRevealed={isRevealed}>
        <CardFront isRed={isRed}>
          {card ? `${card.suit}${card.rank}` : ''}
        </CardFront>
        <CardBack />
      </CardInner>
    </CardContainer>
  );
} 