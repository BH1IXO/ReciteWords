import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNextReviewDate } from '@/lib/srs'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const body = await request.json()
  const { mastered, action } = body

  // Record flip action
  if (action === 'flip') {
    await prisma.studyLog.create({ data: { wordId: id, action: 'flip' } })
    return NextResponse.json({ ok: true })
  }

  // Mark mastered
  const current = await prisma.word.findUniqueOrThrow({ where: { id } })
  const newLevel = Math.min(current.level + 1, 4)
  const reviewAt = getNextReviewDate(newLevel)

  const word = await prisma.word.update({
    where: { id },
    data: { mastered, level: newLevel, reviewAt },
  })

  await prisma.studyLog.create({ data: { wordId: id, action: 'mastered' } })

  return NextResponse.json(word)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const body = await request.json()
  const { english, chinese, phonetic } = body

  const word = await prisma.word.update({
    where: { id },
    data: { english, chinese, phonetic: phonetic || null },
  })

  return NextResponse.json(word)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  await prisma.word.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
