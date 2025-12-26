// In-memory store for lobbies
// Note: This will reset on server restart. For production, use a database.

import { Lobby, Player, Round, RoundResults, getRandomQuestions } from './types'
import { v4 as uuidv4 } from 'uuid'

// Store all lobbies in memory
const lobbies: Map<string, Lobby> = new Map()

// Generate a random 4-character lobby code
function generateLobbyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like I, O, 0, 1
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  // Make sure code is unique
  if (lobbies.has(code)) {
    return generateLobbyCode()
  }
  return code
}

export function createLobby(hostName: string): { lobby: Lobby; playerId: string } {
  const code = generateLobbyCode()
  const playerId = uuidv4()

  const host: Player = {
    id: playerId,
    name: hostName,
    isHost: true,
    joinedAt: Date.now(),
    isConnected: true,
    lastPing: Date.now()
  }

  const lobby: Lobby = {
    code,
    hostId: playerId,
    players: [host],
    phase: 'waiting',
    currentRound: null,
    roundHistory: [],
    currentQuestionerIndex: 0,
    createdAt: Date.now(),
    questionOptions: []
  }

  lobbies.set(code, lobby)
  return { lobby, playerId }
}

export function getLobby(code: string): Lobby | null {
  return lobbies.get(code.toUpperCase()) || null
}

export function joinLobby(code: string, playerName: string): { lobby: Lobby; playerId: string } | null {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby) return null

  // Check if game has ended
  if (lobby.phase === 'ended') return null

  // Check if player name already exists (rejoin)
  const existingPlayer = lobby.players.find(p => p.name.toLowerCase() === playerName.toLowerCase())
  if (existingPlayer) {
    existingPlayer.isConnected = true
    existingPlayer.lastPing = Date.now()
    return { lobby, playerId: existingPlayer.id }
  }

  const playerId = uuidv4()
  const player: Player = {
    id: playerId,
    name: playerName,
    isHost: false,
    joinedAt: Date.now(),
    isConnected: true,
    lastPing: Date.now()
  }

  lobby.players.push(player)
  return { lobby, playerId }
}

export function updatePlayerPing(code: string, playerId: string): void {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby) return

  const player = lobby.players.find(p => p.id === playerId)
  if (player) {
    player.lastPing = Date.now()
    player.isConnected = true
  }
}

export function startQuestionPhase(code: string): Lobby | null {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby) return null

  // Need at least 2 players to play
  if (lobby.players.length < 2) return null

  lobby.phase = 'question'
  lobby.questionOptions = getRandomQuestions(3)

  return lobby
}

export function submitQuestion(code: string, playerId: string, question: string): Lobby | null {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby) return null

  // Verify the questioner is the current player in rotation
  const currentQuestioner = lobby.players[lobby.currentQuestionerIndex]
  if (!currentQuestioner || currentQuestioner.id !== playerId) return null

  const round: Round = {
    roundNumber: lobby.roundHistory.length + 1,
    questionerId: playerId,
    question,
    votes: [],
    startedAt: Date.now()
  }

  lobby.currentRound = round
  lobby.phase = 'voting'

  return lobby
}

export function submitVote(code: string, voterId: string, votedForId: string): Lobby | null {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby || !lobby.currentRound) return null
  if (lobby.phase !== 'voting') return null

  // Check if already voted
  const existingVote = lobby.currentRound.votes.find(v => v.voterId === voterId)
  if (existingVote) return lobby // Already voted, just return current state

  // Verify voted player exists
  const votedPlayer = lobby.players.find(p => p.id === votedForId)
  if (!votedPlayer) return null

  lobby.currentRound.votes.push({
    voterId,
    votedForId
  })

  // Check if all players have voted
  if (lobby.currentRound.votes.length >= lobby.players.length) {
    calculateAndShowResults(lobby)
  }

  return lobby
}

function calculateAndShowResults(lobby: Lobby): void {
  if (!lobby.currentRound) return

  // Count votes
  const voteCount: Map<string, number> = new Map()

  for (const vote of lobby.currentRound.votes) {
    const current = voteCount.get(vote.votedForId) || 0
    voteCount.set(vote.votedForId, current + 1)
  }

  // Build results
  const allVotes: { playerId: string; playerName: string; count: number }[] = []
  let maxVotes = 0
  let mostVotedId = ''

  for (const [playerId, count] of Array.from(voteCount.entries())) {
    const player = lobby.players.find(p => p.id === playerId)
    if (player) {
      allVotes.push({
        playerId,
        playerName: player.name,
        count
      })
      if (count > maxVotes) {
        maxVotes = count
        mostVotedId = playerId
      }
    }
  }

  // Sort by vote count descending
  allVotes.sort((a, b) => b.count - a.count)

  const mostVotedPlayer = lobby.players.find(p => p.id === mostVotedId)

  const results: RoundResults = {
    mostVotedPlayerId: mostVotedId,
    mostVotedPlayerName: mostVotedPlayer?.name || 'Unknown',
    voteCount: maxVotes,
    allVotes
  }

  lobby.currentRound.results = results
  lobby.phase = 'results'
}

export function forceShowResults(code: string): Lobby | null {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby || !lobby.currentRound) return null

  calculateAndShowResults(lobby)
  return lobby
}

export function nextRound(code: string): Lobby | null {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby) return null

  // Save current round to history if exists
  if (lobby.currentRound) {
    lobby.roundHistory.push(lobby.currentRound)
  }

  // Move to next questioner (rotation)
  lobby.currentQuestionerIndex = (lobby.currentQuestionerIndex + 1) % lobby.players.length

  // Reset for next round
  lobby.currentRound = null
  lobby.phase = 'question'
  lobby.questionOptions = getRandomQuestions(3)

  return lobby
}

export function endGame(code: string, playerId: string): Lobby | null {
  const lobby = lobbies.get(code.toUpperCase())
  if (!lobby) return null

  // Only host can end game
  if (lobby.hostId !== playerId) return null

  lobby.phase = 'ended'
  return lobby
}

export function deleteLobby(code: string): boolean {
  return lobbies.delete(code.toUpperCase())
}

// Cleanup old lobbies (older than 2 hours)
export function cleanupOldLobbies(): void {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000

  for (const [code, lobby] of Array.from(lobbies.entries())) {
    if (lobby.createdAt < twoHoursAgo) {
      lobbies.delete(code)
    }
  }
}

// Run cleanup every 30 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldLobbies, 30 * 60 * 1000)
}
