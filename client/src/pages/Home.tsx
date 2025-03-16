import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import type { RootState } from '../store'

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #1a1b1c;
  color: white;
`

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 40px;
  text-align: center;
  color: #3498db;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`

const GameOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
`

const GameCard = styled.div`
  background: #2c3e50;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  }
`

const GameTitle = styled.h2`
  color: #3498db;
  margin-bottom: 10px;
`

const GameDescription = styled.p`
  color: #95a5a6;
  margin-bottom: 20px;
`

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #3498db;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const handlePlayNow = () => {
    if (isAuthenticated) {
      navigate('/game')
    } else {
      navigate('/login')
    }
  }

  return (
    <HomeContainer>
      <Title>Casino Poker Game</Title>
      <GameOptions>
        <GameCard>
          <GameTitle>Texas Hold'em</GameTitle>
          <GameDescription>
            Play against AI opponents in the most popular poker variant.
            Test your skills and strategy in this classic game!
          </GameDescription>
          <Button onClick={handlePlayNow}>
            {isAuthenticated ? 'Play Now' : 'Login to Play'}
          </Button>
        </GameCard>
        <GameCard>
          <GameTitle>Practice Mode</GameTitle>
          <GameDescription>
            Learn the game with our tutorial mode.
            Play against easy bots and master the basics!
          </GameDescription>
          <Button onClick={() => navigate('/tutorial')} disabled>
            Coming Soon
          </Button>
        </GameCard>
      </GameOptions>
    </HomeContainer>
  )
}

export default Home 