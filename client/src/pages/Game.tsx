import { useState, useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { io, Socket } from 'socket.io-client'
import PokerTable from '../components/game/PokerTable'
import GameConfig, { GameConfig as GameConfigType } from '../components/game/GameConfig'
import { GameState, Player } from '../types/poker'
import { initializeGame } from '../utils/poker'

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1e24 0%, #2c3e50 100%);
  padding: 20px;
`

const SERVER_URL = 'http://localhost:3000';

export default function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameConfig, setGameConfig] = useState<GameConfigType | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const mounted = useRef(true)
  const socketRef = useRef<Socket | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Initialize socket connection
  useEffect(() => {
    const connectToServer = async () => {
      if (!mounted.current) return;
      
      try {
        if (socketRef.current?.connected) {
          setIsConnected(true);
          return;
        }

        if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Maximum reconnection attempts reached. Please refresh the page.');
          return;
        }

        setError(null);
        reconnectAttempts.current += 1;

        const socket = io(SERVER_URL, {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['polling', 'websocket'],
          forceNew: true,
          path: '/socket.io/',
          autoConnect: true,
          withCredentials: true,
          extraHeaders: {
            'Content-Type': 'application/json'
          }
        });

        // Attach event handlers before connecting
        socket.io.on("error", (error) => {
          console.error('Socket.IO Error:', error);
          if (mounted.current) {
            setError(`Connection error: ${error.message}`);
          }
        });

        socket.io.on("reconnect_attempt", (attempt) => {
          console.log(`Reconnection attempt ${attempt}`);
          if (mounted.current) {
            setError(`Reconnecting... (Attempt ${attempt})`);
          }
        });

        socket.on('connect', () => {
          console.log('Connected to server with transport:', socket.io.engine.transport.name);
          if (mounted.current) {
            setIsConnected(true);
            setError(null);
            reconnectAttempts.current = 0;
          }
        });

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          if (mounted.current) {
            setIsConnected(false);
            setError(`Failed to connect: ${error.message}. Retrying...`);
            
            // Try to switch transport if websocket fails
            if (socket.io.engine.transport.name === 'websocket') {
              console.log('WebSocket failed, falling back to polling...');
              socket.io.opts.transports = ['polling'];
            }
          }
        });

        socket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
          if (mounted.current) {
            setIsConnected(false);
            setError(`Disconnected from server: ${reason}. Attempting to reconnect...`);
            
            // Only attempt reconnect for certain disconnect reasons
            if (['io server disconnect', 'transport close', 'transport error'].includes(reason)) {
              setTimeout(connectToServer, 2000);
            }
          }
        });

        socket.on('gameStarted', (response) => {
          console.log('Game started response:', response);
          if (!mounted.current) return;

          if (response.success) {
            if (gameConfig) {
              try {
                const initialPlayers: Player[] = [
                  {
                    id: 1,
                    name: 'You',
                    chips: gameConfig.startingChips,
                    position: 0,
                    cards: [],
                    bet: 0,
                    isActive: true,
                    isTurn: false,
                    isDealer: false
                  },
                  ...Array(gameConfig.numBots).fill(null).map((_, index) => ({
                    id: index + 2,
                    name: `AI ${index + 1}`,
                    chips: gameConfig.startingChips,
                    position: ((index + 1) * Math.floor(8 / (gameConfig.numBots + 1))) % 8,
                    cards: [],
                    bet: 0,
                    isActive: true,
                    isTurn: false,
                    isDealer: false
                  }))
                ];

                const newGameState = initializeGame(initialPlayers, gameConfig.blinds);
                console.log('Initialized game state:', newGameState);
                setGameState(newGameState);
                setIsInitializing(false);
              } catch (error) {
                console.error('Error initializing game state:', error);
                setError('Failed to initialize game state. Please try again.');
                setIsInitializing(false);
              }
            }
          } else {
            setError(response.message || 'Failed to start game. Please try again.');
            setIsInitializing(false);
          }
        });

        socketRef.current = socket;
      } catch (err) {
        console.error('Socket initialization error:', err);
        if (mounted.current) {
          setError(`Failed to initialize connection: ${err instanceof Error ? err.message : 'Unknown error'}. Please refresh the page.`);
        }
      }
    };

    const cleanup = () => {
      mounted.current = false;
      if (socketRef.current) {
        console.log('Cleaning up socket connection...');
        // Remove all event listeners
        ['connect', 'connect_error', 'disconnect', 'gameStarted'].forEach(event => {
          socketRef.current?.off(event);
        });
        socketRef.current.io.off('error');
        socketRef.current.io.off('reconnect_attempt');
        
        // Close the connection
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      setGameState(null);
      setGameConfig(null);
      setIsInitializing(false);
      setError(null);
      reconnectAttempts.current = 0;
    };

    connectToServer();
    return cleanup;
  }, []);

  const handleStartGame = useCallback((config: GameConfigType) => {
    if (!mounted.current || !socketRef.current?.connected) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }
    
    console.log('Form submitted with config:', config);
    setError(null);
    setIsInitializing(true);
    setGameConfig(config);
    
    // Emit startGame event to server
    socketRef.current.emit('startGame', config);
  }, []);

  // Show error state
  if (error) {
    return (
      <GameContainer>
        <div style={{ 
          color: 'red', 
          textAlign: 'center', 
          padding: '2rem',
          fontSize: '1.2rem'
        }}>
          {error}
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            style={{
              display: 'block',
              margin: '1rem auto',
              padding: '0.5rem 1rem',
              backgroundColor: '#ffd700',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </GameContainer>
    )
  }

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <GameContainer>
        <div style={{ 
          color: 'white', 
          textAlign: 'center', 
          padding: '2rem',
          fontSize: '1.2rem'
        }}>
          Initializing game...
        </div>
      </GameContainer>
    )
  }

  // Show connecting state
  if (!isConnected) {
    return (
      <GameContainer>
        <div style={{ 
          color: 'white', 
          textAlign: 'center', 
          padding: '2rem',
          fontSize: '1.2rem'
        }}>
          Connecting to server...
        </div>
      </GameContainer>
    )
  }

  // Show config screen if no game state
  if (!gameState || !gameConfig) {
    return (
      <GameContainer>
        <GameConfig onStartGame={handleStartGame} />
      </GameContainer>
    )
  }

  // Show poker table once everything is initialized
  return (
    <GameContainer>
      <PokerTable
        state={gameState}
        setState={setGameState}
        config={gameConfig}
        onNewGame={() => {
          if (mounted.current) {
            setGameState(null);
            setGameConfig(null);
            setIsInitializing(false);
            setError(null);
          }
        }}
      />
    </GameContainer>
  )
} 