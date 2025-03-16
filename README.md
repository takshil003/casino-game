# Casino Poker Game

A full-stack web application for playing poker against AI-powered bots. Built with React, Node.js, and PostgreSQL.

## Features

- Texas Hold'em poker gameplay
- AI-powered bots with different difficulty levels
- Real-time game updates using WebSocket
- User authentication and chip tracking
- Beautiful and responsive UI

## Tech Stack

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- Socket.io for real-time communication
- Styled Components for styling

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL for data persistence
- Socket.io for WebSocket communication
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd casino-game
```

2. Install frontend dependencies:
```bash
cd client
pnpm install
```

3. Install backend dependencies:
```bash
cd ../server
pnpm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/casino_game
JWT_SECRET=your_jwt_secret
```

5. Start the development servers:

Frontend:
```bash
cd client
pnpm dev
```

Backend:
```bash
cd server
pnpm dev
```

## Project Structure

```
casino-game/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/        # Redux store and slices
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utility functions
│   └── ...
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── ...
└── README.md
```

## License

MIT 