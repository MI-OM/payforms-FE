import { useState } from 'react'
import { Building, Users, Shield, Bell, Palette, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const tabs = [
  { id: 'general', label: 'General', icon: Building },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export function OrganizationSettings() {
  const [activeTab, setActiveTab] = useState('general')

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
          <div className="max-w-2xl">
            <h1 className="text-2xl font-extrabold tracking-tight mb-6 text-gray-900">General Settings</h1>

            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">Organization Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Organization Name</Label>
                  <Input defaultValue="Architectural Ledger" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Website</Label>
                  <Input defaultValue="https://architecturalledger.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Contact Email</Label>
                  <Input defaultValue="admin@architecturalledger.com" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Timezone</p>
                    <p className="text-sm text-gray-500">Eastern Time (ET)</p>
                  </div>
                  <Button variant="ghost" size="sm">Change</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Currency</p>
                    <p className="text-sm text-gray-500">USD ($)</p>
                  </div>
                  <Button variant="ghost" size="sm">Change</Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
  )
}
