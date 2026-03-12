import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { sql } from '@/lib/db'

// GET /api/games - list all games for the logged-in user
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''
    const platform = searchParams.get('platform') || ''

    let query
    if (search || genre || platform) {
      query = await sql`
        SELECT * FROM games
        WHERE user_id = ${user.userId}
          AND (${search} = '' OR title ILIKE ${'%' + search + '%'})
          AND (${genre} = '' OR genre ILIKE ${'%' + genre + '%'})
          AND (${platform} = '' OR platform ILIKE ${'%' + platform + '%'})
        ORDER BY created_at DESC
      `
    } else {
      query = await sql`
        SELECT * FROM games WHERE user_id = ${user.userId} ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ success: true, data: { games: query.rows } })
  })
}

// POST /api/games - add a new game
export async function POST(request: NextRequest) {
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
      INSERT INTO games (user_id, title, genre, platform, cover_url, notes)
      VALUES (${user.userId}, ${title}, ${genre}, ${platform}, ${cover_url || null}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json({ success: true, data: { game: result.rows[0] } }, { status: 201 })
  })
}
