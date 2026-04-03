import { Link } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '@/services/authService'
import { Loader2 } from 'lucide-react'

export function EmailVerifiedSuccess() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      {/* Header */}
      <header className="bg-slate-50 w-full top-0 flex justify-between items-center px-12 py-6 max-w-full">
        <div className="text-lg font-bold tracking-tighter text-slate-900 font-headline uppercase">
          Architectural Ledger
        </div>
        <div className="flex items-center gap-8 font-sans text-sm tracking-tight">
          <span className="text-slate-400 font-label uppercase tracking-widest text-[10px]">Institutional Grade Identity</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200 opacity-10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-green-400 opacity-10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="glass-effect rounded-xl p-10 flex flex-col items-center text-center shadow-[0_40px_80px_-20px_rgba(25,28,30,0.04)] border border-white/20">
            {/* Success Icon */}
            <div className="mb-8 relative">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full bg-slate-900/10 scale-150 animate-pulse"></div>
            </div>

            {/* Content */}
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Email Verified
            </h1>
            <p className="text-slate-500 font-body text-base leading-relaxed mb-10 max-w-xs">
              Your identity has been confirmed via the <span className="font-semibold text-slate-900">Forge Protocol</span>. You can now access your institutional dashboard.
            </p>

            {/* Action */}
            <div className="w-full space-y-4">
              <Link to="/login" className="block w-full py-4 bg-slate-900 text-white rounded-md font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2">
                Proceed to Login
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Meta/Status Badge */}
            <div className="mt-12 flex items-center gap-2 px-3 py-1 bg-green-900 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
              <span className="font-label text-[10px] font-bold uppercase tracking-[0.1em] text-green-100">
                Status: Identity Synced
              </span>
            </div>
          </div>

          {/* Secondary Data Strip */}
          <div className="mt-8 bg-slate-100 px-6 py-3 rounded-lg flex justify-between items-center opacity-70">
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="font-label text-[10px] uppercase tracking-wider text-slate-500 font-medium">System Compliance Verified</span>
            </div>
            <span className="font-label text-[10px] uppercase tracking-wider text-slate-500">REF: 882-AL-04</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-transparent flex flex-col items-center gap-4 py-12 w-full">
        <div className="font-sans text-xs uppercase tracking-widest text-slate-500 text-center px-4">
          © 2024 Architectural Ledger. All rights reserved. Precise Monolith Institutional Grade.
        </div>
        <div className="flex gap-8">
          <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-opacity" href="#">Privacy Policy</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-opacity" href="#">Terms of Service</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-opacity" href="#">Compliance</a>
        </div>
      </footer>
    </div>
  )
}

