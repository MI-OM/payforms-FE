import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, Check, X, RefreshCw, Copy, Eye, EyeOff, Webhook, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from 'lucide-react'
import { publicFormService } from '@/services/formService'

interface WebhookLog {
  id: string
  timestamp: string
  event: string
  status: 'success' | 'failed'
  responseCode: number
  duration: string
  reference?: string
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  active: boolean
  secret: string
}

export function WebhookManagement() {
  const navigate = useNavigate()
  const [webhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Paystack Production',
      url: 'https://api.payforms.app/webhooks/paystack',
      events: ['charge.success', 'charge.failed', 'transfer.success'],
      active: true,
      secret: 'whsec_xxxxxxxxxxxxxxxxxxxx',
    },
    {
      id: '2',
      name: 'Test Endpoint',
      url: 'https://test.payforms.app/webhooks/paystack',
      events: ['charge.success', 'charge.failed'],
      active: false,
      secret: 'whsec_test_xxxxxxxxxxxxx',
    },
  ])

  const [showSecret, setShowSecret] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const webhookUrl = `${import.meta.env.VITE_API_URL}/webhooks/paystack`

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
            <p className="text-gray-500">Manage webhook endpoints</p>
          </div>
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Webhook className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Webhook URL</p>
              <p className="text-sm text-blue-700 mb-2">Add this URL to your Paystack dashboard to receive payment notifications</p>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <code className="flex-1 text-sm font-mono">{webhookUrl}</code>
                <button onClick={handleCopy} className="p-1 hover:bg-gray-100 rounded">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {webhooks.map(webhook => (
            <div key={webhook.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${webhook.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <h3 className="font-bold text-gray-900">{webhook.name}</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Edit</Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/settings/webhooks/${webhook.id}/logs`)}>
                    View Logs
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Endpoint URL</p>
                  <p className="font-mono text-sm">{webhook.url}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Secret Key</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {showSecret === webhook.id ? webhook.secret : '••••••••••••••••••••••'}
                    </code>
                    <button 
                      onClick={() => setShowSecret(showSecret === webhook.id ? null : webhook.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Events</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function WebhookLogs() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null)

  useEffect(() => {
    setTimeout(() => {
      setLogs([
        { id: '1', timestamp: '2026-04-02T14:30:00Z', event: 'charge.success', status: 'success', responseCode: 200, duration: '245ms', reference: 'PSK-123456' },
        { id: '2', timestamp: '2026-04-02T14:25:00Z', event: 'charge.success', status: 'success', responseCode: 200, duration: '189ms', reference: 'PSK-123455' },
        { id: '3', timestamp: '2026-04-02T14:20:00Z', event: 'transfer.success', status: 'success', responseCode: 200, duration: '312ms' },
        { id: '4', timestamp: '2026-04-02T14:15:00Z', event: 'charge.failed', status: 'failed', responseCode: 500, duration: '2000ms', reference: 'PSK-123454' },
        { id: '5', timestamp: '2026-04-02T14:10:00Z', event: 'charge.success', status: 'success', responseCode: 200, duration: '178ms', reference: 'PSK-123453' },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const filteredLogs = logs.filter(log => 
    log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/settings/webhooks')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Webhook Logs</h1>
            <p className="text-gray-500">Paystack Production</p>
          </div>
          <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by event or reference..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <div 
                    key={log.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedLog?.id === log.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{log.event}</p>
                          <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {log.responseCode}
                        </span>
                        <p className="text-xs text-gray-500">{log.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            {selectedLog ? (
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Log Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Event</p>
                    <p className="font-medium">{selectedLog.event}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Timestamp</p>
                    <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      selectedLog.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedLog.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Response Code</p>
                    <p className="font-medium">{selectedLog.responseCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium">{selectedLog.duration}</p>
                  </div>
                  {selectedLog.reference && (
                    <div>
                      <p className="text-gray-500">Reference</p>
                      <p className="font-mono">{selectedLog.reference}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Webhook className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select a log to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function WidgetConfiguration() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [formSlug, setFormSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{ slug?: string; title?: string } | null>(null)
  const [embedScript, setEmbedScript] = useState('')
  const [widgetHtml, setWidgetHtml] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [widgetSettings, setWidgetSettings] = useState({
    theme: 'light',
    primaryColor: '#188ace',
    buttonText: 'Pay Now',
    width: '100%',
    minHeight: '400',
    callbackUrl: '',
    autoRedirect: true,
  })

  useEffect(() => {
    const fetchFormData = async () => {
      if (id) {
        try {
          const { formService } = await import('@/services/formService')
          const form = await formService.getForm(id)
          setFormData(form)
          setFormSlug(form.slug)
        } catch (err) {
          console.error('Failed to fetch form:', err)
        }
      }
    }
    fetchFormData()
  }, [id])

  useEffect(() => {
    const fetchWidgetAssets = async () => {
      if (!formSlug) return
      setLoading(true)
      try {
        const scriptResponse = await publicFormService.getEmbedScript(formSlug)
        setEmbedScript(scriptResponse.script || `<script src="/api/public/forms/${formSlug}/embed.js"></script>`)
        
        const widgetResponse = await publicFormService.getWidget(formSlug, {
          auto_redirect: widgetSettings.autoRedirect,
          callback_url: widgetSettings.callbackUrl,
        })
        setWidgetHtml(typeof widgetResponse === 'string' ? widgetResponse : '')
      } catch (err) {
        console.error('Failed to fetch widget assets:', err)
        setEmbedScript(`<script src="/api/public/forms/${formSlug}/embed.js" data-width="${widgetSettings.width}" data-height="${widgetSettings.minHeight}" data-primary-color="${widgetSettings.primaryColor}" ${widgetSettings.autoRedirect ? 'data-auto-redirect="true"' : ''}></script>`)
      } finally {
        setLoading(false)
      }
    }
    fetchWidgetAssets()
  }, [formSlug, widgetSettings.autoRedirect, widgetSettings.callbackUrl])

  const generateEmbedCode = () => {
    return `<script src="/api/public/forms/${formSlug}/embed.js" data-width="${widgetSettings.width}" data-height="${widgetSettings.minHeight}" data-primary-color="${widgetSettings.primaryColor}" ${widgetSettings.autoRedirect ? 'data-auto-redirect="true"' : ''}></script>`
  }

  const generateIframeCode = () => {
    const params = new URLSearchParams()
    if (widgetSettings.autoRedirect) params.append('auto_redirect', 'true')
    if (widgetSettings.callbackUrl) params.append('callback_url', widgetSettings.callbackUrl)
    const query = params.toString() ? `?${params.toString()}` : ''
    return `<iframe src="/api/public/forms/${formSlug}/widget${query}" width="${widgetSettings.width}" height="${widgetSettings.minHeight}" frameborder="0"></iframe>`
  }

  const previewUrl = () => {
    const params = new URLSearchParams()
    if (widgetSettings.autoRedirect) params.append('auto_redirect', 'true')
    if (widgetSettings.callbackUrl) params.append('callback_url', widgetSettings.callbackUrl)
    const query = params.toString() ? `?${params.toString()}` : ''
    return `/api/public/forms/${formSlug}/widget${query}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/forms')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Widget Configuration</h1>
            <p className="text-gray-500">Customize your payment widget</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Form Selection</h3>
              {formData?.title && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">{formData.title}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Slug</label>
                <Input 
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="form-slug"
                  disabled={!!id}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {id ? 'Form slug is locked for this form' : 'The URL-friendly name of your form'}
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Payment URL:</p>
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  /pay/{formSlug || 'your-slug'}
                </code>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <div className="flex gap-2">
                    {['light', 'dark'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => setWidgetSettings({...widgetSettings, theme})}
                        className={`px-4 py-2 rounded-lg text-sm capitalize ${
                          widgetSettings.theme === theme 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={widgetSettings.primaryColor}
                      onChange={(e) => setWidgetSettings({...widgetSettings, primaryColor: e.target.value})}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input 
                      value={widgetSettings.primaryColor}
                      onChange={(e) => setWidgetSettings({...widgetSettings, primaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <Input 
                    value={widgetSettings.buttonText}
                    onChange={(e) => setWidgetSettings({...widgetSettings, buttonText: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                  <Input 
                    value={widgetSettings.width}
                    onChange={(e) => setWidgetSettings({...widgetSettings, width: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Height (px)</label>
                  <Input 
                    type="number"
                    value={widgetSettings.minHeight}
                    onChange={(e) => setWidgetSettings({...widgetSettings, minHeight: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Behavior</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Callback URL (optional)</label>
                  <Input 
                    value={widgetSettings.callbackUrl}
                    onChange={(e) => setWidgetSettings({...widgetSettings, callbackUrl: e.target.value})}
                    placeholder="https://yoursite.com/payment-callback"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={widgetSettings.autoRedirect}
                    onChange={(e) => setWidgetSettings({...widgetSettings, autoRedirect: e.target.checked})}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">Auto-redirect after payment</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-700">Loading widget configuration...</span>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Embed Script</h3>
              <p className="text-sm text-gray-500 mb-3">Add this code to your website HTML</p>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <pre className="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
                  {generateEmbedCode()}
                </pre>
                <button className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400" title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Iframe Embed</h3>
              <p className="text-sm text-gray-500 mb-3">Alternative iframe method</p>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <pre className="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
                  {generateIframeCode()}
                </pre>
                <button className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400" title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Widget Preview</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              {showPreview ? (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: widgetSettings.minHeight }}>
                  <iframe
                    src={previewUrl()}
                    width={widgetSettings.width}
                    height={parseInt(widgetSettings.minHeight)}
                    frameBorder="0"
                    title="Widget Preview"
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center gap-4">
                  <div 
                    className="px-6 py-3 rounded-lg text-white font-medium shadow-md"
                    style={{ backgroundColor: widgetSettings.primaryColor }}
                  >
                    {widgetSettings.buttonText}
                  </div>
                  <p className="text-sm text-gray-500">Click "Show Preview" to see the live widget</p>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <a 
                  href={`/pay/${formSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Open in New Tab
                  <ExternalLink className="h-4 w-4" />
                </a>
                <span className="text-sm text-gray-500 self-center">
                  URL: <code className="bg-gray-100 px-2 py-1 rounded">/pay/{formSlug}</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
