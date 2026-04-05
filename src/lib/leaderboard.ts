import { getToken } from './auth'
import { trackApiCall } from './apiTracker'

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
    // track after fetch — fire-and-forget
    trackApiCall('/api/leaderboard/events', 'POST', res.status)
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
    // track after fetch — fire-and-forget
    trackApiCall('/api/leaderboard/submissions', 'POST', res.status)
    return res.ok ? (await res.json()) as SubmissionResponse : null
  } catch {
    return null
  }
}

// ── Deductions ─────────────────────────────────────────────────

export interface Deduction {
  source:         'event' | 'submission'
  pointsDeducted: number
  reason:         string
  occurredAt:     string
  // event fields
  eventType?:     string
  metadata?:      Record<string, unknown>
  // submission fields
  submissionId?:  string
  questionId?:    number
  verdict?:       string
}

export interface DeductionsResponse {
  total: number
  data:  Deduction[]
}

export async function getMyDeductions(limit = 50): Promise<DeductionsResponse | null> {
  try {
    const token = getToken()
    if (!token) return null
    const res = await fetch(`${BASE}/api/leaderboard/deductions?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    trackApiCall('/api/leaderboard/deductions', 'GET', res.status)
    return res.ok ? (await res.json()) as DeductionsResponse : null
  } catch {
    return null
  }
}

// ── Heartbeat ──────────────────────────────────────────────────

export interface HeartbeatResponse {
  message:       string
  userId:        number
  lastSeenAt:    string
  activeUsers:   number
  windowSeconds: number
}

export async function sendHeartbeat(
  page: string,
  tabVisible: boolean,
): Promise<HeartbeatResponse | null> {
  try {
    const token = getToken()
    if (!token) return null
    const res = await fetch(`${BASE}/api/activity/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ metadata: { page, tabVisible } }),
    })
    trackApiCall('/api/activity/heartbeat', 'POST', res.status)
    return res.ok ? (await res.json()) as HeartbeatResponse : null
  } catch {
    return null
  }
}
