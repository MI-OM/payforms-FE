export class AuthorizationError extends Error {
  readonly name = 'AuthorizationError'
  readonly resourceType?: string
  readonly resourceId?: string

  constructor(
    message: string = 'You do not have permission to access this resource',
    resourceType?: string,
    resourceId?: string
  ) {
    super(message)
    this.resourceType = resourceType
    this.resourceId = resourceId
  }
}

export class ForbiddenError extends Error {
  readonly status = 403
  readonly name = 'ForbiddenError'

  constructor(message: string = 'Access denied') {
    super(message)
  }
}

export interface ResourceOwnership {
  organization_id?: string
  org_id?: string
  owner_id?: string
  user_id?: string
  created_by?: string
}

export interface UserWithOrganization {
  organization_id?: string
  org_id?: string
  id?: string
  user_id?: string
}

export function getUserOrganizationId(user: UserWithOrganization | null): string | null {
  if (!user) return null
  return user.organization_id || user.org_id || null
}

export function getUserId(user: UserWithOrganization | null): string | null {
  if (!user) return null
  return user.id || user.user_id || null
}

export function checkOwnership(
  resource: ResourceOwnership | null | undefined,
  user: UserWithOrganization | null
): boolean {
  if (!resource || !user) return false
  
  const userOrgId = getUserOrganizationId(user)
  if (!userOrgId) return false
  
  const resourceOrgId = resource.organization_id || resource.org_id
  if (!resourceOrgId) return false
  
  return userOrgId === resourceOrgId
}

export function assertOwnership(
  resource: ResourceOwnership | null | undefined,
  user: UserWithOrganization | null,
  resourceType?: string,
  resourceId?: string
): void {
  if (!checkOwnership(resource, user)) {
    throw new AuthorizationError(
      'You do not have permission to access this resource',
      resourceType,
      resourceId
    )
  }
}

export function assertResourceExists<T>(
  resource: T | null | undefined,
  resourceType: string,
  resourceId?: string
): asserts resource is T {
  if (resource === null || resource === undefined) {
    throw new AuthorizationError(
      `${resourceType} not found`,
      resourceType,
      resourceId
    )
  }
}

export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'

export interface PermissionCheck {
  resource: string
  action: Permission
  resourceId?: string
}

export function canPerformAction(
  userRole: string | null | undefined,
  action: Permission,
  resourceOwnerId?: string | null,
  currentUserId?: string | null
): boolean {
  if (!userRole) return false
  
  const roleHierarchy: Record<string, number> = {
    admin: 3,
    staff: 2,
    contact: 1,
    guest: 0,
  }
  
  const actionHierarchy: Record<Permission, number> = {
    admin: 3,
    delete: 2,
    write: 1,
    read: 0,
  }
  
  const userLevel = roleHierarchy[userRole] ?? 0
  const requiredLevel = actionHierarchy[action]
  
  if (userLevel >= requiredLevel) {
    if (action === 'read') return true
    if (userRole === 'admin') return true
    if (action === 'write' && resourceOwnerId === currentUserId) return true
  }
  
  return false
}

export class AuthorizationService {
  private static instance: AuthorizationService
  
  private constructor() {}
  
  static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService()
    }
    return AuthorizationService.instance
  }
  
  async verifyResourceAccess<T extends ResourceOwnership>(
    resourcePromise: Promise<T>,
    user: UserWithOrganization | null,
    resourceType: string
  ): Promise<T> {
    const resource = await resourcePromise
    
    if (!checkOwnership(resource, user)) {
      throw new AuthorizationError(
        `Access denied to ${resourceType}`,
        resourceType
      )
    }
    
    return resource
  }
  
  async verifyBatchAccess<T extends ResourceOwnership>(
    resourcesPromise: Promise<T[]>,
    user: UserWithOrganization | null
  ): Promise<T[]> {
    const resources = await resourcesPromise
    
    if (!user) {
      throw new AuthorizationError('Authentication required')
    }
    
    const userOrgId = getUserOrganizationId(user)
    if (!userOrgId) {
      throw new AuthorizationError('Organization not found')
    }
    
    return resources.filter(resource => {
      const resourceOrgId = resource.organization_id || resource.org_id
      return resourceOrgId === userOrgId
    })
  }
}

export const authorizationService = AuthorizationService.getInstance()
