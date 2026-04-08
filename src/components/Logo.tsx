import { Link } from 'react-router-dom'

interface LogoProps {
  variant?: 'default' | 'dark' | 'light' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

const sizeClasses = {
  sm: { icon: 'h-8 w-auto', container: 'h-8' },
  md: { icon: 'h-10 w-auto', container: 'h-10' },
  lg: { icon: 'h-14 w-auto', container: 'h-14' },
  xl: { icon: 'h-20 w-auto', container: 'h-20' },
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = sizeClasses[size]
  
  return (
    <Link to="/" className="inline-flex">
      <img 
        src="/Payforms.png" 
        alt="Payforms" 
        className={`${sizes.icon} object-contain ${className}`}
      />
    </Link>
  )
}

export function LogoIcon({ size = 'md', className = '', asLink = true }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string, asLink?: boolean }) {
  const sizes = sizeClasses[size]
  
  const img = (
    <img 
      src="/Payforms.png" 
      alt="Payforms" 
      className={`${sizes.icon} object-contain ${className}`}
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

export function LogoWithText({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  return <Logo size={size} className={className} />
}
