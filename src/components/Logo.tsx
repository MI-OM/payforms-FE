import { Link } from 'react-router-dom'

interface LogoProps {
  variant?: 'default' | 'dark' | 'light' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  logoUrl?: string | null
}

const sizeClasses = {
  sm: { icon: 'h-8 w-auto', container: 'h-8' },
  md: { icon: 'h-10 w-auto', container: 'h-10' },
  lg: { icon: 'h-14 w-auto', container: 'h-14' },
  xl: { icon: 'h-20 w-auto', container: 'h-20' },
}

const DEFAULT_LOGO = '/Payforms.png'

export function Logo({ size = 'md', className = '', logoUrl }: LogoProps) {
  const sizes = sizeClasses[size]
  const logoSrc = logoUrl || DEFAULT_LOGO
  
  return (
    <Link to="/" className="inline-flex">
      <img 
        src={logoSrc} 
        alt="Payforms" 
        className={`${sizes.icon} object-contain ${className}`}
        onError={(e) => {
          if (logoUrl !== DEFAULT_LOGO) {
            (e.target as HTMLImageElement).src = DEFAULT_LOGO
          }
        }}
      />
    </Link>
  )
}

export function LogoIcon({ size = 'md', className = '', asLink = true, logoUrl }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string, asLink?: boolean, logoUrl?: string | null }) {
  const sizes = sizeClasses[size]
  const logoSrc = logoUrl || DEFAULT_LOGO
  
  const img = (
    <img 
      src={logoSrc} 
      alt="Payforms" 
      className={`${sizes.icon} object-contain ${className}`}
      onError={(e) => {
        if (logoUrl !== DEFAULT_LOGO) {
          (e.target as HTMLImageElement).src = DEFAULT_LOGO
        }
      }}
    />
  )
  
  if (asLink) {
    return (
      <Link to="/" className={`inline-flex ${className}`}>
        {img}
      </Link>
    )
  }
  
  return <>{img}</>
}

export function LogoWithText({ size = 'md', className = '', logoUrl }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string, logoUrl?: string | null }) {
  return <Logo size={size} className={className} logoUrl={logoUrl} />
}
