import { NextRequest, NextResponse } from 'next/server'
import { startQuestionPhase, getLobby } from '@/app/game/lobbyStore'

// POST /api/lobbies/[code]/start - Start the game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { playerId } = body

    const lobby = getLobby(code)

    if (!lobby) {
      return NextResponse.json(
        { error: 'Lobby not found' },
        { status: 404 }
      )
    }

    // Only host can start the game
    if (lobby.hostId !== playerId) {
      return NextResponse.json(
        { error: 'Only the host can start the game' },
        { status: 403 }
      )
    }

    // Need at least 2 players
    if (lobby.players.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to start' },
        { status: 400 }
      )
    }

    const updatedLobby = startQuestionPhase(code)

    if (!updatedLobby) {
      return NextResponse.json(
        { error: 'Failed to start game' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lobby: updatedLobby })
  } catch {
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    )
  }
}
