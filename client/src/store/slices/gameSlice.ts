import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: string
}

export interface Player {
  id: string
  name: string
  chips: number
  cards: Card[]
  isBot: boolean
  isTurn: boolean
  hasFolded: boolean
  currentBet: number
}

interface GameState {
  isActive: boolean
  players: Player[]
  communityCards: Card[]
  pot: number
  currentBet: number
  dealerPosition: number
  currentTurn: number
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished'
}

const initialState: GameState = {
  isActive: false,
  players: [],
  communityCards: [],
  pot: 0,
  currentBet: 0,
  dealerPosition: 0,
  currentTurn: 0,
  phase: 'preflop',
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isActive = true
      state.phase = 'preflop'
    },
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload
    },
    setCommunityCards: (state, action: PayloadAction<Card[]>) => {
      state.communityCards = action.payload
    },
    updatePot: (state, action: PayloadAction<number>) => {
      state.pot = action.payload
    },
    updateCurrentBet: (state, action: PayloadAction<number>) => {
      state.currentBet = action.payload
    },
    updatePhase: (state, action: PayloadAction<GameState['phase']>) => {
      state.phase = action.payload
    },
    updatePlayerTurn: (state, action: PayloadAction<number>) => {
      state.currentTurn = action.payload
    },
    playerAction: (state, action: PayloadAction<{ playerId: string; action: 'fold' | 'call' | 'raise'; amount?: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId)
      if (player) {
        switch (action.payload.action) {
          case 'fold':
            player.hasFolded = true
            break
          case 'call':
            player.currentBet = state.currentBet
            break
          case 'raise':
            if (action.payload.amount) {
              player.currentBet = action.payload.amount
              state.currentBet = action.payload.amount
            }
            break
        }
      }
    },
    resetGame: (state) => {
      return initialState
    },
  },
})

export const {
  startGame,
  setPlayers,
  setCommunityCards,
  updatePot,
  updateCurrentBet,
  updatePhase,
  updatePlayerTurn,
  playerAction,
  resetGame,
} = gameSlice.actions

export default gameSlice.reducer 