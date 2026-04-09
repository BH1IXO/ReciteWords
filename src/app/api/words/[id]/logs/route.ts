import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  const logs = await prisma.studyLog.findMany({
    where: { wordId: id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  return NextResponse.json(logs)
}
