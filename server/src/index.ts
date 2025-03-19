import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AddressInfo } from 'net';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with enhanced configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? 'https://your-production-domain.com'
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  pingTimeout: 30000,
  pingInterval: 10000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  path: '/socket.io/',
  connectTimeout: 30000,
  maxHttpBufferSize: 1e6,
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 2048
  },
  httpCompression: {
    threshold: 2048
  }
});

// Track active connections
const activeConnections = new Set<string>();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com'
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route with enhanced health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    socketio: {
      connections: activeConnections.size,
      status: io.engine?.clientsCount > 0 ? 'connected' : 'waiting'
    },
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling with enhanced logging and cleanup
io.on('connection', (socket) => {
  const clientId = socket.id;
  activeConnections.add(clientId);
  
  console.log(`Client connected [id=${clientId}] [transport=${socket.conn.transport.name}] [total=${activeConnections.size}]`);

  // Log transport changes
  socket.conn.on('upgrade', (transport) => {
    console.log(`Transport upgraded to ${transport.name} for client ${clientId}`);
  });

  // Handle game start
  socket.on('startGame', (config) => {
    try {
      console.log(`Game start requested by client ${clientId}:`, config);
      
      // Validate config
      if (!config || !config.numBots || !config.startingChips || !config.blinds) {
        throw new Error('Invalid game configuration');
      }

      // Emit success response
      socket.emit('gameStarted', { 
        success: true,
        message: 'Game initialized successfully',
        timestamp: new Date().toISOString(),
        config
      });
    } catch (error) {
      console.error(`Error starting game for client ${clientId}:`, error);
      socket.emit('gameStarted', { 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start game',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Enhanced cleanup on disconnect
  const cleanup = (reason: string) => {
    activeConnections.delete(clientId);
    console.log(`Client disconnected [id=${clientId}] [reason=${reason}] [remaining=${activeConnections.size}]`);
    
    // Remove all listeners for this socket
    socket.removeAllListeners();
    
    // Force disconnect if still connected
    if (socket.connected) {
      socket.disconnect(true);
    }
  };

  socket.on('disconnect', cleanup);
  socket.on('error', (error) => {
    console.error(`Socket error for client ${clientId}:`, error);
    cleanup('error');
  });
});

// Start server with enhanced error handling
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await new Promise<void>((resolve, reject) => {
      const server = httpServer.listen(PORT, () => {
        const address = httpServer.address() as AddressInfo;
        console.log(`Server running on port ${address.port}`);
        console.log(`Socket.IO path: ${io.path()}`);
        console.log(`Available transports: ${io.engine?.opts?.transports?.join(', ') || 'websocket, polling'}`);
        resolve();
      });

      server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });

      // Handle process termination
      const cleanup = () => {
        console.log('Shutting down server...');
        activeConnections.clear();
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      };

      process.on('SIGTERM', cleanup);
      process.on('SIGINT', cleanup);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
