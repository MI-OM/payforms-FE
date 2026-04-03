import { apiClient, ApiError, AuthorizationError, ForbiddenError } from '@/lib/apiClient'
import { useAuth } from '@/contexts/AuthContext'
import { checkOwnership, getUserOrganizationId, type ResourceOwnership } from '@/lib/authorization'

export interface SecurityConfig {
  requireAuth?: boolean
  requireRole?: 'ADMIN' | 'STAFF' | 'CONTACT'
  validateOwnership?: boolean
  ownershipField?: 'organization_id' | 'org_id' | 'owner_id'
}

const DEFAULT_CONFIG: SecurityConfig = {
  requireAuth: true,
  requireRole: undefined,
  validateOwnership: false,
}

export function createSecureApiClient(config: SecurityConfig = DEFAULT_CONFIG) {
  const { requireAuth: reqAuth, requireRole, validateOwnership, ownershipField } = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  return {
    get: async <T extends ResourceOwnership>(
      endpoint: string,
      options?: { params?: Record<string, string | number | boolean | undefined> }
    ): Promise<T> => {
      const result = await apiClient.get<T>(endpoint, options)
      
      if (validateOwnership && reqAuth) {
        const user = getCurrentUser()
        if (user && !checkOwnership(result, user)) {
          throw new AuthorizationError('You do not have permission to access this resource')
        }
      }
      
      return result
    },

    post: <T>(endpoint: string, data?: unknown, options?: Record<string, unknown>) =>
      apiClient.post<T>(endpoint, data, options),

    patch: <T>(endpoint: string, data?: unknown, options?: Record<string, unknown>) =>
      apiClient.patch<T>(endpoint, data, options),

    delete: <T>(endpoint: string, options?: Record<string, unknown>) =>
      apiClient.delete<T>(endpoint, options),
  }
}

let currentUser: { id: string; role: string; organization_id: string } | null = null

export function setCurrentUser(user: typeof currentUser) {
  currentUser = user
}

export function getCurrentUser() {
  return currentUser
}

export function useSecureApi() {
  const { user } = useAuth()
  
  if (user) {
    setCurrentUser(user)
  }

  const getSecure = async <T extends ResourceOwnership>(
    endpoint: string,
    options?: { params?: Record<string, string | number | boolean | undefined> }
  ): Promise<T> => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    return apiClient.get<T>(endpoint, options)
  }

  const postSecure = <T>(endpoint: string, data?: unknown) => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    return apiClient.post<T>(endpoint, data)
  }

  const patchSecure = <T>(endpoint: string, data?: unknown) => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    return apiClient.patch<T>(endpoint, data)
  }

  const deleteSecure = <T>(endpoint: string) => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    return apiClient.delete<T>(endpoint)
  }

  return {
    get: getSecure,
    post: postSecure,
    patch: patchSecure,
    delete: deleteSecure,
  }
}

export function validateApiResponse<T>(
  response: T,
  expectedOrganizationId?: string
): T {
  if (!response) {
    throw new AuthorizationError('Invalid response from server')
  }

  if (expectedOrganizationId) {
    const responseOrgId = (response as ResourceOwnership)?.organization_id || 
                          (response as ResourceOwnership)?.org_id
    
    if (responseOrgId && responseOrgId !== expectedOrganizationId) {
      throw new AuthorizationError('Resource does not belong to your organization')
    }
  }

  return response
}

export async function handleApiError(error: unknown): Promise<never> {
  if (error instanceof ForbiddenError) {
    throw error
  }
  
  if (error instanceof AuthorizationError) {
    throw error
  }
  
  if (error instanceof ApiError) {
    if (error.status === 403) {
      throw new ForbiddenError('You do not have permission to perform this action')
    }
    if (error.status === 401) {
      throw new AuthorizationError('Session expired. Please log in again.')
    }
    throw error
  }
  
  throw new ApiError(0, 'An unexpected error occurred', error)
}
