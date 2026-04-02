import { Search, Upload, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const imports = [
  { name: 'Q4_Contacts_Bulk.csv', records: 1248, status: 'completed', date: 'Oct 24, 2023' },
  { name: 'Q3_Contacts_Update.csv', records: 456, status: 'completed', date: 'Oct 15, 2023' },
  { name: 'Staff_Import_Failed.csv', records: 89, status: 'failed', date: 'Oct 10, 2023' },
  { name: 'Newsletter_Subs.csv', records: 234, status: 'completed', date: 'Oct 5, 2023' },
]

export function AllImportActivities() {
  return (
    <div className="min-h-screen bg-surface ml-64 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Import Activities</h1>
            <p className="text-on-surface-variant">Track all your contact import history.</p>
          </div>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Contacts
          </Button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input className="pl-10" placeholder="Search imports..." />
            </div>
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="space-y-4">
            {imports.map((importItem, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    importItem.status === 'completed' ? 'bg-tertiary-fixed/30 text-on-tertiary-container' : 'bg-error-container text-error'
                  }`}>
                    {importItem.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-bold">{importItem.name}</p>
                    <p className="text-sm text-on-surface-variant">{importItem.records} records</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-on-surface-variant">{importItem.date}</span>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
