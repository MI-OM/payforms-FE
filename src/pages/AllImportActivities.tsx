import { useState, useEffect } from 'react'
import { Search, Upload, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type Import } from '@/services/contactService'

export function AllImportActivities() {
  const [imports, setImports] = useState<Import[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchImports = async () => {
      try {
        const data = await contactService.getImports({ limit: 50 })
        setImports(data.data)
      } catch (err) {
        console.error('Failed to fetch imports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchImports()
  }, [])

  const filteredImports = imports.filter(imp => 
    imp.id.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

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
              <Input 
                className="pl-10" 
                placeholder="Search imports..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredImports.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              No import activities found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredImports.map((importItem) => (
                <div key={importItem.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      importItem.status === 'completed' ? 'bg-tertiary-fixed/30 text-on-tertiary-container' : 
                      importItem.status === 'pending' ? 'bg-secondary-container text-on-secondary-container' : 
                      'bg-error-container text-error'
                    }`}>
                      {importItem.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : 
                       importItem.status === 'pending' ? <Clock className="h-5 w-5" /> : 
                       <XCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold">Import #{importItem.id.slice(0, 8)}</p>
                      <p className="text-sm text-on-surface-variant">{importItem.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-on-surface-variant">{formatDate(importItem.created_at)}</span>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
