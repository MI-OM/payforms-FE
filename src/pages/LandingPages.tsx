import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ForgeProtocol() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Forge Protocol</h1>
              <p className="text-slate-500">Payment Flow Architecture</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2>Overview</h2>
            <p>
              The Forge Protocol is the underlying payment flow architecture that powers Payforms. 
              It ensures secure, reliable, and scalable payment processing for all transactions.
            </p>

            <h2>Key Features</h2>
            <ul>
              <li>PCI-DSS Level 1 compliant infrastructure</li>
              <li>Multi-currency support</li>
              <li>Automatic receipt generation</li>
              <li>Real-time transaction monitoring</li>
              <li>Fraud detection and prevention</li>
            </ul>

            <h2>Payment Flow</h2>
            <ol>
              <li>Customer initiates payment on form</li>
              <li>Payment details encrypted and tokenized</li>
              <li>Transaction submitted to payment gateway</li>
              <li>Gateway processes with card network</li>
              <li>Authorization returned to Payforms</li>
              <li>Receipt generated and sent to customer</li>
            </ol>

            <h2>Security Measures</h2>
            <p>
              All payment data is encrypted using AES-256 encryption. 
              We never store raw card numbers - only tokenized references.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArchitecturalLedgerAdminPaymentFlow() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Payment Flow Architecture</h1>
          <p className="text-slate-500">Visual representation of the payment processing pipeline</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-bold">Form Submission</p>
              <p className="text-xs text-slate-500">Customer submits payment</p>
            </div>

            <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-10 w-10 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-bold">Tokenization</p>
              <p className="text-xs text-slate-500">Secure data encryption</p>
            </div>

            <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="font-bold">Processing</p>
              <p className="text-xs text-slate-500">Gateway integration</p>
            </div>

            <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>

            <div className="text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold">Confirmation</p>
              <p className="text-xs text-slate-500">Payment complete</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">Security</h3>
              <p className="text-sm text-slate-500">AES-256 encryption for all data</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">Speed</h3>
              <p className="text-sm text-slate-500">Sub-second transaction processing</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">Reliability</h3>
              <p className="text-sm text-slate-500">99.99% uptime guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PayformsLandingPage() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <div className="text-xl font-bold tracking-tighter text-slate-900 font-headline">
            Payforms
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-slate-900 font-bold border-b-2 border-slate-900 pb-1 font-headline text-sm tracking-tight" href="#">Product</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors font-headline text-sm tracking-tight" href="#">Solutions</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors font-headline text-sm tracking-tight" href="#">Pricing</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors font-headline text-sm tracking-tight" href="#">Resources</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className="text-slate-500 font-headline font-semibold text-sm hover:text-slate-900 transition-all">Login</button>
            </Link>
            <Link to="/signup">
              <button className="bg-slate-900 text-white px-5 py-2 rounded-md font-headline font-semibold text-sm hover:bg-slate-800 transition-all">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-100 py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium uppercase tracking-widest mb-6">
                Institutional Ledger System
              </span>
              <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-slate-900 leading-[1.1] tracking-tighter mb-8">
                Precision Payments for <span className="text-blue-600">Modern Education.</span>
              </h1>
              <p className="text-slate-600 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-body">
                The Architectural Ledger for schools and universities. Create forms, automate reconciliations, and manage student tuition with surgical precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <button className="bg-slate-900 text-white px-8 py-4 rounded-md font-headline font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                    Get Started
                  </button>
                </Link>
                <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-md font-headline font-bold text-lg text-slate-900 hover:bg-slate-200 transition-all">
                  <span className="material-symbols-outlined text-2xl">play_circle</span>
                  Watch the Demo
                </button>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-slate-100" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User 1" />
                  <img className="w-10 h-10 rounded-full border-2 border-slate-100" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="User 2" />
                  <img className="w-10 h-10 rounded-full border-2 border-slate-100" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User 3" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Trusted by 500+ Institutions</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl"></div>
              <div className="relative glass-effect p-4 rounded-xl shadow-2xl overflow-hidden border border-white/20">
                <img 
                  className="rounded-lg shadow-inner w-full object-cover aspect-[4/3]" 
                  src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop" 
                  alt="University library" 
                />
                <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-xl border border-slate-200/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-headline font-bold text-slate-900">Tuition Payment Received</span>
                    <span className="text-green-800 bg-green-200 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Verified</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-3/4"></div>
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-slate-500 font-medium">
                    <span>Batch #44219</span>
                    <span>$14,200.00 / $18,000.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="py-24 bg-slate-200">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-20">
              <h2 className="font-headline font-bold text-4xl text-slate-900 mb-4">The Ledger Advantage</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Precision-engineered tools to eliminate administrative overhead and maximize financial transparency.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
              {/* Form Builder */}
              <div className="md:col-span-8 bg-white p-8 rounded-xl flex flex-col justify-between group overflow-hidden border border-slate-200/50 transition-all hover:-translate-y-1">
                <div>
                  <span className="material-symbols-outlined text-blue-600 text-4xl mb-6 block">description</span>
                  <h3 className="font-headline font-bold text-2xl text-slate-900 mb-2">Form Builder</h3>
                  <p className="text-slate-600 max-w-md">Design complex institutional forms with integrated payment logic. No code required, strictly professional.</p>
                </div>
                <div className="relative h-20 mt-4 bg-slate-100 rounded-lg p-2 border border-slate-200/50">
                  <div className="flex gap-2">
                    <div className="w-1/3 h-4 bg-white rounded-sm"></div>
                    <div className="w-2/3 h-4 bg-white rounded-sm"></div>
                  </div>
                  <div className="mt-2 w-full h-8 bg-slate-900 rounded-sm opacity-10"></div>
                </div>
              </div>

              {/* Paystack Integration */}
              <div className="md:col-span-4 bg-blue-600 text-white p-8 rounded-xl flex flex-col justify-between transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Native Flow</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-2xl mb-2">Paystack Integration</h3>
                  <p className="text-white/80 text-sm">One-click deployment to the world's leading payment gateway for frictionless transactions.</p>
                </div>
              </div>

              {/* Analytics */}
              <div className="md:col-span-4 bg-white p-8 rounded-xl flex flex-col justify-between border border-slate-200/50 transition-all hover:-translate-y-1">
                <div>
                  <span className="material-symbols-outlined text-blue-600 text-4xl mb-6 block">monitoring</span>
                  <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Real-time Analytics</h3>
                  <p className="text-slate-600 text-sm">Visualize cashflow and student enrollment trends in real-time.</p>
                </div>
                <div className="flex items-end gap-1 h-12">
                  <div className="w-full bg-blue-600/10 h-1/2 rounded-t-sm"></div>
                  <div className="w-full bg-blue-600/20 h-3/4 rounded-t-sm"></div>
                  <div className="w-full bg-blue-600 h-full rounded-t-sm"></div>
                  <div className="w-full bg-blue-600/40 h-2/3 rounded-t-sm"></div>
                </div>
              </div>

              {/* Global Reach */}
              <div className="md:col-span-8 bg-slate-300 p-8 rounded-xl flex items-center gap-8 overflow-hidden transition-all hover:-translate-y-1">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-2xl text-slate-900 mb-2">Global Institutional Standards</h3>
                  <p className="text-slate-700">Built to the rigorous standards of international banking and educational compliance.</p>
                </div>
                <div className="flex-1 hidden sm:block">
                  <img 
                    className="rounded-lg shadow-lg rotate-3 scale-110" 
                    src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop" 
                    alt="Modern architecture" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-headline font-extrabold text-4xl md:text-6xl mb-8 tracking-tighter">Ready to evolve your institutional finances?</h2>
            <p className="text-white/70 text-lg md:text-xl mb-12">Join the ranks of leading universities managing billions with Payforms.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <button className="bg-white text-slate-900 px-10 py-5 rounded-md font-headline font-extrabold text-xl hover:bg-slate-100 transition-all">
                  Get Started Now
                </button>
              </Link>
              <button className="border border-white/20 text-white px-10 py-5 rounded-md font-headline font-bold text-xl hover:bg-white/10 transition-all">
                Speak to Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 w-full border-t border-slate-200/50">
        <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="font-headline font-extrabold text-xl text-slate-900">Payforms</div>
            <div className="font-sans text-xs uppercase tracking-widest text-slate-400">
              © 2024 Payforms Inc. Built with Precision.
            </div>
          </div>
          <div className="flex gap-8">
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-opacity duration-300" href="#">Privacy Policy</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-opacity duration-300" href="#">Terms of Service</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-opacity duration-300" href="#">Security</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-opacity duration-300" href="#">Status</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-opacity duration-300" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
