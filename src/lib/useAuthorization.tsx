import { useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  checkOwnership, 
  assertOwnership, 
  canPerformAction,
  type Permission,
  type ResourceOwnership 
} from '@/lib/authorization'
import { AuthorizationError, ForbiddenError } from '@/lib/apiClient'

export function useAuthorization() {
  const { user } = useAuth()

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user])
  const isStaff = useMemo(() => user?.role === 'ADMIN' || user?.role === 'STAFF', [user])
  const isContact = useMemo(() => user?.role === 'CONTACT', [user])

  const getOrganizationId = useCallback((): string | null => {
    return user?.organization_id || null
  }, [user])

  const checkResourceOwnership = useCallback((
    resource: ResourceOwnership | null | undefined
  ): boolean => {
    return checkOwnership(resource, user)
  }, [user])

  const requireOwnership = useCallback((
    resource: ResourceOwnership | null | undefined,
    resourceType?: string,
    resourceId?: string
  ): void => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    assertOwnership(resource, user, resourceType, resourceId)
  }, [user])

  const requireRole = useCallback((
    requiredRole: 'ADMIN' | 'STAFF' | 'CONTACT'
  ): void => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }

    const roleHierarchy: Record<string, number> = { ADMIN: 3, STAFF: 2, CONTACT: 1 }
    const userLevel = roleHierarchy[user.role] || 0
    const requiredLevel = roleHierarchy[requiredRole]

    if (userLevel < requiredLevel) {
      throw new ForbiddenError(`This action requires ${requiredRole} privileges`)
    }
  }, [user])

  const canAccess = useCallback((
    action: Permission,
    resourceOwnerId?: string | null
  ): boolean => {
    return canPerformAction(user?.role || null, action, resourceOwnerId, user?.id)
  }, [user])

  const requirePermission = useCallback((
    action: Permission,
    resourceOwnerId?: string | null
  ): void => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }

    if (!canPerformAction(user.role, action, resourceOwnerId, user.id)) {
      throw new ForbiddenError('You do not have permission to perform this action')
    }
  }, [user])

  const validateOrganizationAccess = useCallback((
    resourceOrganizationId: string | null | undefined
  ): boolean => {
    if (!user || !resourceOrganizationId) return false
    return user.organization_id === resourceOrganizationId
  }, [user])

  const requireOrganizationAccess = useCallback((
    resourceOrganizationId: string | null | undefined,
    resourceType?: string
  ): void => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    
    if (!validateOrganizationAccess(resourceOrganizationId)) {
      throw new AuthorizationError(
        `Access denied to ${resourceType || 'resource'}`,
        resourceType
      )
    }
  }, [user, validateOrganizationAccess])

  return {
    user,
    isAdmin,
    isStaff,
    isContact,
    getOrganizationId,
    checkResourceOwnership,
    requireOwnership,
    requireRole,
    canAccess,
    requirePermission,
    validateOrganizationAccess,
    requireOrganizationAccess
  }
}

export function withAuthorization<T extends ResourceOwnership>(
  resourcePromise: Promise<T>,
  user: ReturnType<typeof useAuthorization>['user'],
  resourceType: string
): Promise<T> {
  return resourcePromise.then(resource => {
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    assertOwnership(resource, user, resourceType)
    return resource
  })
}

export async function filterAccessibleResources<T extends ResourceOwnership>(
  resourcesPromise: Promise<T[]>,
  user: ReturnType<typeof useAuthorization>['user']
): Promise<T[]> {
  const resources = await resourcesPromise
  
  if (!user) {
    throw new AuthorizationError('Authentication required')
  }
  
  return resources.filter(resource => checkOwnership(resource, user))
}
