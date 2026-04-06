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

export interface SubmitJob {
  id:        number
  status:    string
  createdAt: string
}

export interface SubmitResponse {
  message: string
  job:     SubmitJob
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

export interface JobStatusResponse {
  job: {
    id:           number
    status:       'queued' | 'processing' | 'completed' | 'failed'
    attemptCount: number
    maxAttempts:  number
    runAfter:     string
    startedAt:    string | null
    finishedAt:   string | null
    createdAt:    string
    updatedAt:    string
    error:        string | null
    result:       Judge0Result | null
  }
}

// ── Safe code preparation ──────────────────────────────────────
export function prepareCode(code: string, lang: string): string {
  if (lang === 'cpp') {
    return code
      .replace(/(#include\s*<[^>]+>)\s*/g, '$1\n')
      .replace(/(#include\s*"[^"]+?")\s*/g, '$1\n')
  }
  if (lang === 'java') {
    return code.replace(/public\s+class\s+\w+/, 'public class Main')
  }
  return code
}

// ── Submit (queue job) ─────────────────────────────────────────
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
  trackApiCall('/api/judge0/submit', 'POST', res.status)

  if (!res.ok) throw new Error(data?.message ?? `Submission failed (${res.status})`)
  return data as SubmitResponse
}

// ── Poll job status ────────────────────────────────────────────
export async function apiGetJobStatus(jobId: number): Promise<JobStatusResponse> {
  const token = getToken()
  const res = await fetch(`${BASE}/api/judge0/submissions/${jobId}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })

  const data = await res.json().catch(() => ({}))
  trackApiCall(`/api/judge0/submissions/${jobId}`, 'GET', res.status)

  if (!res.ok) throw new Error(data?.message ?? `Poll failed (${res.status})`)
  return data as JobStatusResponse
}

// ── Polling strategy ───────────────────────────────────────────
// Returns interval in ms based on elapsed seconds since polling started
export function getPollInterval(elapsedMs: number): number {
  const s = elapsedMs / 1000
  if (s < 20)  return 1500
  if (s < 60)  return 3000
  if (s < 120) return 5000
  return -1 // stop polling
}

// ── Status helpers ─────────────────────────────────────────────
export type Verdict = 'accepted' | 'wrong' | 'error' | 'running'

export function getVerdict(status: Judge0Status): Verdict {
  const id = status.id
  if (id === 3)             return 'accepted'
  if (id === 4)             return 'wrong'
  if (id >= 5 && id <= 12) return 'error'
  return 'running'
}

// ── Self-contained polling runner ─────────────────────────────
// Runs outside React render — no impure function warnings.
export interface PollCallbacks {
  onStatusChange: (status: string) => void
  onResult:       (result: Judge0Result) => void
  onError:        (msg: string) => void
  onTimeout:      () => void
}

export function startPolling(jobId: number, callbacks: PollCallbacks): () => void {
  const startMs = globalThis.performance?.now() ?? globalThis.Date.now()
  let timer: ReturnType<typeof setTimeout> | null = null
  let cancelled = false

  const poll = async () => {
    if (cancelled) return

    const elapsed = (globalThis.performance?.now() ?? globalThis.Date.now()) - startMs
    const interval = getPollInterval(elapsed)

    if (interval === -1) {
      callbacks.onTimeout()
      return
    }

    try {
      const { job } = await apiGetJobStatus(jobId)

      if (cancelled) return

      if (job.status === 'completed' && job.result) {
        callbacks.onResult(job.result)
        return
      }

      if (job.status === 'failed') {
        callbacks.onError(job.error ?? 'Job failed')
        return
      }

      callbacks.onStatusChange(job.status)
      timer = setTimeout(poll, interval)

    } catch (e) {
      if (!cancelled) callbacks.onError(e instanceof Error ? e.message : 'Poll failed')
    }
  }

  // first poll after 1.5s
  timer = setTimeout(poll, 1500)

  // return cancel function
  return () => {
    cancelled = true
    if (timer) clearTimeout(timer)
  }
}
