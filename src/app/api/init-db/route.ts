import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

// GET /api/init-db
// Call this once after deploying to Vercel to create tables
// REMOVE or PROTECT this route in production after use
export async function GET(request: NextRequest) {
  // Basic protection: check for a secret query param
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database tables created successfully' })
  } catch (error) {
    console.error('DB init error:', error)
    return NextResponse.json({ success: false, error: 'Failed to initialize database' }, { status: 500 })
  }
}
