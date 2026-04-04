import { getToken } from './auth'

const BASE      = import.meta.env.VITE_API_BASE_URL as string
const CACHE_KEY = 'aa_questions_cache'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Example  { input: string; output: string }

export interface Question {
  id: string
  title: string
  slug: string
  description: string
  topic: string
  difficulty: Difficulty
  constraints: string[]
  examples: Example[]
  hints: string[]
  time_complexity: string
  space_complexity: string
  created_at: string
  updated_at: string
}

interface CacheEntry { ts: number; data: Question[] }

function readCache(): Question[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null }
    return entry.data
  } catch { return null }
}

function writeCache(data: Question[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })) } catch { /* quota */ }
}

export function clearQuestionsCache() { localStorage.removeItem(CACHE_KEY) }

export async function apiGetAllQuestions(): Promise<Question[]> {
  const cached = readCache()
  if (cached) return cached

  const token = getToken()
  const res = await fetch(`${BASE}/api/questions/all`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message ?? `Failed (${res.status})`)

  const data: Question[] = json.data ?? json
  writeCache(data)
  return data
}
