'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import WordCard from '@/components/WordCard'
import Progress from '@/components/Progress'
import Skeleton from '@/components/Skeleton'
import { useKeyboard } from '@/hooks/useKeyboard'

interface Word {
  id: number
  english: string
  chinese: string
  phonetic: string | null
  mastered: boolean
  studyDate: string
}

export default function Home() {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allDone, setAllDone] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch(`/api/words?date=${today}`)
      .then((r) => r.json())
      .then((data: Word[]) => {
        setWords(data)
        const firstUnmastered = data.findIndex((w) => !w.mastered)
        setCurrentIndex(firstUnmastered === -1 ? 0 : firstUnmastered)
        if (data.length > 0 && data.every((w) => w.mastered)) setAllDone(true)
        setLoading(false)
      })
  }, [today])

  const unmasteredWords = words.filter((w) => !w.mastered)
  const masteredCount = words.filter((w) => w.mastered).length

  const handleFlip = useCallback(() => setFlipped((f) => !f), [])

  const handleNext = useCallback(() => {
    if (unmasteredWords.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % unmasteredWords.length)
    setFlipped(false)
  }, [unmasteredWords.length])

  const handlePrev = useCallback(() => {
    if (unmasteredWords.length <= 1) return
    setCurrentIndex((prev) =>
      prev === 0 ? unmasteredWords.length - 1 : prev - 1
    )
    setFlipped(false)
  }, [unmasteredWords.length])

  const handleMastered = useCallback(async () => {
    const word = unmasteredWords[currentIndex] ?? unmasteredWords[0]
    if (!word) return

    await fetch(`/api/words/${word.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mastered: true }),
    })

    const updated = words.map((w) =>
      w.id === word.id ? { ...w, mastered: true } : w
    )
    setWords(updated)
    setFlipped(false)

    const newUnmastered = updated.filter((w) => !w.mastered)
    if (newUnmastered.length === 0) setAllDone(true)
    else setCurrentIndex(0)
  }, [unmasteredWords, currentIndex, words])

  useKeyboard({
    onFlip: handleFlip,
    onNext: handleNext,
    onPrev: handlePrev,
    onMastered: handleMastered,
  })

  // Reset flipped state when current word changes
  useEffect(() => {
    setFlipped(false)
  }, [currentIndex])

  if (loading) return <Skeleton />

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">今日暂无单词</h1>
        <p className="text-gray-400 text-sm mb-6">去添加一些单词开始学习吧</p>
        <Link
          href="/manage"
          className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-medium active:scale-95 transition-transform"
        >
          去添加单词
        </Link>
      </div>
    )
  }

  if (allDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">今日完成！</h1>
        <p className="text-gray-500 mb-6">你已掌握全部 {words.length} 个单词</p>
        <button
          onClick={() => {
            const resetAll = words.map((w) => ({ ...w, mastered: false }))
            setWords(resetAll)
            setCurrentIndex(0)
            setAllDone(false)
            resetAll.forEach((w) => {
              fetch(`/api/words/${w.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mastered: false }),
              })
            })
          }}
          className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-medium active:scale-95 transition-transform"
        >
          重新复习
        </button>
      </div>
    )
  }

  const currentWord = unmasteredWords[currentIndex] ?? unmasteredWords[0]

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">今日单词</h1>
          <p className="text-gray-400 text-sm mt-1">
            {today} · 剩余 {unmasteredWords.length} 个
          </p>
        </div>
        <Link
          href="/manage"
          className="text-sm text-indigo-500 font-medium px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors mt-1"
        >
          管理
        </Link>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex items-center justify-center">
        <WordCard
          word={currentWord}
          key={currentWord.id}
          flipped={flipped}
          onFlip={handleFlip}
        />
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-300 mt-3">
        空格翻转 · 方向键切换 · Enter 已掌握
      </p>

      {/* Buttons */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleNext}
          disabled={unmasteredWords.length <= 1}
          className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-medium text-base shadow-sm active:scale-95 transition-transform disabled:opacity-40"
        >
          下一个
        </button>
        <button
          onClick={handleMastered}
          className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-medium text-base shadow-sm active:scale-95 transition-transform"
        >
          已掌握 ✓
        </button>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <Progress mastered={masteredCount} total={words.length} />
      </div>
    </div>
  )
}
