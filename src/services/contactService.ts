import { apiClient } from '@/lib/apiClient'
import { getAccessToken } from '@/lib/auth'

export interface Contact {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone?: string
  gender?: string
  student_id?: string
  external_id?: string
  guardian_name?: string
  guardian_email?: string
  guardian_phone?: string
  is_active: boolean
  require_login: boolean
  created_at: string
}

export interface ContactDetails extends Contact {
  groups: Group[]
  group_hierarchy: string[]
}

export interface Group {
  id: string
  name: string
  parent_group_id?: string
}

export interface CreateContactRequest {
  first_name?: string
  middle_name?: string
  last_name?: string
  email: string
  phone?: string
  gender?: string
  student_id?: string
  external_id?: string
  guardian_name?: string
  guardian_email?: string
  guardian_phone?: string
  require_login?: boolean
  must_reset_password?: boolean
}

export interface UpdateContactRequest {
  name?: string
  email?: string
  phone?: string
  is_active?: boolean
}

export interface ImportContactRow {
  first_name?: string
  middle_name?: string
  last_name?: string
  name?: string
  email: string
  phone?: string
  gender?: string
  student_id?: string
  external_id?: string
  guardian_name?: string
  guardian_email?: string
  guardian_phone?: string
  group_ids?: string[]
  groups?: string[]
  group_paths?: string[]
  require_login?: boolean
  is_active?: boolean
  must_reset_password?: boolean
}

export interface ImportValidationResult {
  valid: number
  duplicates: number
  errors: number
  rows: ImportContactRow[]
}

export interface Import {
  id: string
  status: string
  created_at: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  group_id?: string
  [key: string]: string | number | boolean | undefined
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const contactService = {
  getContacts: async (params?: PaginationParams): Promise<PaginatedResponse<Contact>> => {
    return apiClient.get('/contacts', { params })
  },

  getContact: async (id: string): Promise<Contact> => {
    return apiClient.get(`/contacts/${id}`)
  },

  getContactDetails: async (id: string): Promise<ContactDetails> => {
    return apiClient.get(`/contacts/${id}/details`)
  },

  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    return apiClient.post('/contacts', data)
  },

  updateContact: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    return apiClient.patch(`/contacts/${id}`, data)
  },

  deleteContact: async (id: string): Promise<void> => {
    return apiClient.delete(`/contacts/${id}`)
  },

  importContacts: async (contacts: ImportContactRow[]): Promise<{ import_id: string }> => {
    return apiClient.post('/contacts/import', { contacts })
  },

  validateImport: async (contacts: ImportContactRow[]): Promise<ImportValidationResult> => {
    return apiClient.post('/contacts/imports/validate', { contacts })
  },

  commitImport: async (importId: string): Promise<{ imported: number }> => {
    return apiClient.post(`/contacts/imports/${importId}/commit`)
  },

  importContactsCSV: async (csvData: string): Promise<{ import_id: string }> => {
    return apiClient.post('/contacts/imports/csv/validate', { csv: csvData })
  },

  commitCSVImport: async (csvData: string): Promise<{ imported: number }> => {
    return apiClient.post('/contacts/imports/csv/commit', { csv: csvData })
  },

  getImports: async (params?: PaginationParams): Promise<PaginatedResponse<Import>> => {
    return apiClient.get('/contacts/imports', { params })
  },

  getImport: async (id: string): Promise<{ id: string; status: string; details: ImportValidationResult }> => {
    return apiClient.get(`/contacts/imports/${id}`)
  },

  exportContacts: async (params?: { group_id?: string }): Promise<Blob> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(
      `${apiUrl}/contacts/export${params?.group_id ? `?group_id=${params.group_id}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to export contacts')
    }
    
    return response.blob()
  },

  getContactTransactions: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<Transaction>> => {
    return apiClient.get(`/contacts/${id}/transactions`, { params })
  },

  exportContactTransactions: async (contactId: string): Promise<Blob> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const url = `${apiUrl}/contacts/${contactId}/transactions?format=csv`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to export transactions')
    }
    
    return response.blob()
  },

  assignGroups: async (contactId: string, groupIds: string[]): Promise<void> => {
    return apiClient.post(`/contacts/${contactId}/groups`, { group_ids: groupIds })
  },

  assignContactsToGroup: async (groupId: string, contactIds: string[]): Promise<void> => {
    return apiClient.post(`/groups/${groupId}/contacts`, { contact_ids: contactIds })
  },

  exportContactStatement: async (contactId: string): Promise<Blob> => {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const url = `${apiUrl}/contacts/${contactId}/statement`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to export statement')
    }
    
    return response.blob()
  },
}

export interface Transaction {
  id: string
  reference: string
  amount: number
  status: string
  created_at: string
}
