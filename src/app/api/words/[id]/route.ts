import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const body = await request.json()
  const { mastered } = body

  const word = await prisma.word.update({
    where: { id },
    data: { mastered },
  })

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