export function EmailVerifiedSuccessView() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
        }
        .ambient-glow {
          box-shadow: 0 0 40px 0 rgba(25, 28, 30, 0.04);
        }
      `}</style>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
        
        <div className="z-10 w-full max-w-md">
          {/* Brand Anchor */}
          <div className="flex justify-center mb-12">
            <span className="font-headline text-xl font-extrabold tracking-tight text-slate-900">Forge Protocol</span>
          </div>

          {/* Success Card */}
          <div className="glass-panel ambient-glow rounded-xl p-10 flex flex-col items-center text-center">
            {/* Checkmark Icon */}
            <div className="w-16 h-16 rounded-full bg-green-900 flex items-center justify-center mb-8 border border-green-600/20">
              <svg className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>

            {/* Text Content */}
            <div className="space-y-4 mb-10">
              <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900">Email Verified Successfully</h1>
              <p className="text-slate-500 font-body leading-relaxed max-w-[280px] mx-auto">
                Your identity has been confirmed. You can now access your institutional dashboard.
              </p>
            </div>

            {/* Actions */}
            <div className="w-full space-y-4">
              <Link to="/dashboard" className="block w-full py-4 bg-slate-900 text-white font-headline font-semibold rounded-md hover:opacity-90 transition-all duration-200 shadow-sm text-center">
                Proceed to Dashboard
              </Link>
              <a className="inline-block text-slate-500 font-label text-xs uppercase tracking-widest hover:text-slate-900 transition-colors" href="#">
                View Security Logs
              </a>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-500">Institutional Grade Security</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center py-6 px-8 gap-4 opacity-80 hover:opacity-100 transition-all">
        <div className="order-2 md:order-1">
          <span className="font-sans text-xs tracking-wide uppercase text-slate-500">© 2024 Forge Protocol. All rights reserved. Institutional Grade Security.</span>
        </div>
        <div className="order-1 md:order-2 flex gap-6">
          <a className="font-sans text-xs tracking-wide uppercase text-slate-500 hover:text-slate-900 transition-all hover:underline" href="#">Privacy Policy</a>
          <a className="font-sans text-xs tracking-wide uppercase text-slate-500 hover:text-slate-900 transition-all hover:underline" href="#">Terms of Service</a>
          <a className="font-sans text-xs tracking-wide uppercase text-slate-500 hover:text-slate-900 transition-all hover:underline" href="#">Security Disclosure</a>
        </div>
      </footer>
    </div>
  )
}

export function EmailVerificationErrorView() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
        }
        .premium-shadow {
          box-shadow: 0 40px 100px -20px rgba(25, 28, 30, 0.04);
        }
      `}</style>

      {/* Header */}
      <header className="w-full top-0 bg-slate-50 flex justify-between items-center h-16 px-8 max-w-full">
        <div className="text-lg font-bold tracking-tight text-slate-900 font-headline uppercase tracking-widest">
          Forge Protocol
        </div>
        <div className="flex items-center gap-6">
          <svg className="h-6 w-6 text-slate-500 cursor-pointer hover:text-slate-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-200 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-300 blur-[100px]"></div>
        </div>

        {/* Verification Card */}
        <div className="w-full max-w-[480px] glass-effect border border-white/20 rounded-xl premium-shadow p-10 md:p-14 text-center">
          {/* Icon Cluster */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 blur-2xl rounded-full"></div>
              <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center border border-slate-200/50">
                <svg className="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Typography */}
          <h1 className="font-headline text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Verification Link Expired
          </h1>
          <p className="text-slate-500 font-body leading-relaxed mb-10 max-w-[320px] mx-auto text-sm">
            The security token for this link has expired for your protection. Please request a new verification email.
          </p>

          {/* Actions */}
          <div className="space-y-6">
            <button className="w-full py-4 px-6 bg-slate-900 text-white font-headline font-semibold rounded-md shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition-all duration-300 flex items-center justify-center gap-2">
              Resend Verification Link
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <div>
              <Link to="/login" className="inline-block font-label text-xs uppercase tracking-widest text-slate-400 font-semibold hover:underline decoration-2 underline-offset-4 transition-all opacity-80 hover:opacity-100">
                Return to Login
              </Link>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 pt-8 border-t border-slate-200/50 flex items-center justify-center gap-2">
            <div className="bg-green-900/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-[10px] uppercase tracking-wider font-bold text-green-700">Institutional Grade Security</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 bg-slate-50 flex flex-col md:flex-row justify-between items-center py-6 px-8 gap-4">
        <div className="font-sans text-xs tracking-wide uppercase text-slate-500">
          © 2024 Forge Protocol. All rights reserved. Institutional Grade Security.
        </div>
        <nav className="flex gap-6">
          <a className="font-sans text-xs tracking-wide uppercase text-slate-500 hover:underline transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
          <a className="font-sans text-xs tracking-wide uppercase text-slate-500 hover:underline transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          <a className="font-sans text-xs tracking-wide uppercase text-slate-500 hover:underline transition-all opacity-80 hover:opacity-100" href="#">Security Disclosure</a>
        </nav>
      </footer>
    </div>
  )
}

