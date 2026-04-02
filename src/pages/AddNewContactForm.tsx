import { UserPlus, Upload, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AddNewContactForm() {
  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Add New Contact</h1>
            <button className="text-on-surface-variant hover:text-on-surface">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company / Organization</Label>
              <Input id="company" placeholder="Acme Corp" />
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Save Contact
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
