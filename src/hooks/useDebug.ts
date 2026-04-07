import { useCallback } from 'react'

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

interface DebugOptions {
  level?: LogLevel
  tag?: string
}

export function useDebug() {
  const isDevelopment = import.meta.env.DEV

  const debug = useCallback(
    (message: string, data?: unknown, options?: DebugOptions) => {
      if (!isDevelopment) return

      const { level = 'log', tag = 'DEBUG' } = options || {}
      const prefix = options?.tag ? `[${tag}]` : ''

      switch (level) {
        case 'warn':
          console.warn(`${prefix} ${message}`, data ?? '')
          break
        case 'error':
          console.error(`${prefix} ${message}`, data ?? '')
          break
        case 'info':
          console.info(`${prefix} ${message}`, data ?? '')
          break
        case 'debug':
          console.debug(`${prefix} ${message}`, data ?? '')
          break
        default:
          console.log(`${prefix} ${message}`, data ?? '')
      }
    },
    [isDevelopment]
  )

  const apiLog = useCallback(
    (method: string, url: string, data?: unknown) => {
      if (!isDevelopment) return
      console.log(`[API] ${method}: ${url}`, data ?? '')
    },
    [isDevelopment]
  )

  return {
    debug,
    apiLog,
    isDevelopment,
  }
}

export default useDebug
