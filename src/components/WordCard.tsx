'use client'

interface Word {
  id: number
  english: string
  chinese: string
  phonetic: string | null
}

interface WordCardProps {
  word: Word
  flipped: boolean
  onFlip: () => void
}

export default function WordCard({ word, flipped, onFlip }: WordCardProps) {
  return (
    <div
      className="card-flip w-full cursor-pointer select-none"
      style={{ height: '320px' }}
      onClick={onFlip}
    >
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front: English */}
        <div className="card-front bg-white rounded-3xl shadow-md flex flex-col items-center justify-center p-8">
          <div className="text-xs font-medium text-indigo-400 tracking-widest uppercase mb-6">
            点击查看释义
          </div>
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-3">
            {word.english}
          </h2>
          {word.phonetic && (
            <p className="text-gray-400 text-lg">{word.phonetic}</p>
          )}
        </div>

        {/* Back: Chinese */}
        <div className="card-back bg-indigo-500 rounded-3xl shadow-md flex flex-col items-center justify-center p-8">
          <div className="text-xs font-medium text-indigo-200 tracking-widest uppercase mb-6">
            中文释义
          </div>
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            {word.chinese}
          </h2>
          <p className="text-indigo-200 text-xl font-medium">{word.english}</p>
          {word.phonetic && (
            <p className="text-indigo-300 text-base mt-2">{word.phonetic}</p>
          )}
        </div>
      </div>
    </div>
  )
}
