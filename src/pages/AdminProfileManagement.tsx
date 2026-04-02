import { useState } from 'react'
import { Camera, Save, Shield, Bell, Key, Mail, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export function AdminProfileManagement() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Profile Settings</h1>

        {/* Profile Header */}
        <div className="bg-surface-container-lowest rounded-xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback className="text-2xl">AM</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Alex Mercer</h2>
              <p className="text-on-surface-variant">alex.mercer@architecturalledger.com</p>
              <p className="text-sm text-on-surface-variant mt-1">Administrator</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-surface-container-lowest rounded-xl p-8 mb-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input defaultValue="Alex" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input defaultValue="Mercer" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="alex.mercer@architecturalledger.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue="+1 (555) 123-4567" />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-surface-container-lowest rounded-xl p-8 mb-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input defaultValue="Architectural Ledger" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input defaultValue="Administrator" disabled />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-surface-container-lowest rounded-xl p-8 mb-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-on-surface-variant" />
                <div>
                  <p className="font-bold">Password</p>
                  <p className="text-sm text-on-surface-variant">Last changed 30 days ago</p>
                </div>
              </div>
              <Button variant="secondary">Change Password</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-on-surface-variant" />
                <div>
                  <p className="font-bold">Two-Factor Authentication</p>
                  <p className="text-sm text-on-surface-variant">Enabled</p>
                </div>
              </div>
              <Button variant="secondary">Manage</Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface-container-lowest rounded-xl p-8 mb-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h3>
          <div className="space-y-4">
            {['Email notifications', 'Payment alerts', 'Security alerts', 'Weekly reports'].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <span className="font-medium">{item}</span>
                <div className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
