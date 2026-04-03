import { apiClient } from '@/lib/apiClient'

export interface Group {
  id: string
  name: string
  description?: string
  note?: string
  parent_group_id?: string
  contact_count?: number
  created_at: string
}

export interface GroupTreeNode extends Group {
  children?: GroupTreeNode[]
}

export interface CreateGroupRequest {
  name: string
  description?: string
  note?: string
  parent_group_id?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  [key: string]: string | number | boolean | undefined
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
}

export const groupService = {
  getGroups: async (params?: PaginationParams): Promise<PaginatedResponse<Group>> => {
    return apiClient.get('/groups', { params })
  },

  getGroupTree: async (): Promise<GroupTreeNode[]> => {
    return apiClient.get('/groups/tree')
  },

  getGroup: async (id: string): Promise<Group> => {
    return apiClient.get(`/groups/${id}`)
  },

  createGroup: async (data: CreateGroupRequest): Promise<Group> => {
    return apiClient.post('/groups', data)
  },

  updateGroup: async (id: string, data: Partial<CreateGroupRequest>): Promise<Group> => {
    return apiClient.patch(`/groups/${id}`, data)
  },

  deleteGroup: async (id: string): Promise<void> => {
    return apiClient.delete(`/groups/${id}`)
  },

  getGroupContacts: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<Contact>> => {
    return apiClient.get(`/groups/${id}/contacts`, { params })
  },

  addContactsToGroup: async (groupId: string, contactIds: string[]): Promise<void> => {
    return apiClient.post(`/groups/${groupId}/contacts`, { contact_ids: contactIds })
  },

  removeContactFromGroup: async (groupId: string, contactId: string): Promise<void> => {
    return apiClient.delete(`/groups/${groupId}/contacts/${contactId}`)
  },
}
