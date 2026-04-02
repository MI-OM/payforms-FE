import { Plus, GripVertical, Type, Hash, Calendar, DollarSign, Image, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fields = [
  { icon: Type, label: 'Short Text', count: 12 },
  { icon: Hash, label: 'Number', count: 8 },
  { icon: DollarSign, label: 'Currency', count: 5 },
  { icon: Calendar, label: 'Date', count: 3 },
  { icon: Image, label: 'File Upload', count: 2 },
]

export function FormBuilder() {
  return (
    <div className="min-h-screen bg-surface ml-64">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-surface-container-lowest border-r border-outline-variant/10 h-screen overflow-auto p-6">
          <h2 className="text-lg font-bold mb-6">Form Fields</h2>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors">
                <field.icon className="h-5 w-5 text-on-surface-variant" />
                <span className="font-medium">{field.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Q1 Invoice Form</h1>
                <p className="text-on-surface-variant">Drag fields to add them to your form</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary">Preview</Button>
                <Button>Publish</Button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-8 min-h-[500px]">
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-low rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-on-surface-variant" />
                    <span className="font-medium">Client Name</span>
                    <span className="text-xs px-2 py-0.5 bg-surface-container-high rounded">Short Text</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 bg-surface-container-low rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-on-surface-variant" />
                    <span className="font-medium">Invoice Amount</span>
                    <span className="text-xs px-2 py-0.5 bg-surface-container-high rounded">Currency</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 bg-surface-container-low rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-on-surface-variant" />
                    <span className="font-medium">Due Date</span>
                    <span className="text-xs px-2 py-0.5 bg-surface-container-high rounded">Date</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <button className="w-full p-4 border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormBuilderAddFieldModal() {
  return (
    <div className="min-h-screen bg-surface ml-64 flex items-center justify-center p-8">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
        <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-extrabold tracking-tight mb-6">Add Field</h3>
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <button key={index} className="p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors text-left">
                <field.icon className="h-6 w-6 mb-2 text-on-surface-variant" />
                <p className="font-bold">{field.label}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary">Cancel</Button>
            <Button>Add Field</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormBuilderRefinedFlow() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Form Builder</h1>
            <p className="text-on-surface-variant">Create and customize your payment form</p>
          </div>
          <Button>Save & Publish</Button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-surface-container-lowest rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Field Label</label>
                  <input type="text" className="w-full mt-1 px-3 py-2 bg-surface-container-low border-none rounded-lg" placeholder="Enter field name" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Field Type</label>
                  <select className="w-full mt-1 px-3 py-2 bg-surface-container-low border-none rounded-lg">
                    <option>Short Text</option>
                    <option>Long Text</option>
                    <option>Number</option>
                    <option>Email</option>
                    <option>Currency</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="required" />
                  <label htmlFor="required" className="text-sm">Required field</label>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <h3 className="font-bold mb-4">Fields</h3>
              <div className="space-y-2">
                {['Client Name', 'Email', 'Amount', 'Notes'].map((field, i) => (
                  <div key={i} className="p-3 bg-surface-container-low rounded-lg text-sm">{field}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormBuilderPublishStep() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-tertiary-fixed/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-on-tertiary-container" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-3">Ready to Publish!</h1>
          <p className="text-on-surface-variant mb-6">Your form is ready. Choose how you want to share it.</p>
          
          <div className="space-y-3 mb-6">
            <Button className="w-full justify-start" variant="secondary">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Link
            </Button>
            <Button className="w-full justify-start" variant="secondary">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Download HTML
            </Button>
            <Button className="w-full justify-start" variant="secondary">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share on Social
            </Button>
          </div>

          <div className="p-4 bg-surface-container-low rounded-lg">
            <p className="text-xs text-on-surface-variant mb-2">Form URL</p>
            <p className="font-mono text-sm truncate">https://payforms.app/f/q1-invoice-form</p>
          </div>
        </div>
      </div>
    </div>
  )
}
