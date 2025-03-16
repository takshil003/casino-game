import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import PokerTable from '../components/PokerTable'
import { startGame, setPlayers } from '../store/slices/gameSlice'
import type { RootState } from '../store'

const GameContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`

const Controls = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
`

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  background: #2c3e50;
  color: white;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #34495e;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`

const Game = () => {
  const dispatch = useDispatch()
  const { isActive, players } = useSelector((state: RootState) => state.game)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Initialize game with player and bots when component mounts
    if (!isActive && user) {
      const bots = [
        { id: 'bot1', name: 'Bot 1', chips: 1000, cards: [], isBot: true, isTurn: false, hasFolded: false, currentBet: 0 },
        { id: 'bot2', name: 'Bot 2', chips: 1000, cards: [], isBot: true, isTurn: false, hasFolded: false, currentBet: 0 },
        { id: 'bot3', name: 'Bot 3', chips: 1000, cards: [], isBot: true, isTurn: false, hasFolded: false, currentBet: 0 },
      ]

      const allPlayers = [
        { id: user.id, name: user.username, chips: user.chips, cards: [], isBot: false, isTurn: true, hasFolded: false, currentBet: 0 },
        ...bots
      ]

      dispatch(setPlayers(allPlayers))
    }
  }, [dispatch, isActive, user])

  const handleStartGame = () => {
    dispatch(startGame())
  }

  const handleFold = () => {
    // TODO: Implement fold action
  }

  const handleCall = () => {
    // TODO: Implement call action
  }

  const handleRaise = () => {
    // TODO: Implement raise action
  }

  if (!user) {
    return <div>Please log in to play</div>
  }

  return (
    <GameContainer>
      <PokerTable />
      <Controls>
        <Button onClick={handleFold} disabled={!isActive}>Fold</Button>
        <Button onClick={handleCall} disabled={!isActive}>Call</Button>
        <Button onClick={handleRaise} disabled={!isActive}>Raise</Button>
        {!isActive && <Button onClick={handleStartGame}>Start Game</Button>}
      </Controls>
    </GameContainer>
  )
}

export default Game 