import { NextRequest, NextResponse } from 'next/server'
import { getLobby, updatePlayerPing } from '@/app/game/lobbyStore'

// GET /api/lobbies/[code] - Get lobby state
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const playerId = request.nextUrl.searchParams.get('playerId')

    const lobby = getLobby(code)

    if (!lobby) {
      return NextResponse.json(
        { error: 'Lobby not found' },
        { status: 404 }
      )
    }

    // Update player ping if playerId provided
    if (playerId) {
      updatePlayerPing(code, playerId)
    }

    return NextResponse.json({ lobby })
  } catch {
    return NextResponse.json(
      { error: 'Failed to get lobby' },
      { status: 500 }
    )
  }
}
