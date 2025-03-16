import styled from 'styled-components'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { Player } from '../store/slices/gameSlice'

const TableContainer = styled.div`
  position: relative;
  width: 800px;
  height: 400px;
  background: #35654d;
  border-radius: 200px;
  border: 15px solid #4a2810;
  margin: 50px auto;
`

const PlayerPosition = styled.div<{ position: number }>`
  position: absolute;
  width: 120px;
  height: 160px;
  ${({ position }) => {
    switch (position) {
      case 0: // Bottom
        return 'bottom: 0; left: 50%; transform: translateX(-50%);'
      case 1: // Bottom Right
        return 'bottom: 20%; right: 10%;'
      case 2: // Top Right
        return 'top: 20%; right: 10%;'
      case 3: // Top
        return 'top: 0; left: 50%; transform: translateX(-50%);'
      case 4: // Top Left
        return 'top: 20%; left: 10%;'
      case 5: // Bottom Left
        return 'bottom: 20%; left: 10%;'
      default:
        return ''
    }
  }}
`

const PlayerInfo = styled.div`
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
`

const CommunityCards = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 10px;
`

const Card = styled.div`
  width: 50px;
  height: 70px;
  background: white;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`

const Pot = styled.div`
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 24px;
  font-weight: bold;
`

const PokerTable = () => {
  const { players, communityCards, pot } = useSelector((state: RootState) => state.game)

  return (
    <TableContainer>
      <Pot>Pot: ${pot}</Pot>
      <CommunityCards>
        {communityCards.map((card, index) => (
          <Card key={index}>
            {card.value}
            <span style={{ color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black' }}>
              {card.suit === 'hearts' ? '♥' :
               card.suit === 'diamonds' ? '♦' :
               card.suit === 'clubs' ? '♣' : '♠'}
            </span>
          </Card>
        ))}
      </CommunityCards>
      {players.map((player: Player, index: number) => (
        <PlayerPosition key={player.id} position={index}>
          <PlayerInfo>
            <div>{player.name}</div>
            <div>Chips: ${player.chips}</div>
            {player.cards.map((card, cardIndex) => (
              <Card key={cardIndex}>
                {player.isBot ? '🂠' : // Show card back for bots
                  <>
                    {card.value}
                    <span style={{ color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black' }}>
                      {card.suit === 'hearts' ? '♥' :
                       card.suit === 'diamonds' ? '♦' :
                       card.suit === 'clubs' ? '♣' : '♠'}
                    </span>
                  </>
                }
              </Card>
            ))}
          </PlayerInfo>
        </PlayerPosition>
      ))}
    </TableContainer>
  )
}

export default PokerTable 