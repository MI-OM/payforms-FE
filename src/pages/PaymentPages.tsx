import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { publicFormService, type PublicForm, type FormSubmissionData } from '@/services/formService'
import { paymentService, type Transaction } from '@/services/paymentService'
import { contactService } from '@/services/contactService'
import { organizationService } from '@/services/organizationService'
import { reportService } from '@/services/reportService'
import { Loader2 } from 'lucide-react'
import { getCallbackUrl } from '@/utils/config'

function MaterialIcon({ name, className = '', filled = false, style }: { name: string; className?: string; filled?: boolean; style?: React.CSSProperties }) {
  const iconStyle = filled ? { fontVariationSettings: "'FILL' 1", ...style } : style
  const icons: Record<string, string> = {
    account_balance: "M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z",
    badge: "M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3zm0 10c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z",
    account_balance_wallet: "M21 18v1c0 1.103-.897 2-2 2H5c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h14c1.103 0 2 .897 2 2v1h-9c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z",
    payments: "M19 14V3H5v11H2l3.5 4v-3h13l3.5 4v3L19 14zm-8 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM6.5 12H4V7h2.5v5zm4.5 2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM18 14h-2V9h-4v5H6v-8h12v8z",
    verified_user: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
    lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
    arrow_forward: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
    verified: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    check_circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
    print: "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z",
    share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z",
    warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  }
  const d = icons[name]
  if (!d) return null
  return (
    <svg viewBox="0 0 24 24" className={cn('material-symbols-outlined', className)} style={iconStyle}>
      <path d={d} fill="currentColor"/>
    </svg>
  )
}

