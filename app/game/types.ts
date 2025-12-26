// Game Types for Multiplayer QR-based Party Game

export interface Player {
  id: string
  name: string
  isHost: boolean
  joinedAt: number
  isConnected: boolean
  lastPing: number
}

export type GamePhase =
  | 'waiting'        // Waiting for players to join
  | 'question'       // Current player is selecting a question
  | 'voting'         // Everyone is voting
  | 'results'        // Showing results
  | 'ended'          // Game has ended

export interface Vote {
  voterId: string
  votedForId: string
}

export interface Round {
  roundNumber: number
  questionerId: string   // Player who asked the question
  question: string
  votes: Vote[]
  results?: RoundResults
  startedAt: number
}

export interface RoundResults {
  mostVotedPlayerId: string
  mostVotedPlayerName: string
  voteCount: number
  allVotes: { playerId: string; playerName: string; count: number }[]
}

export interface Lobby {
  code: string
  hostId: string
  players: Player[]
  phase: GamePhase
  currentRound: Round | null
  roundHistory: Round[]
  currentQuestionerIndex: number  // Index in players array for rotation
  createdAt: number
  questionOptions: string[]       // 3 question options for current round
}

// API Request/Response Types
export interface CreateLobbyRequest {
  hostName: string
}

export interface CreateLobbyResponse {
  lobbyCode: string
  playerId: string
}

export interface JoinLobbyRequest {
  playerName: string
}

export interface JoinLobbyResponse {
  playerId: string
  lobby: Lobby
}

export interface SubmitQuestionRequest {
  playerId: string
  question: string
}

export interface SubmitVoteRequest {
  playerId: string
  votedForId: string
}

export interface EndGameRequest {
  playerId: string
}

export interface LobbyStateResponse {
  lobby: Lobby
  playerId?: string
}

// Predefined question pool
export const QUESTION_POOL: string[] = [
  "Who is most likely to become famous?",
  "Who would survive longest in a zombie apocalypse?",
  "Who is most likely to become a millionaire?",
  "Who is the best dancer?",
  "Who tells the best jokes?",
  "Who is most likely to forget their own birthday?",
  "Who would win in a food eating contest?",
  "Who is most likely to travel the world?",
  "Who is the biggest drama queen?",
  "Who is most likely to cry during a movie?",
  "Who is the best cook?",
  "Who would be the worst at keeping a secret?",
  "Who is most likely to win the lottery and lose the ticket?",
  "Who is the most adventurous?",
  "Who is most likely to become president?",
  "Who is the best listener?",
  "Who is most likely to sleep through an earthquake?",
  "Who gives the best advice?",
  "Who is most likely to start a viral trend?",
  "Who would be the best superhero?",
  "Who is most likely to get lost in their own city?",
  "Who has the best fashion sense?",
  "Who is most likely to become a celebrity?",
  "Who would be the first to survive on a deserted island?",
  "Who is most likely to write a book?",
  "Who is the most competitive?",
  "Who is most likely to adopt 10 cats?",
  "Who has the best laugh?",
  "Who is most likely to go viral on social media?",
  "Who would make the best teacher?"
]

// Helper to get random questions
export function getRandomQuestions(count: number = 3): string[] {
  const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
