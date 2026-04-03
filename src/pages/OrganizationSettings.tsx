import { useState, useEffect, useCallback } from 'react'
import { Building, Users, Shield, Bell, Palette, CreditCard, Key, Upload, Eye, EyeOff, Check, AlertCircle, Image, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { organizationService } from '@/services/organizationService'

const tabs = [
  { id: 'general', label: 'General', icon: Building },
  { id: 'integrations', label: 'Integrations', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function GeneralSettings() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subdomain: '',
    custom_domain: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchOrg = useCallback(async () => {
    setLoading(true)
    try {
      const org = await organizationService.getOrganization()
      setFormData({
        name: org.name,
        email: org.email || '',
        subdomain: org.subdomain || '',
        custom_domain: org.custom_domain || '',
      })
    } catch (err) {
      console.error('Failed to load organization', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrg()
  }, [fetchOrg])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await organizationService.updateOrganization(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert('Failed to save settings')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Organization Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Organization Name</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter organization name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Contact Email</Label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Subdomain</Label>
            <Input 
              value={formData.subdomain}
              onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
              placeholder="school"
            />
            <p className="text-xs text-gray-500">Your portal will be at: {formData.subdomain || 'subdomain'}.payforms.app</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Custom Domain</Label>
            <Input 
              value={formData.custom_domain}
              onChange={(e) => setFormData({...formData, custom_domain: e.target.value})}
              placeholder="pay.myuni.com"
            />
            <p className="text-xs text-gray-500">Point your domain CNAME to payforms.app</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="h-4 w-4" />
            Changes saved
          </span>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

function IntegrationsSettings() {
  const [keys, setKeys] = useState({
    paystack_public_key: '',
    paystack_secret_key: '',
  })
  const [showSecret, setShowSecret] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await organizationService.updateKeys({
        paystack_public_key: keys.paystack_public_key,
        paystack_secret_key: keys.paystack_secret_key,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert('Failed to save keys')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTestStatus('testing')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTestStatus(Math.random() > 0.3 ? 'success' : 'error')
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Key className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Paystack Integration</p>
          <p className="text-sm text-blue-700 mt-1">
            Connect your Paystack account to accept payments. Get your API keys from your Paystack dashboard.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">API Keys</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Public Key</Label>
            <Input 
              value={keys.paystack_public_key}
              onChange={(e) => setKeys({...keys, paystack_public_key: e.target.value})}
              placeholder="pk_live_xxxxxxxxxxxxxx"
            />
            <p className="text-xs text-gray-500">Found in your Paystack Dashboard → Settings → API Keys</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Secret Key</Label>
            <div className="relative">
              <Input 
                type={showSecret ? 'text' : 'password'}
                value={keys.paystack_secret_key}
                onChange={(e) => setKeys({...keys, paystack_secret_key: e.target.value})}
                placeholder="sk_live_xxxxxxxxxxxxxx"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Keep your secret key secure. Never expose it in client-side code.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Webhook URL</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-600">
            {import.meta.env.VITE_API_URL}/webhooks/paystack
          </div>
          <p className="text-xs text-gray-500">
            Add this URL to your Paystack dashboard under Settings → Webhooks to receive payment notifications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Test Connection</h3>
            <p className="text-sm text-gray-500">Verify your API keys are working correctly</p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || !keys.paystack_public_key || !keys.paystack_secret_key}
          >
            {testStatus === 'testing' ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Testing...
              </span>
            ) : testStatus === 'success' ? (
              <span className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                Connected
              </span>
            ) : testStatus === 'error' ? (
              <span className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                Failed
              </span>
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="h-4 w-4" />
            Keys saved
          </span>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Keys'}
        </Button>
      </div>
    </div>
  )
}

function AppearanceSettings() {
  const [logo, setLogo] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Organization Logo</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload your organization's logo. This will appear on payment receipts and email notifications.
        </p>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {logo ? (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center mb-4">
                <img src={logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex gap-2">
                <label className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  Change Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <Button variant="ghost" onClick={() => setLogo(null)}>Remove</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your logo here, or
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Upload className="h-4 w-4" />
                Browse Files
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <p className="text-xs text-gray-400 mt-3">
                PNG, JPG, or SVG. Max 2MB. Recommended: 200x200px
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Logo Preview</h3>
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              {logo ? (
                <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-white font-bold text-xl">AL</span>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Receipt</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                {logo ? (
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-white font-bold text-sm">AL</span>
                )}
              </div>
              <span className="font-bold text-gray-900">Payforms</span>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Email Header</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="h-4 w-4" />
            Logo saved
          </span>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Logo'}
        </Button>
      </div>
    </div>
  )
}

function NotificationsSettings() {
  const [settings, setSettings] = useState({
    submissionConfirmation: true,
    paymentConfirmation: true,
    paymentFailure: true,
    weeklyReport: false,
    monthlyReport: true,
    newContactImport: true,
    staffInvite: true,
    securityAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Payment Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Submission Confirmations</p>
              <p className="text-sm text-gray-500">Get notified when a form is submitted</p>
            </div>
            <Toggle 
              checked={settings.submissionConfirmation}
              onChange={(checked) => setSettings({...settings, submissionConfirmation: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Payment Confirmations</p>
              <p className="text-sm text-gray-500">Get notified when a payment is successful</p>
            </div>
            <Toggle 
              checked={settings.paymentConfirmation}
              onChange={(checked) => setSettings({...settings, paymentConfirmation: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Payment Failures</p>
              <p className="text-sm text-gray-500">Get notified when a payment fails</p>
            </div>
            <Toggle 
              checked={settings.paymentFailure}
              onChange={(checked) => setSettings({...settings, paymentFailure: checked})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Reports</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Weekly Report</p>
              <p className="text-sm text-gray-500">Receive weekly summary of transactions</p>
            </div>
            <Toggle 
              checked={settings.weeklyReport}
              onChange={(checked) => setSettings({...settings, weeklyReport: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Monthly Report</p>
              <p className="text-sm text-gray-500">Receive monthly analytics summary</p>
            </div>
            <Toggle 
              checked={settings.monthlyReport}
              onChange={(checked) => setSettings({...settings, monthlyReport: checked})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Activity Alerts</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">New Contact Import</p>
              <p className="text-sm text-gray-500">Get notified when contacts are imported</p>
            </div>
            <Toggle 
              checked={settings.newContactImport}
              onChange={(checked) => setSettings({...settings, newContactImport: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Staff Invitations</p>
              <p className="text-sm text-gray-500">Get notified when team members are invited</p>
            </div>
            <Toggle 
              checked={settings.staffInvite}
              onChange={(checked) => setSettings({...settings, staffInvite: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Security Alerts</p>
              <p className="text-sm text-gray-500">Important security-related notifications</p>
            </div>
            <Toggle 
              checked={settings.securityAlerts}
              onChange={(checked) => setSettings({...settings, securityAlerts: checked})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Other</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">System Updates</p>
              <p className="text-sm text-gray-500">New features and maintenance notices</p>
            </div>
            <Toggle 
              checked={settings.systemUpdates}
              onChange={(checked) => setSettings({...settings, systemUpdates: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Marketing Emails</p>
              <p className="text-sm text-gray-500">Tips, best practices, and promotions</p>
            </div>
            <Toggle 
              checked={settings.marketingEmails}
              onChange={(checked) => setSettings({...settings, marketingEmails: checked})}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="h-4 w-4" />
            Preferences saved
          </span>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}

function TeamSettings() {
  const [members] = useState([
    { id: '1', name: 'Admin User', email: 'admin@architecturalledger.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@architecturalledger.com', role: 'Manager', status: 'Active' },
    { id: '3', name: 'John Doe', email: 'john@architecturalledger.com', role: 'Staff', status: 'Pending' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500">Manage your organization team</p>
        </div>
        <Button>Invite Member</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    member.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable 2FA</p>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <Toggle 
            checked={twoFactor}
            onChange={setTwoFactor}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Password</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-500">Update your account password</p>
          </div>
          <Button variant="secondary">Change</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Sessions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Current Session</p>
              <p className="text-sm text-gray-500">Chrome on macOS • 192.168.1.1</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              Active
            </span>
          </div>
        </div>
        <Button variant="ghost" className="mt-4 text-red-600 hover:text-red-700 hover:bg-red-50">
          Sign out all other sessions
        </Button>
      </div>
    </div>
  )
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Current Plan</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            Pro Plan
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          Your plan renews on March 15, 2026
        </p>
        <div className="flex gap-3">
          <Button variant="secondary">Manage Subscription</Button>
          <Button variant="ghost">View Invoices</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900">Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Contacts</span>
              <span className="font-medium">1,248 / 5,000</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Forms</span>
              <span className="font-medium">24 / 100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Transactions</span>
              <span className="font-medium">4,820 / Unlimited</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrganizationSettings() {
  const [activeTab, setActiveTab] = useState('general')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />
      case 'integrations': return <IntegrationsSettings />
      case 'appearance': return <AppearanceSettings />
      case 'team': return <TeamSettings />
      case 'security': return <SecuritySettings />
      case 'notifications': return <NotificationsSettings />
      case 'billing': return <BillingSettings />
      default: return <GeneralSettings />
    }
  }

  return (
    <div className="flex gap-8">
      <div className="w-64 shrink-0">
        <h2 className="text-lg font-bold mb-6 text-gray-900">Settings</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-extrabold tracking-tight mb-6 text-gray-900 capitalize">
            {activeTab === 'integrations' ? 'Integrations & Keys' : activeTab} Settings
          </h1>
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
