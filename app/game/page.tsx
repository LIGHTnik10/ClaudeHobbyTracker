'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GameHome() {
  const router = useRouter()
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home')
  const [name, setName] = useState('')
  const [lobbyCode, setLobbyCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateLobby = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/lobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lobby')
      }

      // Store player info
      localStorage.setItem('playerId', data.playerId)
      localStorage.setItem('playerName', name.trim())

      // Navigate to lobby
      router.push(`/game/lobby/${data.lobbyCode}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLobby = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!lobbyCode.trim()) {
      setError('Please enter a lobby code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/lobbies/${lobbyCode.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join lobby')
      }

      // Store player info
      localStorage.setItem('playerId', data.playerId)
      localStorage.setItem('playerName', name.trim())

      // Navigate to lobby
      router.push(`/game/lobby/${lobbyCode.toUpperCase()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {mode === 'home' && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Party Game</h1>
            <p className="text-gray-600 mb-8">
              Who&apos;s most likely to...?
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Create Lobby
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full bg-pink-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-pink-600 transition-colors"
              >
                Join Lobby
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div>
            <button
              onClick={() => { setMode('home'); setError('') }}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Create Lobby</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                onClick={handleCreateLobby}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div>
            <button
              onClick={() => { setMode('home'); setError('') }}
              className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Lobby</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lobby Code
                </label>
                <input
                  type="text"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABCD"
                  maxLength={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg text-center tracking-widest font-mono uppercase focus:border-pink-500 focus:outline-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                onClick={handleJoinLobby}
                disabled={loading}
                className="w-full bg-pink-500 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
