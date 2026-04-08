import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Wallet, 
  BarChart3, 
  Globe, 
  Menu, 
  X, 
  Play,
  CheckCircle,
  ChevronRight,
  Building2,
  Shield,
  Zap,
  Clock,
  Users,
  ArrowRight,
  Lock,
  CreditCard,
  UsersIcon
} from 'lucide-react'
import { Logo } from '@/components/Logo'

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const navItems = [
    { label: 'Product', href: '#' },
    { label: 'Solutions', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Resources', href: '#' },
  ]

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
          <div className="mt-8 flex flex-col gap-4">
            {navItems.map((item) => (
              <a 
                key={item.label}
                href={item.href}
                className="text-slate-900 font-semibold text-lg py-2 hover:text-blue-600 transition-colors"
                onClick={onClose}
              >
                {item.label}
              </a>
            ))}
            <hr className="my-4 border-slate-200" />
            <Link to="/login" onClick={onClose}>
              <button className="w-full text-left text-slate-600 font-semibold py-2 hover:text-blue-600 transition-colors">
                Login
              </button>
            </Link>
            <Link to="/signup" onClick={onClose}>
              <button className="w-full bg-slate-900 text-white px-5 py-3 rounded-lg font-bold text-center hover:bg-slate-800 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export function PayformsLandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    setHeroLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite; 
        }
        .animate-pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
        
        .hero-badge {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
        .hero-title {
          animation: slide-up 0.6s ease-out 0.4s both;
        }
        .hero-subtitle {
          animation: slide-up 0.6s ease-out 0.6s both;
        }
        .hero-actions {
          animation: slide-up 0.6s ease-out 0.8s both;
        }
        .hero-social {
          animation: slide-up 0.6s ease-out 1s both;
        }
        .hero-image {
          animation: scale-in 0.8s ease-out 0.3s both;
        }
        
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #0f172a;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        
        .feature-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }
        .feature-icon {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .cta-gradient {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          background-size: 200% 200%;
          animation: gradient-shift 10s ease infinite;
        }
        
        .btn-primary {
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-primary:hover::before {
          opacity: 1;
        }
        
        .counter-item {
          animation: slide-up 0.5s ease-out both;
        }
        .counter-item:nth-child(1) { animation-delay: 0.1s; }
        .counter-item:nth-child(2) { animation-delay: 0.2s; }
        .counter-item:nth-child(3) { animation-delay: 0.3s; }
        .counter-item:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <Logo variant="default" size="md" />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-slate-900 font-bold border-b-2 border-slate-900 pb-1 font-headline text-sm tracking-tight" href="#">Product</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors font-headline text-sm tracking-tight nav-link" href="#">Solutions</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors font-headline text-sm tracking-tight nav-link" href="#">Pricing</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors font-headline text-sm tracking-tight nav-link" href="#">Resources</a>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <button className="text-slate-500 font-headline font-semibold text-sm hover:text-slate-900 transition-all">Login</button>
            </Link>
            <Link to="/signup">
              <button className="bg-slate-900 text-white px-5 py-2 rounded-md font-headline font-semibold text-sm hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20">
                Get Started
              </button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-100 py-24 md:py-32">
          {/* Background Decorations */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Hero Text */}
            <div className="z-10">
              <span className="hero-badge inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
                <Building2 className="w-4 h-4 mr-2" />
                Institutional Ledger System
              </span>
              
              <h1 className="hero-title font-headline font-extrabold text-4xl sm:text-5xl md:text-7xl text-slate-900 leading-[1.1] tracking-tighter mb-8">
                Precision Payments for{' '}
                <span className="text-blue-600 relative">
                  Modern Education.
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-blue-600/30 rounded-full" />
                </span>
              </h1>
              
              <p className="hero-subtitle text-slate-600 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-body">
                The Architectural Ledger for schools and universities. Create forms, automate reconciliations, and manage student tuition with surgical precision.
              </p>
              
              <div className="hero-actions flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <button className="btn-primary bg-slate-900 text-white px-8 py-4 rounded-md font-headline font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-md font-headline font-bold text-lg text-slate-900 hover:bg-slate-200 transition-all group">
                  <div className="relative">
                    <Play className="w-8 h-8 text-blue-600" fill="currentColor" />
                    <span className="absolute inset-0 bg-blue-600 rounded-full animate-pulse-ring" />
                  </div>
                  Watch Demo
                </button>
              </div>
              
              <div className="hero-social mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-white shadow-md" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User 1" />
                  <img className="w-10 h-10 rounded-full border-2 border-white shadow-md" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="User 2" />
                  <img className="w-10 h-10 rounded-full border-2 border-white shadow-md" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User 3" />
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm font-semibold">Trusted by 500+ Institutions</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl" />
              <div className="hero-image relative glass-effect p-4 rounded-xl shadow-2xl overflow-hidden border border-white/20 animate-float">
                <img 
                  className="rounded-lg shadow-inner w-full object-cover aspect-[4/3]" 
                  src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop" 
                  alt="University campus" 
                />
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-xl border border-slate-200/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-headline font-bold text-slate-900">Tuition Payment Received</span>
                    <span className="text-green-800 bg-green-100 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-3/4 rounded-full transition-all duration-500" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-500 font-medium">
                    <span>Batch #44219</span>
                    <span className="font-bold text-slate-700">$14,200.00 / $18,000.00</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats Cards */}
              <div className="absolute -left-4 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-slate-200/50 animate-float-slow hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Processed Today</p>
                    <p className="font-bold text-slate-900">$2.4M+</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-slate-200/50 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Active Students</p>
                    <p className="font-bold text-slate-900">45,000+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="py-24 bg-slate-200">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <AnimatedSection className="text-center mb-20">
              <h2 className="font-headline font-bold text-4xl text-slate-900 mb-4">Payforms Advantage</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">Precision-engineered tools to eliminate administrative overhead and maximize financial transparency.</p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
              {/* Form Builder */}
              <AnimatedSection className="md:col-span-8" delay={0}>
                <div className="feature-card bg-white p-8 rounded-xl h-full flex flex-col justify-between border border-slate-200/50 group overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="feature-icon w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                      <FileText className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="font-headline font-bold text-2xl text-slate-900 mb-2">Form Builder</h3>
                    <p className="text-slate-600 max-w-md">Design complex institutional forms with integrated payment logic. No code required, strictly professional.</p>
                  </div>
                  <div className="relative h-24 mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200/50 overflow-hidden">
                    <div className="flex gap-4 mb-3">
                      <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-20 h-8 bg-blue-600/10 rounded border-2 border-dashed border-blue-200 flex items-center justify-center">
                        <span className="text-blue-500 text-xs font-medium">+ Add Field</span>
                      </div>
                      <div className="w-20 h-8 bg-slate-200 rounded animate-pulse" />
                      <div className="w-20 h-8 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                </div>
              </AnimatedSection>

              {/* Paystack Integration */}
              <AnimatedSection className="md:col-span-4" delay={100}>
                <div className="feature-card bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-xl h-full flex flex-col justify-between relative overflow-hidden group">
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="feature-icon w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Wallet className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      Native Flow
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-headline font-bold text-2xl mb-2">Paystack Integration</h3>
                    <p className="text-white/80 text-sm leading-relaxed">One-click deployment to the world's leading payment gateway for frictionless transactions.</p>
                  </div>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                </div>
              </AnimatedSection>

              {/* Real-time Analytics */}
              <AnimatedSection className="md:col-span-4" delay={200}>
                <div className="feature-card bg-white p-8 rounded-xl h-full flex flex-col justify-between border border-slate-200/50 group overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="feature-icon w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                      <BarChart3 className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Real-time Analytics</h3>
                    <p className="text-slate-600 text-sm">Visualize cashflow and student enrollment trends in real-time.</p>
                  </div>
                  <div className="relative z-10 flex items-end gap-2 h-16 mt-6">
                    <div className="w-full bg-blue-100 h-1/3 rounded-t-sm group-hover:h-1/2 transition-all duration-500" />
                    <div className="w-full bg-blue-200 h-1/2 rounded-t-sm group-hover:h-3/4 transition-all duration-500" style={{ transitionDelay: '100ms' }} />
                    <div className="w-full bg-blue-600 h-full rounded-t-sm group-hover:h-[90%] transition-all duration-500" style={{ transitionDelay: '200ms' }} />
                    <div className="w-full bg-blue-400 h-2/3 rounded-t-sm group-hover:h-4/5 transition-all duration-500" style={{ transitionDelay: '300ms' }} />
                    <div className="w-full bg-blue-300 h-1/2 rounded-t-sm group-hover:h-3/4 transition-all duration-500" style={{ transitionDelay: '400ms' }} />
                    <div className="w-full bg-blue-200 h-1/3 rounded-t-sm group-hover:h-1/2 transition-all duration-500" style={{ transitionDelay: '500ms' }} />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full" />
                </div>
              </AnimatedSection>

              {/* Security */}
              <AnimatedSection className="md:col-span-4" delay={300}>
                <div className="feature-card bg-white p-8 rounded-xl h-full flex flex-col justify-between border border-slate-200/50 group overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="feature-icon w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                      <Shield className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Bank-Grade Security</h3>
                    <p className="text-slate-600 text-sm">AES-256 encryption, PCI-DSS compliant, and SOC 2 certified infrastructure.</p>
                  </div>
                  <div className="relative z-10 flex flex-wrap gap-2 mt-6">
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">PCI-DSS L1</span>
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">SOC 2</span>
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">AES-256</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-bl-full" />
                </div>
              </AnimatedSection>

              {/* Speed */}
              <AnimatedSection className="md:col-span-4" delay={400}>
                <div className="feature-card bg-white p-8 rounded-xl h-full flex flex-col justify-between border border-slate-200/50 group overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="feature-icon w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                      <Zap className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Lightning Fast</h3>
                    <p className="text-slate-600 text-sm">Sub-second transaction processing with 99.99% uptime guarantee.</p>
                  </div>
                  <div className="relative z-10 flex items-center gap-3 mt-6">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 w-[99.9%] rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-purple-600">99.99%</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full" />
                </div>
              </AnimatedSection>

              {/* Global Reach */}
              <AnimatedSection className="md:col-span-12" delay={500}>
                <div className="feature-card bg-slate-300 p-8 rounded-xl h-full flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group">
                  <div className="flex-1 relative z-10">
                    <div className="feature-icon w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4 inline-flex">
                      <Globe className="w-7 h-7 text-slate-700" />
                    </div>
                    <h3 className="font-headline font-bold text-2xl text-slate-900 mb-2">Global Institutional Standards</h3>
                    <p className="text-slate-700 leading-relaxed">Built to the rigorous standards of international banking and educational compliance across 45+ countries.</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                        <span className="text-sm text-slate-600 font-medium">24/7 Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-slate-600" />
                        <span className="text-sm text-slate-600 font-medium">Secure Transit</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 hidden sm:block relative z-10">
                    <div className="relative overflow-hidden rounded-lg shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                      <img 
                        className="w-full h-48 object-cover"
                        src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=300&fit=crop" 
                        alt="Modern architecture" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                    </div>
                  </div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-slate-400/20 rounded-full blur-3xl" />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-slate-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <AnimatedSection className="text-center mb-16">
              <h2 className="font-headline font-bold text-4xl text-slate-900 mb-4">How It Works</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">Get started in minutes with our streamlined setup process</p>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection className="text-center" delay={0}>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Create Your Form</h3>
                <p className="text-slate-600">Build professional payment forms with our drag-and-drop builder in minutes.</p>
              </AnimatedSection>
              
              <AnimatedSection className="text-center" delay={150}>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Share With Students</h3>
                <p className="text-slate-600">Send payment links to students via email, SMS, or your institution's portal.</p>
              </AnimatedSection>
              
              <AnimatedSection className="text-center" delay={300}>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Track & Reconcile</h3>
                <p className="text-slate-600">Monitor payments in real-time with automated reconciliation and reporting.</p>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-gradient py-24 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <AnimatedSection>
              <h2 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight">
                Ready to evolve your institutional finances?
              </h2>
              <p className="text-white/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
                Join the ranks of leading universities managing billions with Payforms.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <button className="btn-primary group bg-white text-slate-900 px-10 py-5 rounded-lg font-headline font-extrabold text-lg hover:bg-slate-100 transition-all shadow-2xl flex items-center justify-center gap-2 mx-auto sm:mx-0">
                    Get Started Now
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="border-2 border-white/30 text-white px-10 py-5 rounded-lg font-headline font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 mx-auto sm:mx-0">
                  Speak to Sales
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 w-full border-t border-slate-200/50">
        <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="font-headline font-extrabold text-xl text-slate-900">Payforms</div>
            <div className="font-sans text-xs uppercase tracking-widest text-slate-400">
              © {new Date().getFullYear()} Payforms Inc. Built with Precision.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-all duration-300" href="#">Privacy</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-all duration-300" href="#">Terms</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-all duration-300" href="#">Security</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-all duration-300" href="#">Status</a>
            <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline underline-offset-4 transition-all duration-300" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function ForgeProtocol() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
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
          <div className="flex flex-wrap justify-between items-center gap-4 mb-12">
            <div className="text-center flex-1 min-w-[120px]">
              <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <p className="font-bold">Form Submission</p>
              <p className="text-xs text-slate-500">Customer submits payment</p>
            </div>

            <ChevronRight className="h-8 w-8 text-slate-300 flex-shrink-0" />

            <div className="text-center flex-1 min-w-[120px]">
              <div className="w-20 h-20 bg-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="h-10 w-10 text-blue-700" />
              </div>
              <p className="font-bold">Tokenization</p>
              <p className="text-xs text-slate-500">Secure data encryption</p>
            </div>

            <ChevronRight className="h-8 w-8 text-slate-300 flex-shrink-0" />

            <div className="text-center flex-1 min-w-[120px]">
              <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-10 w-10 text-green-600" />
              </div>
              <p className="font-bold">Processing</p>
              <p className="text-xs text-slate-500">Gateway integration</p>
            </div>

            <ChevronRight className="h-8 w-8 text-slate-300 flex-shrink-0" />

            <div className="text-center flex-1 min-w-[120px]">
              <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <p className="font-bold">Confirmation</p>
              <p className="text-xs text-slate-500">Payment complete</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
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
