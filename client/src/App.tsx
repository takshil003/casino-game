import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import styled from 'styled-components'
import PokerTable from './components/game/PokerTable'

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1b1e;
  color: white;
`

const Navigation = styled.nav`
  background-color: #2c2d30;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const NavList = styled.ul`
  list-style: none;
  display: flex;
  gap: 2rem;
  justify-content: center;
`

const NavLink = styled(Link)`
  color: #ffd700;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.2s;

  &:hover {
    color: #ffed4a;
  }
`

const HomePage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ffd700;
`

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #cccccc;
  max-width: 600px;
  margin: 0 auto 2rem auto;
`

const Button = styled(Link)`
  background-color: #ffd700;
  color: #1a1b1e;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ffed4a;
  }
`

const GameContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

function Home() {
  return (
    <HomePage>
      <Title>Welcome to Casino Game</Title>
      <Subtitle>
        Get ready for an exciting poker experience! Challenge AI opponents
        and test your skills in this immersive card game.
      </Subtitle>
      <Button to="/game">Play Now</Button>
    </HomePage>
  )
}

function Game() {
  return (
    <GameContainer>
      <PokerTable />
    </GameContainer>
  )
}

function App() {
  return (
    <Router>
      <AppContainer>
        <Navigation>
          <NavList>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/game">Play Game</NavLink></li>
          </NavList>
        </Navigation>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </AppContainer>
    </Router>
  )
}

export default App
