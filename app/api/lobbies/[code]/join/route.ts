import { NextRequest, NextResponse } from 'next/server'
import { joinLobby, getLobby } from '@/app/game/lobbyStore'
import { JoinLobbyRequest, JoinLobbyResponse } from '@/app/game/types'

// POST /api/lobbies/[code]/join - Join a lobby
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body: JoinLobbyRequest = await request.json()

    if (!body.playerName || body.playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      )
    }

    if (body.playerName.length > 20) {
      return NextResponse.json(
        { error: 'Name must be 20 characters or less' },
        { status: 400 }
      )
    }

    // Check if lobby exists first
    const existingLobby = getLobby(code)
    if (!existingLobby) {
      return NextResponse.json(
        { error: 'Lobby not found' },
        { status: 404 }
      )
    }

    if (existingLobby.phase === 'ended') {
      return NextResponse.json(
        { error: 'This game has ended' },
        { status: 400 }
      )
    }

    const result = joinLobby(code, body.playerName.trim())

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to join lobby' },
        { status: 400 }
      )
    }

    const response: JoinLobbyResponse = {
      playerId: result.playerId,
      lobby: result.lobby
    }

    return NextResponse.json(response, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to join lobby' },
      { status: 500 }
    )
  }
}
