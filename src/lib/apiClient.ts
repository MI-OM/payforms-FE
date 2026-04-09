import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'
import { AuthorizationError, ForbiddenError } from './authorization'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const isDevelopment = import.meta.env.DEV

const debug = {
  log: (message: string, data?: unknown) => {
    if (!isDevelopment) return
    console.log(message, data ?? '')
  },
  error: (message: string, data?: unknown) => {
    if (!isDevelopment) return
    console.error(message, data ?? '')
  },
}

export { AuthorizationError, ForbiddenError }

function sanitizeErrorMessage(message: unknown): string {
  if (!message) return 'An error occurred'
  
  // Handle array of errors (e.g., validation errors)
  if (Array.isArray(message)) {
    return message.join(', ')
  }
  
  // Handle object errors
  if (typeof message === 'object') {
    const msg = (message as any).message || (message as any).error || JSON.stringify(message)
    return typeof msg === 'string' ? msg : 'An error occurred'
  }
  
  // Ensure it's a string
  if (typeof message !== 'string') {
    return 'An error occurred'
  }
  
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
    debug.log('[API] Request:', { method: options.method || 'GET', url, params, headers })
     
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    })

    debug.log('[API] Response:', { status: response.status, statusText: response.statusText, url })

    if (response.status === 401) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
            credentials: 'include',
          })

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            setTokens(refreshData.access_token, refreshData.refresh_token || refreshToken)
            ;(headers as Record<string, string>)['Authorization'] = `Bearer ${refreshData.access_token}`
            
            const retryResponse = await fetch(url, {
              ...fetchOptions,
              headers,
              credentials: 'include',
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
      let message = 'Request failed'
      let errorData: any = {}
      
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json()
          debug.log('[API] Error response data:', errorData)
          message = errorData.message || errorData.error || errorData.detail || `Server error (${response.status})`
        } catch {
          message = `Server error (${response.status})`
        }
      } else {
        message = `Server error (${response.status})`
      }
      
      debug.log('[API] Throwing error with:', { status: response.status, message, errorData })
      throw new ApiError(response.status, sanitizeErrorMessage(message), { ...errorData, status: response.status })
    }

    if (response.status === 204) {
      return undefined as T
    }

    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      return undefined as T
    }

    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      debug.error('[API] JSON parse error:', { responseText: responseText.substring(0, 500) })
      throw new ApiError(response.status, `Invalid JSON response from server: ${responseText.substring(0, 100)}`, responseText)
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'Cannot connect to server. Please check your internet connection.', error)
    }
    debug.error('[API] Unexpected error:', error)
    throw new ApiError(0, sanitizeErrorMessage('An unexpected error occurred'), error)
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

  delete: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }),
}

export default apiClient
