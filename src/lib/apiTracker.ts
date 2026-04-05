/**
 * API call tracker — writes to Firestore after every API call.
 *
 * Firestore structure:
 *   api_usage/{userId}/calls/{endpoint}
 *     → { count, lastCalledAt, endpoint, userId }
 *
 * Also maintains a daily rollup:
 *   api_usage/{userId}/daily/{YYYY-MM-DD}
 *     → { total, date }
 *
 * All writes are fire-and-forget — they never throw or block the caller.
 */

import {
  doc,
  setDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { getToken } from './auth'

// ── helpers ────────────────────────────────────────────────────

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

/** Extract a stable key from a URL path, e.g. "/api/auth/signin" → "auth_signin" */
function endpointKey(path: string): string {
  return path
    .replace(/^\/api\//, '')
    .replace(/\//g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    || 'unknown'
}

/** Decode the JWT payload to get the user id without a library */
function getUserIdFromToken(): string | null {
  try {
    const token = getToken()
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    // common JWT claims for user id
    return String(payload.id ?? payload.sub ?? payload.userId ?? 'anonymous')
  } catch {
    return null
  }
}

// ── main tracker ───────────────────────────────────────────────

/**
 * Call this AFTER an API call completes (success or failure).
 * It is fully async and never throws — safe to call without await.
 */
export function trackApiCall(
  path: string,
  method: string = 'GET',
  status: number = 200,
): void {
  // Schedule as a microtask so it always runs after the caller's .then()/.catch()
  Promise.resolve().then(async () => {
    try {
      const userId = getUserIdFromToken() ?? 'anonymous'
      const key    = endpointKey(path)
      const today  = todayKey()

      // ── per-endpoint counter ──
      const endpointRef = doc(db, 'api_usage', userId, 'calls', key)
      await setDoc(endpointRef, {
        userId,
        endpoint:    path,
        method:      method.toUpperCase(),
        count:       increment(1),
        lastStatus:  status,
        lastCalledAt: serverTimestamp(),
      }, { merge: true })

      // ── daily total ──
      const dailyRef = doc(db, 'api_usage', userId, 'daily', today)
      await setDoc(dailyRef, {
        userId,
        date:  today,
        total: increment(1),
      }, { merge: true })

    } catch {
      // silently swallow — tracking must never affect the user experience
    }
  })
}
