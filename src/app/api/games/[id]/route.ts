import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { sql } from '@/lib/db'

// GET /api/games/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req, user) => {
    const result = await sql`
      SELECT * FROM games WHERE id = ${params.id} AND user_id = ${user.userId}
    `
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { game: result.rows[0] } })
  })
}

// PUT /api/games/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req, user) => {
    const body = await req.json()
    const { title, genre, platform, cover_url, notes } = body

    if (!title || !genre || !platform) {
      return NextResponse.json(
        { success: false, error: 'Title, genre, and platform are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE games
      SET title = ${title}, genre = ${genre}, platform = ${platform},
          cover_url = ${cover_url || null}, notes = ${notes || null},
          updated_at = NOW()
      WHERE id = ${params.id} AND user_id = ${user.userId}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { game: result.rows[0] } })
  })
}

// DELETE /api/games/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req, user) => {
    const result = await sql`
      DELETE FROM games WHERE id = ${params.id} AND user_id = ${user.userId} RETURNING id
    `
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Game deleted' })
  })
}
