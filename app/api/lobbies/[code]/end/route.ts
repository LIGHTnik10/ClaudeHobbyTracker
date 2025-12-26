import { NextRequest, NextResponse } from 'next/server'
import { endGame, getLobby } from '@/app/game/lobbyStore'
import { EndGameRequest } from '@/app/game/types'

// POST /api/lobbies/[code]/end - End the game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body: EndGameRequest = await request.json()

    if (!body.playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    const lobby = getLobby(code)

    if (!lobby) {
      return NextResponse.json(
        { error: 'Lobby not found' },
        { status: 404 }
      )
    }

    // Only host can end the game
    if (lobby.hostId !== body.playerId) {
      return NextResponse.json(
        { error: 'Only the host can end the game' },
        { status: 403 }
      )
    }

    const updatedLobby = endGame(code, body.playerId)

    if (!updatedLobby) {
      return NextResponse.json(
        { error: 'Failed to end game' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lobby: updatedLobby })
  } catch {
    return NextResponse.json(
      { error: 'Failed to end game' },
      { status: 500 }
    )
  }
}
