import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogoIcon } from '@/components/Logo'
import { contactAuthService } from '@/services/contactAuthService'
import { contactService } from '@/services/contactService'
import { formService, type Form } from '@/services/formService'
import { ArrowLeft, Search, FileText, CreditCard, Lock } from 'lucide-react'

export function ContactFormsPage() {
  const navigate = useNavigate()
  const [contact, setContact] = useState<{ id: string; first_name: string; last_name: string; email: string } | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactData = await contactAuthService.getMe()
        setContact(contactData)
        
        const formsData = await formService.getForms({ limit: 50 })
        const accessibleForms = formsData.data.filter(form => 
          form.access_mode === 'OPEN' || form.access_mode === undefined
        )
        setForms(accessibleForms)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        navigate('/contact/login')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await contactAuthService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('contact_data')
      localStorage.removeItem('payforms_access_token')
      localStorage.removeItem('payforms_refresh_token')
      localStorage.removeItem('pf_contact_token')
      navigate('/contact/login')
    }
  }

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your forms...</p>
        </div>
      </div>
    )
  }

  const contactName = contact ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') : 'Student'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/contact/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <LogoIcon size="sm" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contact Portal</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{contactName}</p>
              <p className="text-sm text-gray-500">{contact?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
          <p className="text-gray-500 mt-1">Forms and payment pages available to you</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms available</h3>
            <p className="text-gray-500">
              {searchQuery ? 'No forms match your search.' : 'There are no forms available for you at this time.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredForms.map((form) => (
              <div 
                key={form.id} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/pay/${form.slug}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">{form.title}</h3>
                    {form.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{form.description}</p>
                    )}
                    <div className="flex items-center gap-3">
                      {form.amount ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          <CreditCard className="w-4 h-4" />
                          {formatCurrency(form.amount)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                          Free
                        </span>
                      )}
                      {form.access_mode === 'LOGIN_REQUIRED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <Lock className="w-3 h-3" />
                          Login Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
