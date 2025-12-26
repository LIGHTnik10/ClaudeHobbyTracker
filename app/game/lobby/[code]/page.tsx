'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Lobby, Player } from '@/app/game/types'

interface PageProps {
  params: Promise<{ code: string }>
}

export default function LobbyPage({ params }: PageProps) {
  const { code } = use(params)
  const router = useRouter()
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [resultsTimer, setResultsTimer] = useState(15)
  const [submitting, setSubmitting] = useState(false)

  const isHost = playerId === lobby?.hostId
  const currentPlayer = lobby?.players.find(p => p.id === playerId)
  const isMyTurn = lobby?.players[lobby.currentQuestionerIndex]?.id === playerId

  // Fetch lobby state
  const fetchLobby = useCallback(async () => {
    try {
      const response = await fetch(`/api/lobbies/${code}?playerId=${playerId || ''}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setError('Lobby not found')
          return
        }
        throw new Error(data.error)
      }

      setLobby(data.lobby)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch lobby:', err)
    }
  }, [code, playerId])

  // Initial load and check for stored player ID
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId')
    if (storedPlayerId) {
      setPlayerId(storedPlayerId)
    }
  }, [])

  // Poll for updates
  useEffect(() => {
    if (!playerId) {
      setLoading(false)
      return
    }

    fetchLobby()
    const interval = setInterval(fetchLobby, 1000)
    return () => clearInterval(interval)
  }, [fetchLobby, playerId])

  // Reset vote state when entering voting phase
  useEffect(() => {
    if (lobby?.phase === 'voting') {
      const alreadyVoted = lobby.currentRound?.votes.some(v => v.voterId === playerId)
      if (!alreadyVoted) {
        setHasVoted(false)
        setSelectedVote(null)
      } else {
        setHasVoted(true)
      }
    }
  }, [lobby?.phase, lobby?.currentRound?.votes, playerId])

  // Results timer
  useEffect(() => {
    if (lobby?.phase === 'results') {
      setResultsTimer(15)
      const interval = setInterval(() => {
        setResultsTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [lobby?.phase, lobby?.currentRound?.roundNumber])

  // Auto-advance to next round (host only)
  useEffect(() => {
    if (lobby?.phase === 'results' && isHost && resultsTimer === 0) {
      handleNextRound()
    }
  }, [resultsTimer, lobby?.phase, isHost])

  const handleStartGame = async () => {
    try {
      const response = await fetch(`/api/lobbies/${code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setLobby(data.lobby)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game')
    }
  }

  const handleSubmitQuestion = async () => {
    const question = selectedQuestion === 'custom' ? customQuestion : selectedQuestion
    if (!question?.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/lobbies/${code}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, question: question.trim() })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setLobby(data.lobby)
      setSelectedQuestion(null)
      setCustomQuestion('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit question')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (votedForId: string) => {
    if (hasVoted) return

    setSelectedVote(votedForId)
    setHasVoted(true)

    try {
      const response = await fetch(`/api/lobbies/${code}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, votedForId })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setLobby(data.lobby)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
      setHasVoted(false)
      setSelectedVote(null)
    }
  }

  const handleNextRound = async () => {
    try {
      const response = await fetch(`/api/lobbies/${code}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setLobby(data.lobby)
    } catch (err) {
      console.error('Failed to advance round:', err)
    }
  }

  const handleEndGame = async () => {
    try {
      const response = await fetch(`/api/lobbies/${code}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setLobby(data.lobby)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end game')
    }
  }

  // Get base URL for QR code
  const getJoinUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/game/lobby/${code}`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (error === 'Lobby not found' || !lobby) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lobby Not Found</h2>
          <p className="text-gray-600 mb-6">This lobby doesn&apos;t exist or has expired.</p>
          <button
            onClick={() => router.push('/game')}
            className="bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </main>
    )
  }

  if (!playerId || !currentPlayer) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <JoinForm code={code} onJoin={(id) => setPlayerId(id)} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl">
            <span className="text-sm opacity-75">Code:</span>{' '}
            <span className="font-mono font-bold text-lg">{code}</span>
          </div>
          {isHost && lobby.phase !== 'ended' && (
            <button
              onClick={handleEndGame}
              className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              End Game
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Waiting Phase */}
          {lobby.phase === 'waiting' && (
            <WaitingRoom
              lobby={lobby}
              isHost={isHost}
              joinUrl={getJoinUrl()}
              onStart={handleStartGame}
            />
          )}

          {/* Question Phase */}
          {lobby.phase === 'question' && (
            <QuestionPhase
              lobby={lobby}
              isMyTurn={isMyTurn}
              selectedQuestion={selectedQuestion}
              customQuestion={customQuestion}
              onSelectQuestion={setSelectedQuestion}
              onCustomQuestionChange={setCustomQuestion}
              onSubmit={handleSubmitQuestion}
              submitting={submitting}
            />
          )}

          {/* Voting Phase */}
          {lobby.phase === 'voting' && (
            <VotingPhase
              lobby={lobby}
              playerId={playerId}
              selectedVote={selectedVote}
              hasVoted={hasVoted}
              onVote={handleVote}
            />
          )}

          {/* Results Phase */}
          {lobby.phase === 'results' && (
            <ResultsPhase
              lobby={lobby}
              timer={resultsTimer}
            />
          )}

          {/* Game Ended */}
          {lobby.phase === 'ended' && (
            <GameEnded
              lobby={lobby}
              onBackToHome={() => router.push('/game')}
            />
          )}
        </div>

        {error && lobby.phase !== 'ended' && (
          <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-xl text-center">
            {error}
          </div>
        )}
      </div>
    </main>
  )
}

// Join Form Component
function JoinForm({ code, onJoin }: { code: string; onJoin: (playerId: string) => void }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/lobbies/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name.trim() })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      localStorage.setItem('playerId', data.playerId)
      localStorage.setItem('playerName', name.trim())
      onJoin(data.playerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Game</h2>
      <p className="text-gray-600 mb-6">Lobby Code: <span className="font-mono font-bold">{code}</span></p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-pink-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Join Game'}
        </button>
      </div>
    </div>
  )
}

// Waiting Room Component
function WaitingRoom({ lobby, isHost, joinUrl, onStart }: {
  lobby: Lobby
  isHost: boolean
  joinUrl: string
  onStart: () => void
}) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Waiting for Players</h2>

      {/* QR Code */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6 flex flex-col items-center">
        <QRCodeSVG value={joinUrl} size={180} level="M" />
        <p className="text-sm text-gray-600 mt-3">Scan to join</p>
      </div>

      {/* Player List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Players ({lobby.players.length})
        </h3>
        <div className="space-y-2">
          {lobby.players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getPlayerColor(index)}`}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-900">{player.name}</span>
              {player.isHost && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full ml-auto">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Button (Host Only) */}
      {isHost && (
        <button
          onClick={onStart}
          disabled={lobby.players.length < 2}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 px-6 rounded-xl text-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {lobby.players.length < 2 ? 'Need 2+ Players' : 'Start Game'}
        </button>
      )}

      {!isHost && (
        <p className="text-center text-gray-600">
          Waiting for host to start the game...
        </p>
      )}
    </div>
  )
}

// Question Phase Component
function QuestionPhase({ lobby, isMyTurn, selectedQuestion, customQuestion, onSelectQuestion, onCustomQuestionChange, onSubmit, submitting }: {
  lobby: Lobby
  isMyTurn: boolean
  selectedQuestion: string | null
  customQuestion: string
  onSelectQuestion: (q: string | null) => void
  onCustomQuestionChange: (q: string) => void
  onSubmit: () => void
  submitting: boolean
}) {
  const currentQuestioner = lobby.players[lobby.currentQuestionerIndex]

  if (isMyTurn) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Your Turn!</h2>
        <p className="text-gray-600 text-center mb-6">Choose a question to ask everyone</p>

        <div className="space-y-3 mb-6">
          {lobby.questionOptions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSelectQuestion(question)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedQuestion === question
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {question}
            </button>
          ))}

          <button
            onClick={() => onSelectQuestion('custom')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedQuestion === 'custom'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            Write your own question...
          </button>
        </div>

        {selectedQuestion === 'custom' && (
          <div className="mb-6">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => onCustomQuestionChange(e.target.value)}
              placeholder="Who is most likely to..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              maxLength={100}
            />
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={!selectedQuestion || (selectedQuestion === 'custom' && !customQuestion.trim()) || submitting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 px-6 rounded-xl text-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Question'}
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 text-center">
      <div className="animate-pulse mb-6">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">?</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {currentQuestioner?.name} is picking a question...
      </h2>
      <p className="text-gray-600">Get ready to vote!</p>
    </div>
  )
}

// Voting Phase Component
function VotingPhase({ lobby, playerId, selectedVote, hasVoted, onVote }: {
  lobby: Lobby
  playerId: string
  selectedVote: string | null
  hasVoted: boolean
  onVote: (votedForId: string) => void
}) {
  const votesSubmitted = lobby.currentRound?.votes.length || 0
  const totalPlayers = lobby.players.length

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Vote!</h2>
      <p className="text-lg text-purple-600 font-semibold text-center mb-6 px-4">
        &quot;{lobby.currentRound?.question}&quot;
      </p>

      <div className="space-y-3 mb-6">
        {lobby.players.map((player, index) => (
          <button
            key={player.id}
            onClick={() => onVote(player.id)}
            disabled={hasVoted}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              selectedVote === player.id
                ? 'border-purple-500 bg-purple-50'
                : hasVoted
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getPlayerColor(index)}`}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-900 text-lg">{player.name}</span>
            {selectedVote === player.id && (
              <svg className="w-6 h-6 text-purple-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="text-center text-gray-600">
        {hasVoted ? (
          <p>Waiting for others... ({votesSubmitted}/{totalPlayers} voted)</p>
        ) : (
          <p>Select who you think best fits the question</p>
        )}
      </div>
    </div>
  )
}

// Results Phase Component
function ResultsPhase({ lobby, timer }: { lobby: Lobby; timer: number }) {
  const results = lobby.currentRound?.results

  if (!results) return null

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="inline-block bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
          Next round in {timer}s
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Results</h2>
        <p className="text-purple-600 font-semibold">
          &quot;{lobby.currentRound?.question}&quot;
        </p>
      </div>

      {/* Winner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-center mb-6">
        <div className="text-6xl mb-2">🏆</div>
        <h3 className="text-2xl font-bold text-white mb-1">{results.mostVotedPlayerName}</h3>
        <p className="text-white/90">{results.voteCount} vote{results.voteCount !== 1 ? 's' : ''}</p>
      </div>

      {/* All Results */}
      <div className="space-y-2">
        {results.allVotes.map((result, index) => (
          <div
            key={result.playerId}
            className={`flex items-center justify-between p-3 rounded-xl ${
              index === 0 ? 'bg-yellow-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-500 w-6">{index + 1}</span>
              <span className="font-medium text-gray-900">{result.playerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-purple-200 rounded-full h-2 w-24">
                <div
                  className="bg-purple-600 rounded-full h-2 transition-all"
                  style={{ width: `${(result.count / lobby.players.length) * 100}%` }}
                />
              </div>
              <span className="font-semibold text-purple-600 w-8 text-right">{result.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Game Ended Component
function GameEnded({ lobby, onBackToHome }: { lobby: Lobby; onBackToHome: () => void }) {
  return (
    <div className="p-6 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Over!</h2>
      <p className="text-gray-600 mb-6">
        Thanks for playing! You completed {lobby.roundHistory.length} rounds.
      </p>

      <button
        onClick={onBackToHome}
        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 px-8 rounded-xl text-xl font-bold hover:opacity-90 transition-opacity"
      >
        Play Again
      </button>
    </div>
  )
}

// Helper function for player colors
function getPlayerColor(index: number): string {
  const colors = [
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  return colors[index % colors.length]
}
