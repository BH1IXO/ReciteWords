'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Word {
  id: number
  english: string
  chinese: string
  phonetic: string | null
  studyDate: string
}

interface EditState {
  id: number
  english: string
  chinese: string
  phonetic: string
}

export default function ManagePage() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [form, setForm] = useState({ english: '', chinese: '', phonetic: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch(`/api/words?date=${today}`)
      .then((r) => r.json())
      .then((data: Word[]) => {
        setWords(data)
        setLoading(false)
      })
  }, [today])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.english.trim() || !form.chinese.trim()) {
      setError('英文和中文为必填项')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        english: form.english.trim(),
        chinese: form.chinese.trim(),
        phonetic: form.phonetic.trim() || null,
      }),
    })
    const newWord: Word = await res.json()
    setWords((prev) => [...prev, newWord])
    setForm({ english: '', chinese: '', phonetic: '' })
    setSubmitting(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除这个单词？')) return
    await fetch(`/api/words/${id}`, { method: 'DELETE' })
    setWords((prev) => prev.filter((w) => w.id !== id))
  }

  const handleEditSave = async () => {
    if (!editState) return
    if (!editState.english.trim() || !editState.chinese.trim()) return
    const res = await fetch(`/api/words/${editState.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        english: editState.english.trim(),
        chinese: editState.chinese.trim(),
        phonetic: editState.phonetic.trim() || null,
      }),
    })
    const updated: Word = await res.json()
    setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
    setEditState(null)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">单词管理</h1>
          <p className="text-gray-400 text-sm mt-1">{today} · 共 {words.length} 个</p>
        </div>
        <Link
          href="/"
          className="text-sm text-indigo-500 font-medium px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
        >
          返回学习
        </Link>
      </div>

      {/* Word List */}
      <div className="space-y-2 mb-8">
        {loading ? (
          <div className="text-center text-gray-400 py-10">加载中...</div>
        ) : words.length === 0 ? (
          <div className="text-center text-gray-400 py-10">还没有单词，在下方添加吧</div>
        ) : (
          words.map((word) =>
            editState?.id === word.id ? (
              // Inline edit row
              <div key={word.id} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 space-y-2">
                <input
                  className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={editState.english}
                  onChange={(e) => setEditState({ ...editState, english: e.target.value })}
                  placeholder="英文"
                />
                <input
                  className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={editState.chinese}
                  onChange={(e) => setEditState({ ...editState, chinese: e.target.value })}
                  placeholder="中文"
                />
                <input
                  className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={editState.phonetic}
                  onChange={(e) => setEditState({ ...editState, phonetic: e.target.value })}
                  placeholder="音标（选填）"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditSave}
                    className="flex-1 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditState(null)}
                    className="flex-1 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-sm"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // Normal row
              <div
                key={word.id}
                className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{word.english}</p>
                  <p className="text-sm text-gray-500 truncate">{word.chinese}</p>
                  {word.phonetic && (
                    <p className="text-xs text-gray-400">{word.phonetic}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-3 shrink-0">
                  <button
                    onClick={() =>
                      setEditState({
                        id: word.id,
                        english: word.english,
                        chinese: word.chinese,
                        phonetic: word.phonetic ?? '',
                      })
                    }
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className="text-xs px-3 py-1.5 border border-red-100 rounded-xl text-red-400 hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">添加单词</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="英文 *"
            value={form.english}
            onChange={(e) => setForm({ ...form, english: e.target.value })}
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="中文 *"
            value={form.chinese}
            onChange={(e) => setForm({ ...form, chinese: e.target.value })}
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="音标（选填）"
            value={form.phonetic}
            onChange={(e) => setForm({ ...form, phonetic: e.target.value })}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {submitting ? '添加中...' : '添加单词'}
          </button>
        </form>
      </div>
    </div>
  )
}
