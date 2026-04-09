'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Word {
  id: number
  english: string
  chinese: string
  phonetic: string | null
  studyDate: string
  level: number
  reviewAt: string | null
}

interface EditState {
  id: number
  english: string
  chinese: string
  phonetic: string
}

interface StudyLog {
  id: number
  action: string
  createdAt: string
}

const LEVEL_LABELS = ['生疏', '初识', '熟悉', '掌握', '精通']
const ACTION_LABELS: Record<string, string> = {
  mastered: '✓ 标记已掌握',
  flip: '↩ 翻看释义',
  skip: '→ 跳过',
}

export default function ManagePage() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [form, setForm] = useState({ english: '', chinese: '', phonetic: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [importMsg, setImportMsg] = useState('')

  // Drawer state
  const [drawerWord, setDrawerWord] = useState<Word | null>(null)
  const [drawerLogs, setDrawerLogs] = useState<StudyLog[]>([])
  const [drawerLoading, setDrawerLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch('/api/words?mode=all')
      .then((r) => r.json())
      .then((data: Word[]) => {
        setWords(data)
        setLoading(false)
      })
  }, [])

  const openDrawer = async (word: Word) => {
    setDrawerWord(word)
    setDrawerLogs([])
    setDrawerLoading(true)
    const logs: StudyLog[] = await fetch(`/api/words/${word.id}/logs`).then((r) => r.json())
    setDrawerLogs(logs)
    setDrawerLoading(false)
  }

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
    if (drawerWord?.id === id) setDrawerWord(null)
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

  // CSV export
  const handleExport = () => {
    const rows = [
      'english,chinese,phonetic',
      ...words.map((w) =>
        [w.english, w.chinese, w.phonetic ?? '']
          .map((v) => `"${v.replace(/"/g, '""')}"`)
          .join(',')
      ),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `words-${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSV import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportMsg('')
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    const existingEnglish = new Set(words.map((w) => w.english.toLowerCase()))
    let added = 0
    let skipped = 0

    for (const line of lines) {
      const cols = line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g) ?? []
      const parse = (s: string) => s.replace(/^"|"$/g, '').replace(/""/g, '"').replace(/,$/, '').trim()
      const [english, chinese, phonetic] = cols.map(parse)
      if (!english || !chinese) continue
      if (existingEnglish.has(english.toLowerCase())) { skipped++; continue }

      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english, chinese, phonetic: phonetic || null }),
      })
      const newWord: Word = await res.json()
      setWords((prev) => [...prev, newWord])
      existingEnglish.add(english.toLowerCase())
      added++
    }

    setImportMsg(`导入完成：新增 ${added} 个，跳过 ${skipped} 个重复`)
    e.target.value = ''
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">单词管理</h1>
          <p className="text-gray-400 text-sm mt-1">共 {words.length} 个</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/stats"
            className="text-sm text-indigo-500 font-medium px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            统计
          </Link>
          <Link
            href="/"
            className="text-sm text-indigo-500 font-medium px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            返回
          </Link>
        </div>
      </div>

      {/* CSV actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleExport}
          className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
        >
          导出 CSV
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
        >
          导入 CSV
        </button>
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
      </div>
      {importMsg && <p className="text-xs text-indigo-500 mb-3">{importMsg}</p>}

      {/* Word List */}
      <div className="space-y-2 mb-8">
        {loading ? (
          <div className="text-center text-gray-400 py-10">加载中...</div>
        ) : words.length === 0 ? (
          <div className="text-center text-gray-400 py-10">还没有单词，在下方添加吧</div>
        ) : (
          words.map((word) =>
            editState?.id === word.id ? (
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
                  <button onClick={handleEditSave} className="flex-1 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium">保存</button>
                  <button onClick={() => setEditState(null)} className="flex-1 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-sm">取消</button>
                </div>
              </div>
            ) : (
              <div key={word.id} className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => openDrawer(word)}
                >
                  <p className="font-semibold text-gray-800 truncate hover:text-indigo-600 transition-colors">{word.english}</p>
                  <p className="text-sm text-gray-500 truncate">{word.chinese}</p>
                  {word.phonetic && <p className="text-xs text-gray-400">{word.phonetic}</p>}
                </button>
                <div className="flex gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => setEditState({ id: word.id, english: word.english, chinese: word.chinese, phonetic: word.phonetic ?? '' })}
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

      {/* Drawer overlay */}
      {drawerWord && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerWord(null)}
          />
          <div className="relative w-80 max-w-full bg-white h-full shadow-xl flex flex-col animate-slide-in">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{drawerWord.english}</h2>
                <p className="text-sm text-gray-500">{drawerWord.chinese}</p>
                {drawerWord.phonetic && <p className="text-xs text-gray-400 mt-0.5">{drawerWord.phonetic}</p>}
              </div>
              <button onClick={() => setDrawerWord(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">×</button>
            </div>

            <div className="p-5 border-b border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">掌握程度</span>
                <span className="font-medium text-indigo-600">{LEVEL_LABELS[drawerWord.level]}（Lv.{drawerWord.level}）</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">下次复习</span>
                <span className="font-medium text-gray-700">
                  {drawerWord.reviewAt
                    ? new Date(drawerWord.reviewAt).toLocaleDateString('zh-CN')
                    : '尚未开始'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">学习记录</h3>
              {drawerLoading ? (
                <p className="text-sm text-gray-400">加载中...</p>
              ) : drawerLogs.length === 0 ? (
                <p className="text-sm text-gray-400">暂无记录</p>
              ) : (
                <div className="space-y-2">
                  {drawerLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{ACTION_LABELS[log.action] ?? log.action}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString('zh-CN', {
                          month: 'numeric', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
