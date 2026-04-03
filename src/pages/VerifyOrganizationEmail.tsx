import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { Loader2 } from 'lucide-react'

export function VerifyOrganizationEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'already-used'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid verification link')
      return
    }

    const verifyEmail = async () => {
      try {
        await authService.verifyOrganizationEmail(token)
        setStatus('success')
      } catch (err: unknown) {
        if (err instanceof Error) {
          const message = err.message.toLowerCase()
          if (message.includes('expired')) {
            setStatus('expired')
          } else if (message.includes('already') || message.includes('used')) {
            setStatus('already-used')
          } else {
            setStatus('error')
            setErrorMessage(err.message)
          }
        } else {
          setStatus('error')
          setErrorMessage('Verification failed')
        }
      }
    }

    verifyEmail()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
        <header className="w-full top-0 bg-slate-50 flex justify-between items-center h-16 px-8">
          <div className="font-headline text-lg font-bold tracking-tight text-slate-900">
            Payforms
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl p-10 text-center shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mb-4">Email Verified!</h1>
              <p className="text-slate-500 mb-8">
                Your organization email has been verified successfully. You can now access your dashboard.
              </p>

              <Link 
                to="/login" 
                className="block w-full py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
        <header className="w-full top-0 bg-slate-50 flex justify-between items-center h-16 px-8">
          <div className="font-headline text-lg font-bold tracking-tight text-slate-900">
            Payforms
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl p-10 text-center shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mb-4">Link Expired</h1>
              <p className="text-slate-500 mb-8">
                This verification link has expired. Please request a new one.
              </p>

              <button 
                onClick={async () => {
                  try {
                    await authService.requestEmailVerification()
                  } catch {}
                }}
                className="w-full py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Resend Verification Email
              </button>
              
              <Link 
                to="/login" 
                className="block mt-4 text-slate-500 hover:text-slate-700 text-sm"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'already-used') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
        <header className="w-full top-0 bg-slate-50 flex justify-between items-center h-16 px-8">
          <div className="font-headline text-lg font-bold tracking-tight text-slate-900">
            Payforms
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl p-10 text-center shadow-lg">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mb-4">Already Verified</h1>
              <p className="text-slate-500 mb-8">
                This email has already been verified. Please log in to your account.
              </p>

              <Link 
                to="/login" 
                className="block w-full py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <header className="w-full top-0 bg-slate-50 flex justify-between items-center h-16 px-8">
        <div className="font-headline text-lg font-bold tracking-tight text-slate-900">
          Payforms
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl p-10 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-4">Verification Failed</h1>
            <p className="text-slate-500 mb-8">
              {errorMessage || 'An error occurred while verifying your email.'}
            </p>

            <Link 
              to="/login" 
              className="block w-full py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
