import { getToken } from './auth'

const BASE = import.meta.env.VITE_API_BASE_URL as string

export type EventType = 'out_of_focus' | 'copy_paste' | 'fullscreen_exit'

export interface EventPayload {
  eventType: EventType
  metadata?: Record<string, unknown>
}

export interface EventResponse {
  message:      string
  eventType:    EventType
  penaltyPoints: number
}

export interface SubmissionPayload {
  questionId:  number
  languageId:  number
  sourceCode:  string
  verdict:     string
  isCorrect:   boolean
}

export interface SubmissionResponse {
  message:                  string
  submissionId:             string
  penaltyPoints:            number
  illegalInjectionDetected: boolean
}

// fire-and-forget — never throws, never blocks UI
export async function logEvent(payload: EventPayload): Promise<EventResponse | null> {
  try {
    const token = getToken()
    if (!token) return null
    const res = await fetch(`${BASE}/api/leaderboard/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    return res.ok ? (await res.json()) as EventResponse : null
  } catch {
    return null
  }
}

export async function logSubmission(payload: SubmissionPayload): Promise<SubmissionResponse | null> {
  try {
    const token = getToken()
    if (!token) return null
    const res = await fetch(`${BASE}/api/leaderboard/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    return res.ok ? (await res.json()) as SubmissionResponse : null
  } catch {
    return null
  }
}
