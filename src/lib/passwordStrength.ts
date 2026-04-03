export interface PasswordValidationResult {
  isValid: boolean
  score: number
  feedback: string[]
  requirements: PasswordRequirement[]
}

export interface PasswordRequirement {
  id: string
  label: string
  met: boolean
}

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128

const COMMON_PASSWORDS = [
  'password', 'password123', 'password1234', 'qwerty', 'qwerty123',
  'abc123', '123456', '12345678', '123456789', '1234567890',
  'admin', 'admin123', 'letmein', 'welcome', 'welcome123',
  'monkey', 'dragon', 'master', 'login', 'passw0rd', 'p@ssword'
]

function checkCommonPassword(password: string): boolean {
  const lower = password.toLowerCase()
  return COMMON_PASSWORDS.some(common => 
    lower === common || lower.includes(common)
  )
}

function calculateStrength(password: string): number {
  let score = 0
  
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.6) score += 1
  if (uniqueChars >= password.length * 0.8) score += 1
  
  if (/(.)\1{2,}/.test(password)) score -= 1
  if (/^[a-zA-Z]+$/.test(password)) score -= 1
  if (/^[0-9]+$/.test(password)) score -= 2
  
  return Math.max(0, Math.min(10, score))
}

function getStrengthLabel(score: number): string {
  if (score <= 2) return 'Very Weak'
  if (score <= 4) return 'Weak'
  if (score <= 6) return 'Fair'
  if (score <= 8) return 'Strong'
  return 'Very Strong'
}

function getStrengthColor(score: number): string {
  if (score <= 2) return 'bg-red-500'
  if (score <= 4) return 'bg-orange-500'
  if (score <= 6) return 'bg-yellow-500'
  if (score <= 8) return 'bg-green-500'
  return 'bg-emerald-500'
}

export function validatePassword(password: string): PasswordValidationResult {
  const feedback: string[] = []
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: password.length >= MIN_PASSWORD_LENGTH
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter',
      met: /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter',
      met: /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'At least one number',
      met: /[0-9]/.test(password)
    },
    {
      id: 'special',
      label: 'At least one special character',
      met: /[^a-zA-Z0-9]/.test(password)
    },
    {
      id: 'not-common',
      label: 'Not a common password',
      met: !checkCommonPassword(password)
    }
  ]

  requirements.forEach(req => {
    if (!req.met) {
      feedback.push(req.label)
    }
  })

  if (password.length > MAX_PASSWORD_LENGTH) {
    feedback.push(`Password must be less than ${MAX_PASSWORD_LENGTH} characters`)
  }

  if (checkCommonPassword(password)) {
    feedback.unshift('Please choose a more unique password')
  }

  const score = calculateStrength(password)
  const allRequirementsMet = requirements.every(r => r.met) && 
                              password.length <= MAX_PASSWORD_LENGTH

  return {
    isValid: allRequirementsMet,
    score,
    feedback,
    requirements
  }
}

export function getPasswordStrengthDisplay(password: string): {
  label: string
  color: string
  percentage: number
} {
  const score = calculateStrength(password)
  const percentage = Math.round((score / 10) * 100)
  
  return {
    label: getStrengthLabel(score),
    color: getStrengthColor(score),
    percentage
  }
}

export function isPasswordMatch(password: string, confirmPassword: string): boolean {
  if (!password || !confirmPassword) return false
  return password === confirmPassword
}
