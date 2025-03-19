import styled from 'styled-components';
import { useState } from 'react';

const ConfigContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: linear-gradient(145deg, #1a1e24, #2c3e50);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #fff;
  font-size: 16px;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #3498db;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #2ecc71;
  }
`;

const Select = styled.select`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #3498db;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #2ecc71;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(45deg, #2ecc71, #27ae60);
  color: white;
  font-size: 16px;
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

interface GameConfigProps {
  onStartGame: (config: GameConfig) => void;
}

export interface GameConfig {
  numBots: number;
  startingChips: number;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'pro';
  blinds: {
    small: number;
    big: number;
  };
}

export default function GameConfig({ onStartGame }: GameConfigProps) {
  const [config, setConfig] = useState<GameConfig>({
    numBots: 3,
    startingChips: 1000,
    botDifficulty: 'medium',
    blinds: {
      small: 10,
      big: 20
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with config:', config);
    onStartGame(config);
  };

  return (
    <ConfigContainer>
      <Title>Game Configuration</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Number of AI Opponents (2-8)</Label>
          <Input
            type="number"
            min={2}
            max={8}
            value={config.numBots}
            onChange={(e) => {
              const newValue = Math.min(8, Math.max(2, parseInt(e.target.value) || 2));
              setConfig({
                ...config,
                numBots: newValue
              });
            }}
          />
        </FormGroup>

        <FormGroup>
          <Label>Starting Chips</Label>
          <Input
            type="number"
            min={500}
            step={100}
            value={config.startingChips}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 1000;
              setConfig({
                ...config,
                startingChips: newValue
              });
            }}
          />
        </FormGroup>

        <FormGroup>
          <Label>AI Difficulty</Label>
          <Select
            value={config.botDifficulty}
            onChange={(e) => {
              setConfig({
                ...config,
                botDifficulty: e.target.value as 'easy' | 'medium' | 'hard' | 'pro'
              });
            }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="pro">Pro</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Blinds</Label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <Label>Small Blind</Label>
              <Input
                type="number"
                min={5}
                step={5}
                value={config.blinds.small}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 10;
                  setConfig({
                    ...config,
                    blinds: {
                      ...config.blinds,
                      small: newValue
                    }
                  });
                }}
              />
            </div>
            <div>
              <Label>Big Blind</Label>
              <Input
                type="number"
                min={10}
                step={10}
                value={config.blinds.big}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 20;
                  setConfig({
                    ...config,
                    blinds: {
                      ...config.blinds,
                      big: newValue
                    }
                  });
                }}
              />
            </div>
          </div>
        </FormGroup>

        <Button 
          type="submit"
          style={{ marginTop: '20px', width: '100%' }}
        >
          Start Game
        </Button>
      </Form>
    </ConfigContainer>
  );
} 