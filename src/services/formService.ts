import { apiClient } from '@/lib/apiClient'

export interface FormField {
  id: string
  label: string
  type: 'TEXT' | 'EMAIL' | 'SELECT' | 'NUMBER' | 'TEXTAREA'
  required: boolean
  options?: string[]
  order_index: number
  validation_rules?: Record<string, unknown>
}

export interface Form {
  id: string
  title: string
  slug: string
  category?: string
  description?: string
  note?: string
  payment_type: 'FIXED' | 'VARIABLE'
  amount?: number
  allow_partial: boolean
  is_active: boolean
  fields?: FormField[]
  created_at: string
  updated_at: string
}

export interface CreateFormRequest {
  title: string
  slug: string
  category?: string
  description?: string
  note?: string
  payment_type: 'FIXED' | 'VARIABLE'
  amount?: number
  allow_partial: boolean
}

export interface CreateFieldRequest {
  label: string
  type: FormField['type']
  required: boolean
  options?: string[]
  order_index?: number
  validation_rules?: Record<string, unknown>
}

export interface FormTarget {
  id: string
  target_type: 'group' | 'contact'
  target_id: string
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

export const formService = {
  getForms: async (params?: PaginationParams): Promise<PaginatedResponse<Form>> => {
    return apiClient.get('/forms', { params })
  },

  getForm: async (id: string): Promise<Form> => {
    return apiClient.get(`/forms/${id}`)
  },

  createForm: async (data: CreateFormRequest): Promise<Form> => {
    return apiClient.post('/forms', data)
  },

  updateForm: async (id: string, data: Partial<CreateFormRequest & { is_active?: boolean }>): Promise<Form> => {
    return apiClient.patch(`/forms/${id}`, data)
  },

  deleteForm: async (id: string): Promise<void> => {
    return apiClient.delete(`/forms/${id}`)
  },

  getFormFields: async (formId: string): Promise<FormField[]> => {
    return apiClient.get(`/forms/${formId}/fields`)
  },

  createField: async (formId: string, data: CreateFieldRequest): Promise<FormField> => {
    return apiClient.post(`/forms/${formId}/fields`, data)
  },

  updateField: async (fieldId: string, data: Partial<CreateFieldRequest>): Promise<FormField> => {
    return apiClient.patch(`/forms/fields/${fieldId}`, data)
  },

  deleteField: async (fieldId: string): Promise<void> => {
    return apiClient.delete(`/forms/fields/${fieldId}`)
  },

  reorderFields: async (formId: string, fields: { id: string; order_index: number }[]): Promise<void> => {
    return apiClient.patch(`/forms/${formId}/fields/reorder`, { fields })
  },

  getFormTargets: async (formId: string): Promise<FormTarget[]> => {
    return apiClient.get(`/forms/${formId}/targets`)
  },

  addFormTargets: async (formId: string, data: { target_type: 'group' | 'contact'; target_ids: string[] }): Promise<void> => {
    return apiClient.post(`/forms/${formId}/targets`, data)
  },

  removeFormTarget: async (formId: string, targetId: string): Promise<void> => {
    return apiClient.delete(`/forms/${formId}/targets/${targetId}`)
  },
}
