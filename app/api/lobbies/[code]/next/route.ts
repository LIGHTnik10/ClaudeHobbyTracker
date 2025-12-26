import { NextRequest, NextResponse } from 'next/server'
import { nextRound, getLobby } from '@/app/game/lobbyStore'

// POST /api/lobbies/[code]/next - Move to next round
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

    // Only host can advance to next round (or it happens automatically via timer on client)
    // For now, allow any player to trigger next round (client will handle the timer)
    const player = lobby.players.find(p => p.id === playerId)
    if (!player) {
      return NextResponse.json(
        { error: 'You are not in this lobby' },
        { status: 403 }
      )
    }

    if (lobby.phase !== 'results') {
      return NextResponse.json(
        { error: 'Can only advance from results phase' },
        { status: 400 }
      )
    }

    const updatedLobby = nextRound(code)

    if (!updatedLobby) {
      return NextResponse.json(
        { error: 'Failed to advance to next round' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lobby: updatedLobby })
  } catch {
    return NextResponse.json(
      { error: 'Failed to advance to next round' },
      { status: 500 }
    )
  }
}
