import { NextRequest, NextResponse } from 'next/server'
import { submitQuestion, getLobby } from '@/app/game/lobbyStore'
import { SubmitQuestionRequest } from '@/app/game/types'

// POST /api/lobbies/[code]/question - Submit a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body: SubmitQuestionRequest = await request.json()

    if (!body.playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    if (!body.question || body.question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
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

    if (lobby.phase !== 'question') {
      return NextResponse.json(
        { error: 'Not in question phase' },
        { status: 400 }
      )
    }

    // Verify it's this player's turn
    const currentQuestioner = lobby.players[lobby.currentQuestionerIndex]
    if (!currentQuestioner || currentQuestioner.id !== body.playerId) {
      return NextResponse.json(
        { error: 'It is not your turn to ask a question' },
        { status: 403 }
      )
    }

    const updatedLobby = submitQuestion(code, body.playerId, body.question.trim())

    if (!updatedLobby) {
      return NextResponse.json(
        { error: 'Failed to submit question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lobby: updatedLobby })
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit question' },
      { status: 500 }
    )
  }
}
