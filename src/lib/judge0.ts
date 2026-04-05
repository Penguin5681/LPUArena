import { getToken } from './auth'
import { trackApiCall } from './apiTracker'

const BASE = import.meta.env.VITE_API_BASE_URL as string

// ── Language config ────────────────────────────────────────────
export const JUDGE0_LANG_ID: Record<string, number> = {
  cpp:    54,
  java:   62,
  python: 71,
}

// ── Types ──────────────────────────────────────────────────────
export interface SubmitPayload {
  source_code:     string
  language_id:     number
  stdin:           string
  expected_output: string
  cpu_time_limit:  number
  memory_limit:    number
}

export interface Judge0Status {
  id:          number
  description: string
}

export interface Judge0Result {
  token:          string
  status:         Judge0Status
  stdout:         string | null
  stderr:         string | null
  compile_output: string | null
  message:        string | null
  time:           string | null
  memory:         number | null
  exit_code:      number | null
}

export interface SubmitResponse {
  message: string
  result:  Judge0Result
}

// ── Safe code preparation ──────────────────────────────────────
// Ensures code is safe to JSON-encode without breaking language grammar.
export function prepareCode(code: string, lang: string): string {
  if (lang === 'cpp') {
    // Ensure every #include line ends with a newline and is not merged
    return code
      .replace(/(#include\s*<[^>]+>)\s*/g, '$1\n')
      .replace(/(#include\s*"[^"]+?")\s*/g, '$1\n')
  }

  if (lang === 'java') {
    // Java class must be named Main for Judge0
    return code.replace(/public\s+class\s+\w+/, 'public class Main')
  }

  // Python: preserve as-is — indentation is syntax
  return code
}

// ── API call ───────────────────────────────────────────────────
export async function apiSubmit(payload: SubmitPayload): Promise<SubmitResponse> {
  const token = getToken()
  const res = await fetch(`${BASE}/api/judge0/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))

  // track after fetch — fire-and-forget
  trackApiCall('/api/judge0/submit', 'POST', res.status)

  if (!res.ok) throw new Error(data?.message ?? `Submission failed (${res.status})`)
  return data as SubmitResponse
}

// ── Status helpers ─────────────────────────────────────────────
export type Verdict = 'accepted' | 'wrong' | 'error' | 'running'

export function getVerdict(status: Judge0Status): Verdict {
  const id = status.id
  if (id === 3)              return 'accepted'
  if (id === 4)              return 'wrong'
  if (id >= 5 && id <= 12)  return 'error'
  return 'running'
}
