import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ShieldCheck, ShieldOff, Key, RefreshCw, AlertTriangle, CheckCircle, Loader2, Copy, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService, type TwoFactorStatus, type TwoFactorSetupResponse, type TwoFactorEnableResponse } from '@/services/authService'
import { ApiError } from '@/lib/apiClient'
import { toast } from '@/components/ui/use-toast'

type Step = 'status' | 'setup' | 'verify-setup' | 'disable' | 'regenerate'

export function TwoFactorSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<Step>('status')
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const data = await authService.get2FAStatus()
      setStatus(data)
    } catch (err) {
      console.error('Failed to load 2FA status', err)
      setError('Failed to load 2FA status')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSetup = async () => {
    setSaving(true)
    setError('')
    try {
      const data = await authService.setup2FA()
      setSetupData(data)
      setStep('verify-setup')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to start 2FA setup')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length < 6) {
      setError('Please enter a valid verification code')
      return
    }

    setSaving(true)
    setError('')
    try {
      const data = await authService.enable2FA(code)
      setRecoveryCodes(data.recovery_codes)
      setStep('status')
      loadStatus()
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled successfully.',
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid verification code')
      } else {
        setError('Failed to enable 2FA')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length < 6) {
      setError('Please enter a valid verification code')
      return
    }

    setSaving(true)
    setError('')
    try {
      await authService.disable2FA(code)
      setStep('status')
      loadStatus()
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.',
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid verification code')
      } else {
        setError('Failed to disable 2FA')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length < 6) {
      setError('Please enter a valid verification code')
      return
    }

    setSaving(true)
    setError('')
    try {
      const data = await authService.regenerateRecoveryCodes(code)
      setRecoveryCodes(data.recovery_codes)
      setShowRecoveryCodes(true)
      setStep('status')
      loadStatus()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid verification code')
      } else {
        setError('Failed to regenerate recovery codes')
      }
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied', description: 'Copied to clipboard' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (step === 'status') {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <div className="max-w-2xl mx-auto p-8">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Profile</span>
          </button>

          <h1 className="text-3xl font-extrabold tracking-tight mb-8">Two-Factor Authentication</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {recoveryCodes && showRecoveryCodes && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Recovery Codes Generated</span>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Save these recovery codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <span className="text-green-800">{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  setShowRecoveryCodes(false)
                  setRecoveryCodes(null)
                }}
              >
                I've saved my codes
              </Button>
            </div>
          )}

          <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {status?.enabled ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShieldOff className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {status?.enabled ? '2FA is Enabled' : '2FA is Disabled'}
                  </h2>
                  <p className="text-slate-500">
                    {status?.enabled 
                      ? `Recovery codes remaining: ${status.recovery_codes_remaining}`
                      : 'Add an extra layer of security to your account'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!status?.enabled && (
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                <Shield className="h-5 w-5" />
                Enable Two-Factor Authentication
              </h3>
              <p className="text-slate-600 mb-4">
                Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to enter a verification code from your authenticator app in addition to your password.
              </p>
              <ul className="space-y-2 mb-6 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>Protects against compromised passwords</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>Uses time-based one-time passwords (TOTP)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span>Provides recovery codes for emergencies</span>
                </li>
              </ul>
              <Button 
                onClick={handleStartSetup}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </div>
          )}

          {status?.enabled && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <Key className="h-5 w-5" />
                  Recovery Codes
                </h3>
                <p className="text-slate-600 mb-4">
                  Recovery codes allow you to access your account if you lose your authenticator device. Each code can only be used once.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setStep('regenerate')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Codes
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Disable Two-Factor Authentication
                </h3>
                <p className="text-slate-600 mb-4">
                  Warning: Disabling 2FA will make your account less secure. Only disable if you're having issues with your authenticator app.
                </p>
                <Button 
                  variant="destructive"
                  onClick={() => setStep('disable')}
                >
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Generating 2FA setup...</p>
        </div>
      </div>
    )
  }

  if (step === 'verify-setup') {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <div className="max-w-md mx-auto p-8">
          <button 
            onClick={() => setStep('status')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Cancel</span>
          </button>

          <h1 className="text-2xl font-bold mb-2">Set Up Two-Factor Authentication</h1>
          <p className="text-slate-600 mb-6">Scan the QR code with your authenticator app</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
            <div className="flex justify-center mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData?.otpauth_url || '')}`}
                alt="2FA QR Code"
                className="border-4 border-white rounded-lg"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Can't scan? Enter this code manually:</p>
              <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-lg p-3">
                <code className="font-mono text-lg tracking-wider">{setupData?.manual_entry_key}</code>
                <button
                  onClick={() => copyToClipboard(setupData?.manual_entry_key || '')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerifySetup}>
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter verification code
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
              <p className="text-sm text-slate-500 mt-2">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={saving || code.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify & Enable 2FA'
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (step === 'disable') {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <div className="max-w-md mx-auto p-8">
          <button 
            onClick={() => setStep('status')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Cancel</span>
          </button>

          <h1 className="text-2xl font-bold mb-2">Disable Two-Factor Authentication</h1>
          <p className="text-slate-600 mb-6">Enter your authenticator code to disable 2FA</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleDisable}>
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
              <p className="text-sm text-slate-500 mt-2">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={saving || code.length < 6}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (step === 'regenerate') {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <div className="max-w-md mx-auto p-8">
          <button 
            onClick={() => setStep('status')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Cancel</span>
          </button>

          <h1 className="text-2xl font-bold mb-2">Regenerate Recovery Codes</h1>
          <p className="text-slate-600 mb-6">Enter your authenticator code to generate new recovery codes</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Warning</p>
                <p className="text-sm text-yellow-700">
                  Generating new recovery codes will invalidate your existing codes.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegenerate}>
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
              <p className="text-sm text-slate-500 mt-2">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={saving || code.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate New Codes'
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return null
}