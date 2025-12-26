import { NextRequest, NextResponse } from 'next/server'
import { createLobby } from '@/app/game/lobbyStore'
import { CreateLobbyRequest, CreateLobbyResponse } from '@/app/game/types'

// POST /api/lobbies - Create a new lobby
export async function POST(request: NextRequest) {
  try {
    const body: CreateLobbyRequest = await request.json()

    if (!body.hostName || body.hostName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Host name is required' },
        { status: 400 }
      )
    }

    if (body.hostName.length > 20) {
      return NextResponse.json(
        { error: 'Name must be 20 characters or less' },
        { status: 400 }
      )
    }

    const { lobby, playerId } = createLobby(body.hostName.trim())

    const response: CreateLobbyResponse = {
      lobbyCode: lobby.code,
      playerId
    }

    return NextResponse.json(response, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create lobby' },
      { status: 500 }
    )
  }
}
