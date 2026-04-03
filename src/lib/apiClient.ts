import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'
import { AuthorizationError, ForbiddenError } from './authorization'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export { AuthorizationError, ForbiddenError }

function sanitizeErrorMessage(message: string): string {
  if (!message) return 'An error occurred'
  
  let sanitized = message
  
  sanitized = sanitized.replace(/https?:\/\/[^\s"'<>]+/gi, '[URL removed]')
  
  sanitized = sanitized.replace(/\/[a-zA-Z0-9_\-\/\.]+/gi, (match) => {
    if (match.startsWith('/api/') || match.startsWith('/auth/') || match.startsWith('/v1/')) {
      return '[endpoint removed]'
    }
    return match
  })
  
  sanitized = sanitized.replace(/C:\\[^\s"'<>]+|'\/[^\s"'<>]+'/gi, '[path removed]')
  
  sanitized = sanitized.replace(/at\s+[a-zA-Z$_\.]+\s*[\(<][^>]+>/gi, '[stack trace removed]')
  
  const sensitivePatterns = [
    /token["']?\s*[:=]\s*["']?[a-zA-Z0-9_\-]+\.?[a-zA-Z0-9_\-]*["']?/gi,
    /password["']?\s*[:=]\s*["']?[^\s"'<>]+["']?/gi,
    /secret["']?\s*[:=]\s*["']?[^\s"'<>]+["']?/gi,
    /key["']?\s*[:=]\s*["']?[^\s"'<>]+["']?/gi,
  ]
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[sensitive data removed]')
  })
  
  return sanitized
}

export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_BASE_URL}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const accessToken = getAccessToken()
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (response.status === 401) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          })

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            setTokens(refreshData.access_token, refreshData.refresh_token || refreshToken)
            ;(headers as Record<string, string>)['Authorization'] = `Bearer ${refreshData.access_token}`
            
            const retryResponse = await fetch(url, {
              ...fetchOptions,
              headers,
            })

            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}))
              throw new ApiError(retryResponse.status, errorData.message || 'Request failed', errorData)
            }

            return retryResponse.json()
          }
        } catch {
          clearTokens()
          window.location.href = '/login'
        }
      }
      clearTokens()
      window.location.href = '/login'
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}))
      throw new ForbiddenError(
        sanitizeErrorMessage(errorData.message || 'You do not have permission to access this resource')
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.message || 'Request failed'
      throw new ApiError(response.status, sanitizeErrorMessage(message), errorData)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, sanitizeErrorMessage('Network error. Please check your connection.'), error)
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}

export default apiClient
