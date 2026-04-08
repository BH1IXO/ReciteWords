import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const today = new Date().toISOString().split('T')[0]

const words = [
  { english: 'abundant', chinese: '丰富的，充裕的', phonetic: '/əˈbʌndənt/' },
  { english: 'acquaint', chinese: '使熟悉，使了解', phonetic: '/əˈkweɪnt/' },
  { english: 'ambiguous', chinese: '模糊的，不明确的', phonetic: '/æmˈbɪɡjuəs/' },
  { english: 'benevolent', chinese: '仁慈的，慈善的', phonetic: '/bəˈnevələnt/' },
  { english: 'candid', chinese: '坦率的，直白的', phonetic: '/ˈkændɪd/' },
  { english: 'coherent', chinese: '连贯的，一致的', phonetic: '/koʊˈhɪrənt/' },
  { english: 'diligent', chinese: '勤奋的，用功的', phonetic: '/ˈdɪlɪdʒənt/' },
  { english: 'eloquent', chinese: '雄辩的，有说服力的', phonetic: '/ˈeləkwənt/' },
  { english: 'fluctuate', chinese: '波动，起伏', phonetic: '/ˈflʌktʃueɪt/' },
  { english: 'genuine', chinese: '真实的，真诚的', phonetic: '/ˈdʒenjuɪn/' },
  { english: 'hypothesis', chinese: '假设，假说', phonetic: '/haɪˈpɒθəsɪs/' },
  { english: 'inevitable', chinese: '不可避免的', phonetic: '/ɪnˈevɪtəbl/' },
  { english: 'jeopardize', chinese: '危及，损害', phonetic: '/ˈdʒepədaɪz/' },
  { english: 'leverage', chinese: '杠杆作用，影响力', phonetic: '/ˈlevərɪdʒ/' },
  { english: 'meticulous', chinese: '一丝不苟的，细致的', phonetic: '/məˈtɪkjuləs/' },
]

async function main() {
  console.log('Seeding database...')

  for (const word of words) {
    await prisma.word.upsert({
      where: { id: words.indexOf(word) + 1 },
      update: {},
      create: {
        ...word,
        studyDate: today,
        mastered: false,
      },
    })
  }

  console.log(`Seeded ${words.length} words for ${today}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