export function EmailVerificationExpired() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
        }
        .ambient-glow {
          box-shadow: 0 0 40px 0 rgba(25, 28, 30, 0.04);
        }
      `}</style>

      {/* Header - Suppressed navigation */}
      <header className="bg-slate-50 w-full top-0 flex justify-between items-center px-12 py-6 max-w-full">
        <div className="text-lg font-bold tracking-tighter text-slate-900 font-headline">
          Architectural Ledger
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[60%] rounded-full bg-blue-200 opacity-20 blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[50%] rounded-full bg-blue-100 opacity-10 blur-[100px]"></div>
        </div>

        {/* Main Content Card */}
        <section className="relative z-10 max-w-md w-full">
          <div className="bg-white glass-effect rounded-xl ambient-glow p-10 flex flex-col items-center text-center space-y-8">
            {/* Icon Container */}
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>
              </svg>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900">
                Verification Link Expired
              </h1>
              <p className="text-slate-500 font-body leading-relaxed text-sm px-4">
                The security token for this link has expired for your protection. Please request a new verification email to continue.
              </p>
            </div>

            {/* Action Cluster */}
            <div className="w-full space-y-4 pt-4">
              <button className="w-full bg-slate-900 text-white font-semibold py-4 rounded-md transition-all hover:opacity-90 active:scale-[0.98] shadow-sm">
                Resend Verification Link
              </button>
              <Link to="/login" className="block w-full text-slate-400 font-medium py-2 hover:underline transition-all text-center">
                Return to Login
              </Link>
            </div>

            {/* Trust Indicator */}
            <div className="pt-6 border-t border-slate-200/50 w-full">
              <div className="flex items-center justify-center gap-2 py-1 px-3 mx-auto w-fit rounded-full bg-green-900">
                <svg className="h-4 w-4 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="font-label text-[10px] uppercase tracking-widest text-green-100 font-semibold">Institutional Grade Security</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-transparent flex flex-col items-center gap-4 py-12 w-full">
        <div className="flex gap-8">
          <a className="font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-opacity" href="#">Privacy Policy</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-opacity" href="#">Terms of Service</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-opacity" href="#">Compliance</a>
        </div>
        <p className="font-sans text-xs uppercase tracking-widest text-slate-500">
          © 2024 Architectural Ledger. All rights reserved. Precise Monolith Institutional Grade.
        </p>
      </footer>
    </div>
  )
}

export function EmailVerificationAlreadyUsed() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="w-full flex justify-between items-center px-12 py-8">
        <div className="text-lg font-bold tracking-tighter text-slate-900 font-headline">
          Architectural Ledger
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="relative w-full max-w-md">
          {/* Subtle Background */}
          <div className="absolute inset-0 bg-blue-200/10 blur-3xl -z-10 rounded-full"></div>

          {/* Central Card */}
          <div className="bg-white rounded-xl p-10 md:p-12 shadow-[0px_40px_40px_rgba(25,28,30,0.04)] border border-slate-200/50 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-8 w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
            </div>

            {/* Headline */}
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
              Link Already Used
            </h1>

            {/* Subtext */}
            <p className="text-slate-500 font-body text-base leading-relaxed mb-10 max-w-xs">
              This verification link has already been activated. If you have not yet logged in, please use your credentials or reset your security key.
            </p>

            {/* Primary Action */}
            <div className="w-full space-y-4">
              <Link to="/login" className="block w-full py-4 px-8 bg-slate-900 text-white font-headline font-semibold text-sm rounded-md transition-all hover:opacity-90 text-center">
                Go to Login Page
              </Link>
              <button className="text-slate-400 font-label text-xs uppercase tracking-widest font-semibold hover:underline transition-all">
                Reset Security Key
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 flex items-center gap-2 px-4 py-2 bg-green-900 rounded-full">
              <svg className="h-4 w-4 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-[10px] font-label uppercase tracking-widest text-green-100 font-bold">
                Institutional Grade Security
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-4 py-12 w-full">
        <div className="flex gap-8 mb-4">
          <a className="font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-opacity" href="#">Privacy Policy</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-opacity" href="#">Terms of Service</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-opacity" href="#">Compliance</a>
        </div>
        <p className="font-sans text-xs uppercase tracking-widest text-slate-400">
          © 2024 Architectural Ledger. All rights reserved. Precise Monolith Institutional Grade.
        </p>
      </footer>
    </div>
  )
}

export function VerifyYourEmailPrompt() {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleResend = async () => {
    setIsResending(true)
    setResendError('')
    try {
      await authService.requestEmailVerification()
      setResendSuccess(true)
    } catch (err: unknown) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Inter', sans-serif; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      {/* Header */}
      <header className="w-full top-0 bg-slate-50 flex justify-between items-center h-16 px-8 max-w-full">
        <div className="font-headline text-lg font-bold tracking-tight text-slate-900">
          Forge Protocol
        </div>
        <div className="flex items-center gap-4">
          <svg className="h-6 w-6 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Verify Card */}
          <div className="bg-white glass-panel rounded-xl p-10 text-center shadow-[0_40px_80px_-15px_rgba(25,28,30,0.04)] relative overflow-hidden group">
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 to-blue-500"></div>

            {/* Email Icon */}
            <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
              <svg className="h-10 w-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
              </svg>
            </div>

            {/* Typography */}
            <h1 className="font-headline text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
              Check your inbox
            </h1>
            <p className="text-slate-500 text-base mb-10 leading-relaxed px-2">
              We've sent a verification link to your work email. Please click the link to confirm your account and access the <span className="font-semibold text-slate-900">Forge Protocol</span> dashboard.
            </p>

            {/* Actions */}
            <div className="space-y-4">
              <button 
                onClick={handleResend}
                disabled={isResending || resendSuccess}
                className="w-full bg-slate-900 text-white font-semibold py-4 px-6 rounded-md transition-all hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : resendSuccess ? (
                  'Email Sent!'
                ) : (
                  'Resend Email'
                )}
              </button>
              {resendSuccess && (
                <p className="text-sm text-green-600">Check your inbox for a new verification email.</p>
              )}
              {resendError && (
                <p className="text-sm text-red-600">{resendError}</p>
              )}
              <div className="pt-4">
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:underline flex items-center justify-center gap-2 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Back to login page
                </Link>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/5 border border-green-600/10">
                <svg className="h-4 w-4 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 font-label">Institutional Grade Security</span>
              </div>
            </div>
          </div>

          {/* Contextual Information */}
          <p className="mt-8 text-center text-xs text-slate-500 tracking-wide font-label uppercase">
            Didn't receive an email? Check your spam folder or contact support.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center py-6 px-8 gap-4 bg-slate-50">
        <div className="text-slate-500 font-sans text-xs tracking-wide uppercase">
          © 2024 Forge Protocol. All rights reserved. Institutional Grade Security.
        </div>
        <div className="flex gap-6">
          <a className="text-slate-500 font-sans text-xs tracking-wide uppercase hover:underline transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
          <a className="text-slate-500 font-sans text-xs tracking-wide uppercase hover:underline transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          <a className="text-slate-500 font-sans text-xs tracking-wide uppercase hover:underline transition-all opacity-80 hover:opacity-100" href="#">Security Disclosure</a>
        </div>
      </footer>
    </div>
  )
}
