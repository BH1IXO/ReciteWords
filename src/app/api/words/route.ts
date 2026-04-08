import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const words = await prisma.word.findMany({
    where: { studyDate: date },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json(words)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { english, chinese, phonetic } = body
  const today = new Date().toISOString().split('T')[0]

  const word = await prisma.word.create({
    data: { english, chinese, phonetic, studyDate: today },
  })

  return NextResponse.json(word, { status: 201 })
}
