import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Game from './pages/Game'
import styled from 'styled-components'

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1b1e;
  color: white;
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

function Home() {
  return (
    <HomePage>
      <Title>Welcome to Casino Game</Title>
    </HomePage>
  )
}

function App() {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </AppContainer>
    </Router>
  )
}

export default App
