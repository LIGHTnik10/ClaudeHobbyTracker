import { NextRequest, NextResponse } from 'next/server'
import { submitVote, getLobby } from '@/app/game/lobbyStore'
import { SubmitVoteRequest } from '@/app/game/types'

// POST /api/lobbies/[code]/vote - Submit a vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body: SubmitVoteRequest = await request.json()

    if (!body.playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    if (!body.votedForId) {
      return NextResponse.json(
        { error: 'Vote target is required' },
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

    if (lobby.phase !== 'voting') {
      return NextResponse.json(
        { error: 'Not in voting phase' },
        { status: 400 }
      )
    }

    // Verify player is in the lobby
    const player = lobby.players.find(p => p.id === body.playerId)
    if (!player) {
      return NextResponse.json(
        { error: 'You are not in this lobby' },
        { status: 403 }
      )
    }

    const updatedLobby = submitVote(code, body.playerId, body.votedForId)

    if (!updatedLobby) {
      return NextResponse.json(
        { error: 'Failed to submit vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lobby: updatedLobby })
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}