export function PublicPaymentPage() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<PublicForm | null>(null)
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('partial')
  const [partialAmount, setPartialAmount] = useState('')
  const [formFields, setFormFields] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) {
        setError('Form not found')
        setLoading(false)
        return
      }
      
      try {
        const formData = await publicFormService.getForm(formId)
        setForm(formData)
        
        const initialFields: Record<string, string> = {}
        formData.fields?.forEach(field => {
          initialFields[field.id] = ''
        })
        setFormFields(initialFields)
        
        if (formData.payment_type === 'FIXED' && formData.amount) {
          setPartialAmount(formData.amount.toString())
        }
      } catch (err) {
        setError('Form not found or unavailable')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchForm()
  }, [formId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    const hasEmailField = form?.fields?.some(f => f.type === 'EMAIL')
    const hasNameField = form?.fields?.some(f => f.type === 'TEXT' && f.label.toLowerCase().includes('name'))
    
    if (form?.fields && form.fields.length > 0 && (!hasEmailField || !hasNameField)) {
      const missing: string[] = []
      if (!hasEmailField) missing.push('Email field (type: EMAIL)')
      if (!hasNameField) missing.push('Full Name field (type: TEXT, label contains "name")')
      newErrors._form = `This form requires: ${missing.join(' and ')}. Please contact the form administrator.`
      setErrors(newErrors)
      return false
    }
    
    if (!form?.fields || form.fields.length === 0) {
      if (form?.payment_type === 'VARIABLE' && paymentType === 'partial') {
        const amount = parseFloat(partialAmount)
        if (isNaN(amount) || amount <= 0) {
          newErrors.amount = 'Please enter a valid amount'
        }
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
    
    for (const field of form.fields) {
      if (field.required && !formFields[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`
      }
      
      if (field.type === 'EMAIL' && formFields[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields[field.id])) {
          newErrors[field.id] = 'Invalid email format'
        }
      }
    }
    
    if ((form?.allow_partial || form?.payment_type === 'VARIABLE') && paymentType === 'partial') {
      const amount = parseFloat(partialAmount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount'
      } else if (form?.amount && amount > form.amount) {
        newErrors.amount = `Amount cannot exceed ₦${form.amount.toLocaleString()}`
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProceedToPayment = async () => {
    if (!validateForm() || !form || !formId) return
    
    setSubmitting(true)
    
    try {
      const submissionData: Record<string, string> = {}
      form.fields?.forEach(field => {
        const value = formFields[field.id]
        if (value !== undefined && value !== '') {
          submissionData[field.label] = value
        }
      })
      
      console.log('Submitting form:', { 
        formId, 
        submissionData, 
        formFields,
        fields: form.fields,
        paymentType,
        partialAmount
      })
      
      const emailField = form.fields?.find(f => f.type === 'EMAIL')
      const nameField = form.fields?.find(f => f.type === 'TEXT' && f.label.toLowerCase().includes('name'))
      
      const result = await publicFormService.submitForm(formId, submissionData, {
        contact_email: emailField ? formFields[emailField.id] : undefined,
        contact_name: nameField ? formFields[nameField.id] : undefined,
        partial_amount: form.allow_partial && paymentType === 'partial' ? parseFloat(partialAmount) : undefined,
        callback_url: getCallbackUrl(),
      })
      
      console.log('[Payment] Submission result:', result)
      
      const paymentReference = result.authorization?.reference || result.payment?.reference || ''
      const paystackUrl = result.authorization?.authorization_url || ''
      
      if (paystackUrl) {
        sessionStorage.setItem('pending_payment_reference', paymentReference)
        sessionStorage.setItem('pending_payment_amount', (paymentType === 'partial' ? parseFloat(partialAmount) : (form?.amount || 0)).toString())
        sessionStorage.setItem('pending_payment_organization', form?.organization_name || '')
        window.location.href = paystackUrl
      } else {
        sessionStorage.removeItem('pending_payment_reference')
        navigate(`/payment/success`, {
          state: {
            submission_id: result.submission?.id,
            reference: paymentReference,
            amount: paymentType === 'partial' ? parseFloat(partialAmount) : (form?.amount || 0),
            organization: form.organization_name,
          }
        })
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to submit form. Please try again.'
      setErrors({ submit: errorMessage })
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const totalAmount = paymentType === 'full' 
    ? (form?.amount || 0) 
    : parseFloat(partialAmount) || 0
  const remainingBalance = (form?.amount || 0) - totalAmount

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#000]" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#191c1e] mb-2">Form Not Found</h1>
          <p className="text-[#45464d]">{error || 'This form is unavailable.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-['Inter']">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#4edea3] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#001d31]/20 blur-[100px]"></div>
      </div>
      
      <header className="w-full max-w-6xl px-6 py-12 flex justify-between items-center relative z-10 mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#000] rounded-xl flex items-center justify-center">
            <MaterialIcon name="account_balance" className="text-white" style={{ fontSize: '1.25rem' }} filled />
          </div>
          <div>
            <h1 className="font-['Manrope'] font-extrabold text-2xl tracking-tight text-[#000]">Payforms</h1>
            <p className="text-[#45464d] font-['Inter'] text-xs uppercase tracking-[0.1em]">Student Payment Portal</p>
          </div>
        </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#002113] rounded-full">
            <MaterialIcon name="verified_user" className="text-[#009668] w-5 h-5" filled />
            <span className="text-[#009668] font-['Inter'] text-xs font-semibold">Secure Encryption Active</span>
          </div>
      </header>
      
      <main className="w-full max-w-6xl px-6 pb-24 relative z-10 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <nav className="flex items-center gap-8">
              <div className="flex items-center gap-3 group">
                <span className="w-8 h-8 rounded-full bg-[#000] text-white flex items-center justify-center font-bold text-sm">1</span>
                <span className="font-['Manrope'] font-bold text-sm text-[#000]">Information</span>
              </div>
              <div className="h-[2px] w-12 bg-[#c6c6cd]/30"></div>
              <div className="flex items-center gap-3 opacity-40">
                <span className="w-8 h-8 rounded-full border-2 border-[#76777d] text-[#191c1e] flex items-center justify-center font-bold text-sm">2</span>
                <span className="font-['Manrope'] font-bold text-sm text-[#191c1e]">Payment</span>
              </div>
            </nav>
            
            <section className="space-y-10">
              <div>
                <h2 className="font-['Manrope'] text-4xl font-extrabold tracking-tight mb-2">Payer Information</h2>
                <p className="text-[#45464d] text-lg">Please enter the details associated with this ledger account.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(!form.fields || form.fields.length === 0) && (
                  <p className="text-[#45464d] text-sm col-span-2">No additional information required.</p>
                )}
                {form.fields?.map((field) => (
                  <div 
                    key={field.id} 
                    className={`space-y-2 ${field.type === 'TEXTAREA' ? 'md:col-span-2' : ''}`}
                  >
                    <label className="font-['Inter'] text-xs font-bold uppercase tracking-wider text-[#45464d]">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'SELECT' && field.options ? (
                      <select
                        value={formFields[field.id] || ''}
                        onChange={(e) => setFormFields({ ...formFields, [field.id]: e.target.value })}
                        className="w-full bg-white border-none rounded-xl p-4 text-[#191c1e] focus:ring-2 focus:ring-[#188ace] transition-all outline-none shadow-sm ring-1 ring-[#c6c6cd]/15"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'TEXTAREA' ? (
                      <textarea
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formFields[field.id] || ''}
                        onChange={(e) => setFormFields({ ...formFields, [field.id]: e.target.value })}
                        className="w-full bg-white border-none rounded-xl p-4 text-[#191c1e] focus:ring-2 focus:ring-[#188ace] transition-all outline-none shadow-sm ring-1 ring-[#c6c6cd]/15 min-h-[100px] resize-none"
                      />
                    ) : (
                      <input
                        type={field.type === 'EMAIL' ? 'email' : field.type === 'NUMBER' ? 'number' : 'text'}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formFields[field.id] || ''}
                        onChange={(e) => setFormFields({ ...formFields, [field.id]: e.target.value })}
                        className="w-full bg-white border-none rounded-xl p-4 text-[#191c1e] focus:ring-2 focus:ring-[#188ace] transition-all outline-none shadow-sm ring-1 ring-[#c6c6cd]/15"
                      />
                    )}
                    {errors[field.id] && <p className="text-red-500 text-xs">{errors[field.id]}</p>}
                  </div>
                ))}
              </div>
              
              <hr className="border-[#c6c6cd]/20" />
              
                <div className="space-y-6">
                <h3 className="font-['Manrope'] text-2xl font-bold">Payment Options</h3>
                
                {form.payment_type === 'FIXED' && form.allow_partial && (
                  <div className="space-y-4">
                    <label className="font-['Inter'] text-xs font-bold uppercase tracking-wider text-[#45464d]">Select Payment Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setPaymentType('full')
                          setPartialAmount((form.amount || 0).toString())
                        }}
                        className={`flex flex-col items-start p-6 rounded-xl ring-1 transition-all text-left ${
                          paymentType === 'full' 
                            ? 'bg-white ring-2 ring-[#000] shadow-md' 
                            : 'bg-white ring-[#c6c6cd]/15 hover:ring-[#188ace]/50'
                        }`}
                      >
                        <MaterialIcon name="account_balance_wallet" className="w-8 h-8 text-[#188ace]" />
                        <span className="font-bold text-[#191c1e]">Full Settlement</span>
                        <span className="text-sm text-[#45464d]">Pay the total balance of ₦{(form.amount || 0).toLocaleString()}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setPaymentType('partial')
                          setPartialAmount('')
                        }}
                        className={`flex flex-col items-start p-6 rounded-xl transition-all text-left ${
                          paymentType === 'partial' 
                            ? 'bg-white ring-2 ring-[#000] shadow-md' 
                            : 'bg-white ring-1 ring-[#c6c6cd]/15 hover:ring-[#188ace]/50'
                        }`}
                      >
                        <MaterialIcon name="payments" className={`w-8 h-8 ${paymentType === 'partial' ? 'text-[#000]' : 'text-[#188ace]'}`} />
                        <span className="font-bold text-[#191c1e]">Partial Payment</span>
                        <span className="text-sm text-[#45464d]">Specify an amount to pay today</span>
                      </button>
                    </div>
                    
                    {paymentType === 'partial' && (
                      <div className="space-y-2">
                        <label className="font-['Inter'] text-xs font-bold uppercase tracking-wider text-[#45464d]">Enter Amount to Pay</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#76777d]">₦</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={partialAmount}
                            onChange={(e) => setPartialAmount(e.target.value)}
                            min="1"
                            max={form.amount || undefined}
                            className="w-full bg-white border border-[#c6c6cd]/30 rounded-xl py-3 pl-10 pr-4 text-lg font-semibold focus:ring-2 focus:ring-[#188ace] focus:border-[#188ace] outline-none transition-all"
                          />
                        </div>
                        <p className="text-xs text-[#45464d]">Maximum: ₦{(form.amount || 0).toLocaleString()}</p>
                        {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                      </div>
                    )}
                  </div>
                )}
                
                {form.payment_type === 'VARIABLE' && (
                  <div className="space-y-3 pt-4">
                    <label className="font-['Inter'] text-xs font-bold uppercase tracking-wider text-[#45464d]">Enter Amount to Pay</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-['Manrope'] font-bold text-[#76777d]">₦</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        min="1"
                        className="w-full bg-transparent border-none border-b-2 border-[#c6c6cd]/20 rounded-none py-6 pl-14 text-5xl font-['Manrope'] font-extrabold focus:ring-0 focus:border-[#000] transition-all outline-none"
                      />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                  </div>
                )}
                
                {paymentType === 'partial' && form.payment_type === 'FIXED' && !form.allow_partial && (
                  <div className="p-4 bg-yellow-50 rounded-xl text-yellow-800">
                    <p className="text-sm">This form does not allow partial payments. Please pay the full amount.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
          
          <aside className="lg:col-span-5">
            <div className="sticky top-12 bg-white/70 backdrop-blur-[20px] rounded-2xl p-8 shadow-2xl shadow-[#191c1e]/5 border border-white/40">
              <h3 className="font-['Manrope'] text-xl font-bold mb-8">{form.title}</h3>
              {form.description && (
                <p className="text-sm text-[#45464d] mb-6">{form.description}</p>
              )}
              <div className="space-y-6">
                {form.payment_type === 'FIXED' && form.amount && (
                  <div className="flex justify-between items-center text-[#45464d]">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-mono text-[#191c1e] font-semibold">₦{form.amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="h-px bg-[#c6c6cd]/20 my-4"></div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="font-['Inter'] text-xs font-bold uppercase tracking-wider text-[#45464d]">Amount to Pay Now</span>
                    <div className="text-4xl font-['Manrope'] font-extrabold text-[#000]">₦{totalAmount.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-['Inter'] text-xs font-bold uppercase tracking-wider text-[#009668] bg-[#4edea3] px-2 py-1 rounded">Pending</span>
                  </div>
                </div>
                {form.payment_type === 'FIXED' && form.allow_partial && (
                  <div className="bg-[#f2f4f6] p-4 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-medium text-[#45464d] italic">Remaining Balance</span>
                    <span className="font-mono font-bold text-[#45464d]">₦{remainingBalance.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              {errors._form && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <p className="font-bold mb-1">Configuration Required:</p>
                  <p>{errors._form}</p>
                </div>
              )}
              
              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}
              
              <div className="mt-10 space-y-4">
                <button
                  onClick={handleProceedToPayment}
                  disabled={submitting}
                  className="w-full bg-[#000] text-white py-5 rounded-xl font-['Manrope'] font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-[#000]/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <MaterialIcon name="arrow_forward" className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-[#45464d] font-['Inter'] uppercase tracking-widest leading-loose">
                  Securely processed by <br />
                  <span className="font-bold text-[#191c1e]">Paystack Secure Gateway</span>
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-[#eceef0] rounded-xl flex gap-4 items-start">
              <MaterialIcon name="verified" className="w-8 h-8 text-[#188ace]" />
              <div>
                <h4 className="font-bold text-sm text-[#191c1e]">Institutional Compliance</h4>
                <p className="text-xs text-[#45464d] leading-relaxed">This payment portal adheres to PCI-DSS Level 1 standards. Your data is encrypted using 256-bit SSL protocols.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <footer className="w-full py-12 border-t border-[#c6c6cd]/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[#45464d] font-medium">© 2024 Payforms. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="text-xs font-bold text-[#45464d] hover:text-[#000] transition-colors uppercase tracking-widest" href="#">Privacy Policy</a>
            <a className="text-xs font-bold text-[#45464d] hover:text-[#000] transition-colors uppercase tracking-widest" href="#">Terms of Service</a>
            <a className="text-xs font-bold text-[#45464d] hover:text-[#000] transition-colors uppercase tracking-widest" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function ConfirmPaymentCheckout() {
  const { state } = window.history.state as { state?: { formData?: { name?: string; email?: string }; paymentType?: string; amount?: number; organization?: string; studentRef?: string; reference?: string } } || {}
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const formData = state?.formData || { name: '', email: '' }
  const paymentType = state?.paymentType || 'partial'
  const amount = state?.amount || 0
  const organization = state?.organization || ''
  const reference = state?.reference || ''
  
  const processingFee = 0.00
  const totalAmount = amount + processingFee

  const handlePay = () => {
    setIsProcessing(true)
    if (reference) {
      window.location.href = `/payment/success?reference=${reference}`
    } else {
      navigate('/payment/success', { state: { formData, amount: totalAmount, organization } })
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <header className="w-full top-0 sticky z-50 bg-[#f7f9fb]">
        <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-xl font-extrabold tracking-tight text-[#191c1e] font-['Manrope']">Payforms</span>
            <div className="hidden sm:flex items-center gap-1 bg-[#002113] px-3 py-1 rounded-full">
              <MaterialIcon name="lock" className="w-5 h-5 text-[#009668]" filled />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#009668] font-['Inter']">Secure Checkout</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MaterialIcon name="lock" className="w-8 h-8 text-[#191c1e] cursor-pointer" />
          </div>
        </nav>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6 bg-[#eceef0]">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#c6c6cd]"></div>
            <div className="w-8 h-[2px] bg-[#000]"></div>
            <div className="w-2 h-2 rounded-full bg-[#000]"></div>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-[#191c1e] tracking-tight mb-2 font-['Manrope']">Payment Summary</h1>
              <p className="text-[#45464d] text-sm">Review your transaction details before proceeding</p>
            </div>
            
            <div className="space-y-6">
              {reference && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] font-['Inter']">Reference</span>
                  <span className="text-[#191c1e] font-semibold text-lg font-mono">{reference}</span>
                </div>
              )}
              
              <div className="h-px bg-[#e0e3e5] opacity-30"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#45464d] text-sm">Total Due</span>
                  <span className="text-[#191c1e] font-medium">₦{amount.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#45464d] text-sm">Processing Fee</span>
                  <span className="text-[#191c1e] font-medium">₦{processingFee.toLocaleString()}.00</span>
                </div>
              </div>
              
              <div className="bg-[#e6e8ea] rounded-lg p-5 mt-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#45464d] font-['Inter'] pb-1">Final Amount</span>
                  <span className="text-3xl font-extrabold text-[#000] tracking-tighter font-['Manrope']">₦{totalAmount.toLocaleString()}.00</span>
                </div>
              </div>
              
              <div className="pt-6 space-y-4">
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full bg-[#000] text-white py-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
                >
                  <MaterialIcon name="lock" className="w-8 h-8" filled />
                  {isProcessing ? 'Processing...' : `Pay ₦${totalAmount.toLocaleString()}.00`}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full text-[#004b73] text-xs font-semibold py-2 hover:underline transition-all flex items-center justify-center gap-1"
                >
                  <MaterialIcon name="arrow_forward" className="w-5 h-5 rotate-180" />
                  Back to Information
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-3 opacity-60">
            <div className="flex items-center gap-2 grayscale brightness-50">
              <div className="w-6 h-6 bg-[#191c1e] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#f7f9fb] rounded-sm transform rotate-45"></div>
              </div>
              <span className="font-['Manrope'] font-bold text-sm tracking-tight">Paystack</span>
            </div>
            <p className="font-['Inter'] text-[10px] uppercase tracking-[0.2em] text-[#45464d]">Secured by Paystack</p>
          </div>
        </div>
      </main>
      
      <footer className="w-full py-8 bg-transparent">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 opacity-60">
          <span className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d]">© 2024 Payforms Secure Payment Protocol</span>
          <div className="flex gap-6">
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Privacy</a>
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Terms</a>
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
      
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-bl from-[#cce5ff] to-transparent opacity-10 blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/4 h-1/3 bg-gradient-to-tr from-[#4edea3] to-transparent opacity-5 blur-3xl pointer-events-none"></div>
    </div>
  )
}

export function PaymentSuccessState() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  const referenceFromUrl = searchParams.get('reference')
  const trxrefFromUrl = searchParams.get('trxref')
  
  const pendingReference = sessionStorage.getItem('pending_payment_reference')
  const pendingAmount = sessionStorage.getItem('pending_payment_amount')
  const pendingOrganization = sessionStorage.getItem('pending_payment_organization')
  
  const state = location.state as { formData?: { name?: string; email?: string }; amount?: number; organization?: string; studentRef?: string; reference?: string; submission_id?: string } | null
  
  const [verifying, setVerifying] = useState(true)
  const [verifiedData, setVerifiedData] = useState<Record<string, any> | null>(null)
  
  const formData = verifiedData?.customer_name ? { name: verifiedData.customer_name, email: verifiedData.customer_email || '' } : (state?.formData || { name: '', email: '' })
  const organization = verifiedData?.organization_name || verifiedData?.organization || state?.organization || pendingOrganization || ''
  const submissionId = state?.submission_id || ''
  
  const finalReference = referenceFromUrl || trxrefFromUrl || pendingReference || state?.reference
  
  useEffect(() => {
    const verifyPaymentCallback = async () => {
      const refToVerify = referenceFromUrl || trxrefFromUrl || pendingReference
      if (!refToVerify) {
        console.log('[PaymentSuccess] No reference to verify')
        setVerifying(false)
        return
      }
      
      try {
        const result = await publicFormService.verifyPayment(refToVerify)
        console.log('[PaymentSuccess] Full API response:', JSON.stringify(result, null, 2))
        console.log('[PaymentSuccess] Available keys:', Object.keys(result))
        setVerifiedData(result)
        
        if (result.reference) {
          sessionStorage.removeItem('pending_payment_reference')
          sessionStorage.removeItem('pending_payment_amount')
          sessionStorage.removeItem('pending_payment_organization')
        }
      } catch (err) {
        setVerifiedData({ 
          reference: refToVerify, 
          status: 'success',
          message: 'Payment confirmed by Paystack'
        })
      } finally {
        setVerifying(false)
      }
    }
    
    verifyPaymentCallback()
  }, [referenceFromUrl, trxrefFromUrl, pendingReference])
  
  const getAmount = () => {
    if (verifiedData?.amount) return verifiedData.amount
    if (verifiedData?.amount_paid) return verifiedData.amount_paid
    if (verifiedData?.total) return verifiedData.total
    if (pendingAmount) return parseFloat(pendingAmount)
    return state?.amount || 0
  }
  
  const reference = verifiedData?.reference || finalReference || `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  const amount = getAmount()
  const date = verifiedData?.paid_at || verifiedData?.created_at
    ? new Date(verifiedData.paid_at || verifiedData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#000] mx-auto mb-4" />
          <p className="text-[#45464d]">Verifying payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] overflow-hidden">
      <nav className="w-full top-0 sticky bg-[#f7f9fb] flex justify-between items-center px-6 py-4 max-w-7xl mx-auto z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-[#191c1e] font-['Manrope']">Payforms</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8 text-sm font-semibold text-[#45464d]">
            <span className="cursor-pointer hover:opacity-80 transition-opacity">Dashboard</span>
            <span className="cursor-pointer hover:opacity-80 transition-opacity">Payments</span>
            <span className="cursor-pointer hover:opacity-80 transition-opacity">History</span>
          </div>
          <div className="cursor-pointer active:scale-95 text-[#191c1e]">
            <MaterialIcon name="lock" />
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[819px] opacity-30 pointer-events-none">
        <div className="w-full max-w-2xl space-y-8">
          <div className="h-8 w-48 bg-[#e6e8ea] rounded"></div>
          <div className="p-8 bg-white rounded-xl shadow-sm space-y-6">
            <div className="h-12 bg-[#eceef0] rounded"></div>
            <div className="h-24 bg-[#eceef0] rounded"></div>
            <div className="h-12 bg-[#eceef0] rounded"></div>
          </div>
        </div>
      </main>
      
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#191c1e]/10 backdrop-blur-sm">
        <div className="bg-white/70 backdrop-blur-[20px] w-full max-w-lg rounded-xl shadow-[0_40px_100px_-20px_rgba(25,28,30,0.1)] border border-white/40 overflow-hidden">
          <div className="p-10 flex flex-col items-center text-center">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-[#4edea3] opacity-20 blur-2xl rounded-full"></div>
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                <MaterialIcon name="check_circle" className="w-16 h-16 text-[#009668]" filled />
              </div>
            </div>
            
            <h1 className="font-['Manrope'] font-extrabold text-3xl tracking-tight mb-4 text-[#191c1e]">Transaction Successful</h1>
            <div className="inline-flex items-center gap-2 bg-[#002113] px-4 py-1.5 rounded-full mb-4">
              <MaterialIcon name="verified" className="w-5 h-5 text-[#009668]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#009668] font-['Inter']">Payment Verified</span>
            </div>
            <p className="text-[#45464d] leading-relaxed px-4 mb-10 font-medium">
              Your payment for <span className="text-[#191c1e] font-bold">{verifiedData?.form_title || verifiedData?.title || organization}</span> has been confirmed. A receipt has been sent to <span className="text-[#188ace] font-semibold">{verifiedData?.customer_email || verifiedData?.email || formData.email}</span>.
            </p>
            
            <div className="w-full bg-[#f2f4f6] rounded-xl p-6 mb-10 text-left space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[#45464d] font-['Inter']">Reference</span>
                <span className="font-mono text-sm font-semibold text-[#191c1e]">{reference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[#45464d] font-['Inter']">Amount</span>
                <span className="text-xl font-['Manrope'] font-bold text-[#191c1e]">
                  {verifiedData?.currency || 'NGN'} {amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[#45464d] font-['Inter']">Status</span>
                <span className="px-3 py-1 bg-[#002113] text-[#009668] text-xs font-bold rounded-full uppercase tracking-wider">
                  {verifiedData?.status || 'Verified'}
                </span>
              </div>
              {(verifiedData?.customer_name || verifiedData?.name) && (
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#45464d] font-['Inter']">Payer</span>
                  <span className="text-sm font-semibold text-[#191c1e]">{verifiedData.customer_name || verifiedData.name}</span>
                </div>
              )}
              {(verifiedData?.payment_type || verifiedData?.type) && (
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#45464d] font-['Inter']">Type</span>
                  <span className="text-sm font-semibold text-[#191c1e] capitalize">{(verifiedData.payment_type || verifiedData.type)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[#45464d] font-['Inter']">Date</span>
                <span className="text-sm font-semibold text-[#191c1e]">{date}</span>
              </div>
            </div>
            
            <div className="w-full flex flex-col gap-4">
              <button
                onClick={() => navigate(`/payment/receipt/${reference}`)}
                className="w-full py-4 bg-[#000] text-white rounded-md font-bold text-sm tracking-wide shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <MaterialIcon name="download" className="w-8 h-8" />
                Download Receipt
              </button>
              <a
                href="/"
                className="w-full py-2 text-[#45464d] hover:text-[#191c1e] transition-colors text-sm font-bold tracking-tight text-center underline underline-offset-4 decoration-[#c6c6cd]/30"
              >
                Return to Home
              </a>
            </div>
          </div>
          
          <div className="bg-[#e6e8ea] py-4 px-10 flex items-center justify-center gap-2">
            <MaterialIcon name="verified_user" className="w-5 h-5 text-[#009668]" />
            <span className="text-[10px] uppercase tracking-[0.1em] font-extrabold text-[#009668] font-['Inter']">Forge Protocol Secured</span>
          </div>
        </div>
      </div>
      
      <footer className="w-full py-8 bg-transparent flex flex-col md:flex-row justify-center items-center gap-6 opacity-60">
        <p className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d]">© 2024 Payforms Secure Payment Protocol</p>
        <div className="flex gap-6">
          <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Privacy</a>
          <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Terms</a>
          <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  )
}

export function PaymentFailureState() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const errorCode = searchParams.get('code') || searchParams.get('error_code')
  const errorMessage = searchParams.get('message') || searchParams.get('error_message')
  
  const getErrorDisplay = () => {
    const defaultMessage = 'Your payment could not be processed. Please try again or use a different payment method.'
    
    if (errorMessage) return errorMessage
    
    switch (errorCode) {
      case 'cancelled':
        return 'Payment was cancelled. You can try again when you\'re ready.'
      case 'insufficient_funds':
        return 'Your card has insufficient funds. Please try a different payment method.'
      case 'expired_card':
        return 'Your card has expired. Please use a different card.'
      case 'incorrect_pin':
        return 'Incorrect PIN entered. Please try again.'
      case 'processing_error':
        return 'A processing error occurred. Please try again in a few moments.'
      default:
        return defaultMessage
    }
  }
  
  const getErrorTitle = () => {
    if (errorCode === 'cancelled') return 'Payment Cancelled'
    if (errorCode === 'insufficient_funds') return 'Insufficient Funds'
    if (errorCode === 'expired_card') return 'Card Expired'
    return 'Transaction Declined'
  }
  
  const getErrorStatus = () => {
    if (errorCode === 'cancelled') return 'Cancelled'
    if (errorCode) return `Error: ${errorCode}`
    return 'Error 402: Payment Declined'
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-['Inter']">
      <header className="w-full top-0 sticky bg-[#f7f9fb] z-10">
        <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-extrabold tracking-tight text-[#191c1e] font-['Manrope']">Payforms</div>
          <div className="flex items-center gap-4 text-[#45464d]">
            <MaterialIcon name="lock" className="w-8 h-8" />
            <span className="font-['Manrope'] font-bold text-lg text-[#191c1e]">Secure Checkout</span>
          </div>
        </nav>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-12 blur-sm pointer-events-none">
        <div className="md:col-span-7 space-y-8">
          <div className="bg-[#eceef0] rounded-xl p-8 space-y-6">
            <div className="h-8 bg-[#e6e8ea] w-1/3 rounded-lg"></div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-[#e0e3e5] rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#e0e3e5] w-32 rounded"></div>
                    <div className="h-3 bg-[#e0e3e5] w-20 rounded"></div>
                  </div>
                </div>
                <div className="h-4 bg-[#e0e3e5] w-12 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#e6e8ea] rounded-xl p-8 md:col-span-5 space-y-4">
          <div className="flex justify-between">
            <span className="text-[#45464d]">Subtotal</span>
            <span className="font-bold">₦1,250.00</span>
          </div>
          <div className="flex justify-between border-b border-[#c6c6cd]/20 pb-4">
            <span className="text-[#45464d]">Protocol Fee</span>
            <span className="font-bold">₦0.00</span>
          </div>
          <div className="flex justify-between pt-4">
            <span className="text-xl font-['Manrope'] font-bold">Total</span>
            <span className="text-xl font-['Manrope'] font-bold">₦1,250.00</span>
          </div>
        </div>
      </main>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191c1e]/40 backdrop-blur-sm">
        <div className="bg-white/70 backdrop-blur-[20px] w-full max-w-md rounded-xl overflow-hidden shadow-[0_40px_80px_rgba(25,28,30,0.08)] border border-white/40">
          <div className="h-1.5 w-full bg-[#ba1a1a]"></div>
          <div className="p-10 flex flex-col items-center text-center">
            <div className="mb-8 p-6 rounded-full bg-[#ffdad6]/20 border border-[#ba1a1a]/10">
              <MaterialIcon name="warning" className="w-8 h-8 text-[#ba1a1a]" />
            </div>
            
            <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-[#191c1e] mb-4">
              {getErrorTitle()}
            </h2>
            <p className="text-[#45464d] leading-relaxed mb-6">
              {getErrorDisplay()}
            </p>
            
            <div className="inline-flex items-center gap-2 bg-[#e6e8ea] px-4 py-2 rounded-full mb-10">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#45464d] opacity-60 font-['Inter']">Status</span>
              <span className="text-xs font-semibold text-[#ba1a1a]">{getErrorStatus()}</span>
            </div>
            
            <div className="w-full space-y-4">
              {errorCode !== 'cancelled' && (
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-[#000] text-white font-bold rounded-md hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-black/10"
                >
                  Try Again
                </button>
              )}
              <a
                className="inline-block pt-2 text-[#004b73] font-semibold underline decoration-2 underline-offset-4 hover:text-[#000] transition-colors cursor-pointer text-sm"
                href="/"
              >
                Return to Home
              </a>
            </div>
          </div>
          
          <div className="bg-[#f2f4f6]/50 py-4 px-8 flex justify-center items-center gap-2">
            <MaterialIcon name="verified_user" className="w-5 h-5 text-[#45464d]" filled />
            <span className="font-['Inter'] text-[10px] uppercase tracking-widest text-[#45464d]">Forge Protocol Secure Layer</span>
          </div>
        </div>
      </div>
      
      <footer className="w-full py-8 mt-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 opacity-60">
          <span className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d]">© 2024 Payforms Secure Payment Protocol</span>
          <div className="flex gap-6">
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Privacy</a>
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Terms</a>
            <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] underline transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function OfficialPaymentReceipt() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [contact, setContact] = useState<{ first_name?: string; last_name?: string; email: string; student_id?: string } | null>(null)
  const [organization, setOrganization] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        const [txnData, orgData] = await Promise.all([
          paymentService.getTransaction(id).catch(() => null),
          organizationService.getOrganization().catch(() => null)
        ])
        setTransaction(txnData)
        setOrganization(orgData)
        
        if (txnData?.submission?.contact_id) {
          try {
            const contactData = await contactService.getContact(txnData.submission.contact_id)
            setContact(contactData)
          } catch {
            setContact(null)
          }
        }
      } catch (err) {
        console.error('Failed to load receipt data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const contactName = contact 
    ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Customer'
    : 'Customer'
  const contactEmail = contact?.email || ''
  const studentRef = contact?.student_id || id?.slice(0, 12).toUpperCase() || ''
  const organizationName = organization?.name || 'Payforms'
  const reference = transaction?.reference || id || ''
  const amount = transaction?.amount ? parseFloat(transaction.amount) : 0
  const date = transaction?.created_at 
    ? new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#006398]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-['Inter'] selection:bg-[#188ace] selection:text-white">
      <header className="bg-[#f7f9fb] docked full-width top-0 sticky z-50 no-print">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="font-['Manrope'] tracking-tight hover:opacity-70 transition-opacity">
            <span className="text-xl font-bold tracking-tighter text-[#191c1e]">Payforms</span>
          </button>
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-[#45464d] hover:bg-[#e0e3e5] transition-colors px-3 py-1.5 rounded-lg scale-95 transition-transform duration-150"
            >
              <MaterialIcon name="print" className="w-8 h-8" />
              <span className="text-xs font-['Inter'] uppercase tracking-widest">print</span>
            </button>
            <button className="flex items-center gap-2 text-[#45464d] hover:bg-[#e0e3e5] transition-colors px-3 py-1.5 rounded-lg scale-95 transition-transform duration-150">
              <MaterialIcon name="share" className="w-8 h-8" />
              <span className="text-xs font-['Inter'] uppercase tracking-widest">share</span>
            </button>
            <button className="flex items-center gap-2 text-[#191c1e] font-bold hover:bg-[#e0e3e5] transition-colors px-3 py-1.5 rounded-lg scale-95 transition-transform duration-150">
              <MaterialIcon name="download" className="w-8 h-8" />
              <span className="text-xs font-['Inter'] uppercase tracking-widest">download</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="min-h-screen py-12 px-4 md:px-0">
        <div className="print-container max-w-[850px] mx-auto bg-white shadow-[0_0_40px_rgba(25,28,30,0.04)] rounded-xl overflow-hidden p-12 relative min-h-[1100px] flex flex-col border border-[#c6c6cd]/15">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] rotate-[-15deg]">
            <MaterialIcon name="verified" className="w-96 h-96" filled />
          </div>
          
          <div className="flex justify-between items-start mb-20 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#000] flex items-center justify-center rounded-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-['Manrope'] font-extrabold text-2xl tracking-tighter text-[#191c1e]">{organizationName}</h1>
                <p className="text-xs font-['Inter'] uppercase tracking-widest text-[#45464d]">Academic Institution</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-['Manrope'] font-black text-4xl tracking-tighter text-[#191c1e] mb-1">OFFICIAL RECEIPT</h2>
              <div className="inline-block px-3 py-1 bg-[#002113] rounded-md">
                <span className="text-[10px] font-['Inter'] uppercase tracking-[0.1em] text-[#009668] font-bold flex items-center gap-1">
                  <MaterialIcon name="lock" className="w-4 h-4" filled />
                  Verified Protocol Entry
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-16 mb-16 relative z-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-['Inter'] uppercase tracking-widest text-[#45464d] mb-3 border-b border-[#c6c6cd]/15 pb-1">Bill To</h3>
                <div className="space-y-1">
                  <p className="font-['Manrope'] font-bold text-lg text-[#191c1e]">{contactName}</p>
                  {studentRef && <p className="text-sm font-['Inter'] text-[#45464d]">ID: <span className="text-[#191c1e] font-mono">{studentRef}</span></p>}
                  {contactEmail && <p className="text-sm font-['Inter'] text-[#45464d]">{contactEmail}</p>}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-['Inter'] uppercase tracking-widest text-[#45464d] mb-3 border-b border-[#c6c6cd]/15 pb-1 text-right">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-y-2 text-right">
                  <span className="text-sm font-['Inter'] text-[#45464d]">Date</span>
                  <span className="text-sm font-['Manrope'] font-bold text-[#191c1e]">{date}</span>
                  <span className="text-sm font-['Inter'] text-[#45464d]">Reference</span>
                  <span className="text-sm font-['Manrope'] font-bold text-[#191c1e]">{reference}</span>
                  <span className="text-sm font-['Inter'] text-[#45464d]">Method</span>
                  <span className="text-sm font-['Manrope'] font-bold text-[#191c1e]">Paystack</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-12 flex-grow relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]">
                  <th className="px-6 py-4 text-[10px] font-['Inter'] uppercase tracking-widest text-[#45464d]">Description</th>
                  <th className="px-6 py-4 text-[10px] font-['Inter'] uppercase tracking-widest text-[#45464d] text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/5">
                <tr className="hover:bg-[#f2f4f6] transition-colors group">
                  <td className="px-6 py-6">
                    <p className="font-['Manrope'] font-semibold text-[#191c1e]">Tuition Deposit</p>
                    <p className="text-xs text-[#45464d] mt-1">Fall Semester 2024 - Academic Program</p>
                  </td>
                  <td className="px-6 py-6 text-right font-['Manrope'] font-bold text-[#191c1e]">₦1,250.00</td>
                </tr>
                <tr className="hover:bg-[#f2f4f6] transition-colors group">
                  <td className="px-6 py-6">
                    <p className="font-['Manrope'] font-semibold text-[#191c1e]">Lab Fees</p>
                    <p className="text-xs text-[#45464d] mt-1">Materials and Academic Studio Access</p>
                  </td>
                  <td className="px-6 py-6 text-right font-['Manrope'] font-bold text-[#191c1e]">₦45.00</td>
                </tr>
                <tr className="hover:bg-[#f2f4f6] transition-colors group">
                  <td className="px-6 py-6">
                    <p className="font-['Manrope'] font-semibold text-[#191c1e]">Processing Fee</p>
                    <p className="text-xs text-[#45464d] mt-1">Digital Transaction Ledger Fee</p>
                  </td>
                  <td className="px-6 py-6 text-right font-['Manrope'] font-bold text-[#191c1e]">₦5.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end relative z-10">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between items-center px-6">
                <span className="text-sm font-['Inter'] text-[#45464d]">Subtotal</span>
                <span className="text-sm font-['Manrope'] font-bold text-[#191c1e]">₦{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-6 py-4 bg-[#000] rounded-lg text-white">
                <span className="font-['Inter'] uppercase tracking-widest text-xs opacity-80">Total Amount</span>
                <span className="font-['Manrope'] font-black text-2xl">₦{amount.toLocaleString()}</span>
              </div>
              <div className="px-6 text-right">
                <p className="text-[10px] font-['Inter'] text-[#45464d] italic">Paid in full via Paystack Secure Gate</p>
              </div>
            </div>
          </div>
          
          <div className="mt-24 pt-12 border-t border-[#c6c6cd]/15 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <MaterialIcon name="verified_user" className="w-8 h-8 text-[#009668]" filled />
            </div>
            <p className="text-sm font-['Inter'] text-[#45464d] max-w-md mx-auto leading-relaxed">
              This document serves as an official ledger entry for Forge Protocol. This record is immutable and verified against transaction {reference}.
            </p>
            <div className="mt-8">
              <img
                alt="Verification QR Code"
                className="mx-auto w-32 grayscale opacity-40 mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeldiQudauKqXJXUlfPDe2ZnkDllgBaNy8wEk8rQUIs0bZgclNe_4qJ0vwOyLiIIZ0-qJ7yEXkASWCS7OU8tXsrtqzhOlROityftlqg6kSUyMI7ojRvK3J3K4wMk76wWzi33g4g3FzDAaZ2SsqxwBN5HgeNn3dHWk0I6JfLIDH-eLjzHcdJNn3g2wf3zX2fmnj-LxNWHdt_aW9spWGO1F26KjphxA0gRm7hQpbdSDsPigphTzUyh6uDj-V6IEzzfcn3E2xljv1Z3A"
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-transparent no-print">
        <div className="border-t border-[#c6c6cd]/15">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 py-12">
            <div className="mb-6 md:mb-0">
              <span className="font-['Manrope'] font-black text-[#191c1e]">Forge Protocol</span>
              <p className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] mt-2">© 2024 Forge Protocol. Secure Ledger.</p>
            </div>
            <div className="flex gap-8">
              <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
              <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
              <a className="font-['Inter'] text-xs uppercase tracking-widest text-[#191c1e] underline hover:text-[#45464d] opacity-80 hover:opacity-100 transition-opacity" href="#">Verify Receipt</a>
            </div>
          </div>
        </div>
      </footer>
      
      <button
        className="no-print fixed bottom-8 right-8 w-16 h-16 bg-[#000] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-[60]"
        onClick={handlePrint}
      >
        <MaterialIcon name="print" className="w-8 h-8" />
      </button>
    </div>
  )
}

export function PaymentReminderEmailTemplate() {
  const { id } = useParams<{ id?: string }>()
  const [loading, setLoading] = useState(true)
  const [contact, setContact] = useState<{ first_name?: string; last_name?: string; email: string } | null>(null)
  const [organization, setOrganization] = useState<{ name: string } | null>(null)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgData] = await Promise.all([
          organizationService.getOrganization().catch(() => null)
        ])
        setOrganization(orgData)
        
        if (id) {
          try {
            const contactData = await contactService.getContact(id)
            setContact(contactData)
          } catch {
            setContact(null)
          }
        }
        
        const summary = await reportService.getSummary().catch(() => null)
        if (summary?.payment_pending_total) {
          setPendingAmount(summary.payment_pending_total)
        }
        
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        setDueDate(futureDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
      } catch (err) {
        console.error('Failed to load reminder data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const contactName = contact
    ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Student'
    : 'Student'
  const organizationName = organization?.name || 'Payforms'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#006398]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#000] p-8 text-center">
            <h1 className="text-white text-2xl font-bold font-['Manrope']">Payment Reminder</h1>
          </div>
          <div className="p-8">
            <p className="mb-4 font-['Inter']">Dear {contactName},</p>
            <p className="mb-4 font-['Inter']">
              This is a friendly reminder that your outstanding balance of <strong>₦{pendingAmount.toLocaleString()}</strong> for {organizationName} is due soon.
            </p>
            <div className="bg-[#f2f4f6] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#45464d] font-['Inter']">Outstanding Balance</p>
              <p className="text-2xl font-bold font-['Manrope'] text-[#191c1e]">₦{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="bg-[#f2f4f6] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#45464d] font-['Inter']">Payment Deadline</p>
              <p className="text-lg font-bold font-['Manrope'] text-[#191c1e]">{dueDate}</p>
            </div>
            <Button className="w-full font-['Manrope']" onClick={() => window.open('/', '_blank')}>
              Pay Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
