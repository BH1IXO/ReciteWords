'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import WordCard from '@/components/WordCard'
import Progress from '@/components/Progress'
import Skeleton from '@/components/Skeleton'
import { useKeyboard } from '@/hooks/useKeyboard'

type Mode = 'new' | 'review'

interface Word {
  id: number
  english: string
  chinese: string
  phonetic: string | null
  mastered: boolean
  studyDate: string
  level: number
  reviewAt: string | null
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('new')
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allDone, setAllDone] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const loadWords = useCallback((m: Mode) => {
    setLoading(true)
    setAllDone(false)
    setCurrentIndex(0)
    setFlipped(false)
    fetch(`/api/words?mode=${m}`)
      .then((r) => r.json())
      .then((data: Word[]) => {
        setWords(data)
        if (data.length > 0 && data.every((w) => w.mastered)) setAllDone(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => { loadWords(mode) }, [mode, loadWords])

  const unmasteredWords = words.filter((w) => !w.mastered)
  const masteredCount = words.filter((w) => w.mastered).length

  const handleFlip = useCallback(() => {
    const word = unmasteredWords[currentIndex] ?? unmasteredWords[0]
    if (!word) return
    setFlipped((f) => {
      if (!f) {
        fetch(`/api/words/${word.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'flip' }),
        })
      }
      return !f
    })
  }, [unmasteredWords, currentIndex])

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

  useKeyboard({ onFlip: handleFlip, onNext: handleNext, onPrev: handlePrev, onMastered: handleMastered })

  useEffect(() => { setFlipped(false) }, [currentIndex])

  const switchMode = (m: Mode) => {
    if (m === mode) return
    setMode(m)
  }

  if (loading) return <Skeleton />

  const currentWord = unmasteredWords[currentIndex] ?? unmasteredWords[0]

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">今日单词</h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
        </div>
        <div className="flex gap-2 mt-1">
          <Link
            href="/stats"
            className="text-sm text-indigo-500 font-medium px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            统计
          </Link>
          <Link
            href="/manage"
            className="text-sm text-indigo-500 font-medium px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            管理
          </Link>
        </div>
      </div>

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        {(['new', 'review'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-400'
            }`}
          >
            {m === 'new' ? '新学' : '复习'}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {words.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 px-6">
          <div className="text-5xl mb-4">{mode === 'new' ? '📚' : '✅'}</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            {mode === 'new' ? '今日暂无新单词' : '暂无需要复习的单词'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {mode === 'new' ? '去管理页添加单词吧' : '继续学习新单词，到期会自动加入复习'}
          </p>
          {mode === 'new' && (
            <Link
              href="/manage"
              className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-medium active:scale-95 transition-transform"
            >
              去添加单词
            </Link>
          )}
        </div>
      )}

      {/* All done state */}
      {allDone && words.length > 0 && (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'new' ? '今日新学完成！' : '复习完成！'}
          </h2>
          <p className="text-gray-500 mb-6">共 {words.length} 个单词</p>
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
            再来一遍
          </button>
        </div>
      )}

      {/* Card + buttons */}
      {!allDone && words.length > 0 && currentWord && (
        <>
          <div className="flex-1 flex items-center justify-center">
            <WordCard
              word={currentWord}
              key={currentWord.id}
              flipped={flipped}
              onFlip={handleFlip}
              showLevel={mode === 'review'}
            />
          </div>

          <p className="text-center text-xs text-gray-300 mt-3">
            空格翻转 · 方向键切换 · Enter 已掌握
          </p>

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

          <div className="mt-4">
            <Progress mastered={masteredCount} total={words.length} />
          </div>
        </>
      )}
    </div>
  )
}
