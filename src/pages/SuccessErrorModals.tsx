import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function FormCreationSuccessModal() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">Form Created!</h3>
          <p className="text-slate-500 mb-6">Your new form "Q1 Invoice" has been created successfully.</p>
          <div className="space-y-3">
            <Button className="w-full">View Form</Button>
            <Button variant="secondary" className="w-full">Create Another</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormCreationErrorModal() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">Creation Failed</h3>
          <p className="text-slate-500 mb-6">There was an error creating your form. Please try again.</p>
          <div className="space-y-3">
            <Button className="w-full">Try Again</Button>
            <Button variant="secondary" className="w-full">Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UserSignUpSuccessModal() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .glass-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      {/* Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 opacity-5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-400 opacity-5 rounded-full blur-[150px]"></div>
      </div>

      {/* Blurred Background Card */}
      <section className="w-full max-w-6xl flex bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 opacity-40 grayscale pointer-events-none">
        <div className="w-full lg:w-1/2 p-12 lg:p-20">
          <div className="mb-12">
            <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-slate-900 mb-2">Payforms</h1>
            <p className="text-slate-500 font-label uppercase tracking-widest text-xs">Architectural Ledger</p>
          </div>
          <div className="space-y-8">
            <h2 className="font-headline font-bold text-3xl tracking-tight">Create Organization</h2>
            <div className="space-y-6">
              <div className="h-12 bg-slate-100 rounded-md"></div>
              <div className="h-12 bg-slate-100 rounded-md"></div>
              <div className="h-12 bg-slate-100 rounded-md"></div>
              <div className="h-14 bg-slate-900 rounded-md"></div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2 relative bg-slate-200">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-400/20"></div>
        </div>
      </section>

      {/* SUCCESS MODAL OVERLAY */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/30 glass-blur"></div>
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-[0_40px_100px_-20px_rgba(25,28,30,0.15)] overflow-hidden border border-white/20">
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-green-400"></div>
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-8 relative">
              <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <div className="absolute inset-0 border-2 border-blue-500/10 rounded-full animate-ping opacity-20"></div>
            </div>

            <h2 className="font-headline font-extrabold text-3xl tracking-tight text-slate-900 mb-4">
              Verification Email Sent
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-10 font-body">
              We've sent a secure link to your inbox. Please follow the instructions to finalize your <span className="font-semibold text-slate-900">Payforms</span> setup.
            </p>

            <div className="flex flex-col gap-4">
              <button className="w-full bg-slate-900 text-white font-headline font-bold py-4 px-8 rounded-md hover:bg-slate-600 transition-all duration-300 shadow-lg shadow-slate-900/10">
                Check Inbox
              </button>
              <Link to="/login">
                <button className="w-full text-slate-400 font-label font-semibold text-sm uppercase tracking-widest py-3 hover:text-slate-900 transition-colors">
                  Back to Login
                </button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200/50">
              <p className="text-slate-500 text-sm">
                Didn't receive an email? 
                <a className="text-blue-500 font-semibold hover:underline decoration-2 underline-offset-4 ml-1" href="#">Resend link</a>
              </p>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-slate-100 rounded-full opacity-50 z-[-1]"></div>
        </div>
      </div>
    </div>
  )
}

export function UserSignUpErrorModal() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      {/* Blurred Background */}
      <section className="w-full max-w-6xl flex bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 opacity-40 grayscale pointer-events-none">
        <div className="w-full lg:w-1/2 p-12 lg:p-20">
          <div className="mb-12">
            <h1 className="font-headline font-extrabold text-4xl tracking-tighter text-slate-900 mb-2">Payforms</h1>
            <p className="text-slate-500 font-label uppercase tracking-widest text-xs">Architectural Ledger</p>
          </div>
          <div className="space-y-8">
            <h2 className="font-headline font-bold text-3xl tracking-tight">Create Organization</h2>
            <div className="space-y-6">
              <div className="h-12 bg-slate-100 rounded-md"></div>
              <div className="h-12 bg-slate-100 rounded-md"></div>
              <div className="h-12 bg-slate-100 rounded-md"></div>
              <div className="h-14 bg-slate-900 rounded-md"></div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2 relative bg-slate-200">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-600/20"></div>
        </div>
      </section>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"></div>
        <div className="relative w-full max-w-lg glass-panel rounded-xl shadow-2xl overflow-hidden border border-white/20">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-red-400/40"></div>
          <div className="p-8 sm:p-12 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div className="h-[1px] flex-grow bg-slate-200/50"></div>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                Account Creation Failed
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed font-body">
                The requested action could not be completed. The provided email address may already be registered in our ledger, or a transient system error occurred during processing.
              </p>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200/50">
              <div className="flex justify-between items-center text-xs font-label uppercase tracking-widest text-slate-500/70">
                <span>Error Code</span>
                <span className="font-mono">ERR_DUPLICATE_ENTITY_409</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all hover:shadow-lg active:scale-[0.98]">
                Retry
              </button>
              <button className="flex-1 bg-slate-200 text-slate-900 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all hover:bg-slate-300 active:scale-[0.98]">
                Contact Support
              </button>
            </div>
          </div>
          <div className="px-8 pb-8 flex justify-center opacity-30">
            <span className="font-headline font-black text-xs uppercase tracking-[0.4em] text-slate-600">Payforms Protocol</span>
          </div>
        </div>
      </div>
    </div>
  )
}
