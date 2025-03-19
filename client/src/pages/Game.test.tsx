import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import Game from './Game'
import { Socket } from 'socket.io-client'

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

describe('Game Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks()
  })

  it('renders game configuration screen initially', () => {
    render(<Game />)
    expect(screen.getByText(/Number of AI Opponents/i)).toBeInTheDocument()
  })

  it('shows loading state when starting game', async () => {
    render(<Game />)
    
    // Find and click the start game button
    const startButton = screen.getByText(/Start Game/i)
    await act(async () => {
      fireEvent.click(startButton)
    })

    expect(screen.getByText(/Initializing game.../i)).toBeInTheDocument()
  })

  it('handles server connection error', async () => {
    // Mock socket connection error
    const mockSocket = {
      on: vi.fn((event, callback) => {
        if (event === 'connect_error') {
          callback(new Error('Connection failed'))
        }
      }),
      emit: vi.fn(),
      disconnect: vi.fn(),
    }

    vi.mock('socket.io-client', () => ({
      io: () => mockSocket,
    }))

    render(<Game />)

    // Wait for error message
    const errorMessage = await screen.findByText(/Failed to connect to server/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('starts game successfully', async () => {
    // Mock successful socket connection and game start
    const mockSocket = {
      on: vi.fn((event, callback) => {
        if (event === 'gameStarted') {
          callback({ success: true })
        }
      }),
      emit: vi.fn(),
      disconnect: vi.fn(),
    }

    vi.mock('socket.io-client', () => ({
      io: () => mockSocket,
    }))

    render(<Game />)

    // Configure and start game
    const startButton = screen.getByText(/Start Game/i)
    await act(async () => {
      fireEvent.click(startButton)
    })

    // Verify socket.emit was called with correct parameters
    expect(mockSocket.emit).toHaveBeenCalledWith('startGame', expect.any(Object))
  })
}) 