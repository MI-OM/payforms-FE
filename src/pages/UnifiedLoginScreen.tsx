import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function UnifiedLoginScreen() {
  const navigate = useNavigate()
  const [isAdminActive, setIsAdminActive] = useState(true)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-slate-900 mb-2">
            Payforms
          </h1>
          <p className="font-label text-xs uppercase tracking-widest text-slate-500 opacity-70">
            Architectural Ledger Protocol
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(25,28,30,0.08)] border border-white/20">
          {/* Auth Toggle */}
          <div className="flex p-1 bg-slate-200 rounded-xl mb-8">
            <button 
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-white shadow-sm text-slate-900 transition-all duration-200"
              onClick={() => setIsAdminActive(true)}
            >
              Admin / Staff
            </button>
            <button 
              className="flex-1 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all duration-200"
              onClick={() => setIsAdminActive(false)}
            >
              Contact / Student
            </button>
          </div>

          {/* Login Header */}
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm font-body">Access your unified financial dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="email">Work Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">alternate_email</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  required={true} 
                  type="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label text-xs uppercase tracking-wider font-bold text-slate-800 opacity-80" htmlFor="password">Security Key</label>
                <a className="text-xs font-semibold text-blue-500 hover:underline underline-offset-4" href="#">Reset?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-slate-200/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-body text-slate-900 placeholder:text-slate-400" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required={true} 
                  type="password"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-3">
              <input className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 bg-white" id="remember" type="checkbox"/>
              <label className="text-sm font-medium text-slate-500" htmlFor="remember">Stay authenticated for 30 days</label>
            </div>

            {/* Primary Action */}
            <button className="w-full py-4 bg-slate-900 text-white rounded-lg font-semibold text-sm tracking-wide shadow-xl shadow-slate-900/10 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group" type="submit">
              <span>Execute Sign In</span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </button>
          </form>

          {/* Trust Indicator */}
          <div className="mt-8 pt-8 border-t border-slate-200/50 flex items-center justify-center gap-2">
            <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="text-[10px] font-label uppercase tracking-[0.2em] text-green-700 font-bold">Forge Protocol Secured</span>
          </div>
        </div>

        {/* Secondary Navigation Footer */}
        <div className="mt-8 flex justify-center gap-6">
          <a className="font-label text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors" href="#">System Status</a>
          <a className="font-label text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors" href="#">Help Center</a>
          <a className="font-label text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors" href="#">Privacy</a>
        </div>
      </main>

      {/* Footer Copyright */}
      <footer className="mt-auto py-6 opacity-40">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
          © 2024 Payforms Inc. Built with Precision.
        </p>
      </footer>

      {/* Decorative Bottom Gradient */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 via-blue-500 to-green-400 opacity-50"></div>
    </div>
  )
}
