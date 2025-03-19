import styled, { keyframes } from 'styled-components';

const moveAnimation = keyframes`
  0% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.2) translateY(-20px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
`;

const StackContainer = styled.div<{ isMoving: boolean }>`
  display: flex;
  gap: 4px;
  animation: ${props => props.isMoving ? moveAnimation : 'none'} 0.5s ease-out;
`;

const Chip = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid ${props => props.color === '#ffd700' ? '#e5c100' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #1a1a1a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: 1px dashed rgba(0, 0, 0, 0.2);
  }
`;

interface ChipStackProps {
  amount: number;
  isMoving: boolean;
}

interface ChipValue {
  value: number;
  color: string;
}

export function ChipStack({ amount, isMoving }: ChipStackProps) {
  const getChipColor = (value: number): string => {
    if (value >= 100) return '#ffd700'; // Gold
    if (value >= 50) return '#c0c0c0'; // Silver
    if (value >= 25) return '#cd7f32'; // Bronze
    return '#4CAF50'; // Green
  };

  const chips: ChipValue[] = [];
  let remainingAmount = amount;

  // Break down amount into chips
  [100, 50, 25, 5, 1].forEach(value => {
    const count = Math.floor(remainingAmount / value);
    for (let i = 0; i < count; i++) {
      chips.push({
        value,
        color: getChipColor(value)
      });
    }
    remainingAmount %= value;
  });

  return (
    <StackContainer isMoving={isMoving}>
      {chips.map((chip, index) => (
        <Chip key={index} color={chip.color}>
          ${chip.value}
        </Chip>
      ))}
    </StackContainer>
  );
} 