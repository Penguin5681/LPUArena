const BASE = import.meta.env.VITE_API_BASE_URL as string

export interface AuthUser {
  id: number
  name: string
  email: string
  registrationNumber: string
  createdAt: string
}

export interface AuthResponse {
  message: string
  token: string
  user: AuthUser
}

// ── token persistence ──────────────────────────────────────────
const TOKEN_KEY = 'aa_token'

export const saveToken  = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const getToken   = ()              => localStorage.getItem(TOKEN_KEY)
export const clearToken = ()              => localStorage.removeItem(TOKEN_KEY)

// ── helpers ────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`)
  }

  return data as T
}

// ── API calls ──────────────────────────────────────────────────
export async function apiSignup(payload: {
  name: string
  email: string
  registrationNumber: string
  password: string
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function apiSignin(payload: {
  email?: string
  registrationNumber?: string
  password: string
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function apiMe(): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>('/api/auth/me')
}
