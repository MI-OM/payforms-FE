import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Search, Upload, CheckCircle, XCircle, Clock, Download, ArrowLeft, Loader2, AlertCircle, X, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactService, type Import } from '@/services/contactService'

interface ImportDetail {
  id: string
  status: string
  details: {
    valid: number
    duplicates: number
    errors: number
  }
}

export function AllImportActivities() {
  const [imports, setImports] = useState<Import[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedImport, setSelectedImport] = useState<ImportDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

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

  const viewImportDetails = async (id: string) => {
    setDetailLoading(true)
    try {
      const data = await contactService.getImport(id)
      setSelectedImport(data)
    } catch (err) {
      console.error('Failed to fetch import details:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-surface p-8">
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
                    <Button variant="ghost" size="sm" onClick={() => viewImportDetails(importItem.id)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedImport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedImport(null)}>
            <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center sticky top-0 bg-surface-container-lowest">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold">Import Details</h2>
                    <p className="text-sm text-on-surface-variant font-mono">#{selectedImport.id.slice(0, 8)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedImport(null)} className="p-2 hover:bg-surface-container-high rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    selectedImport.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    selectedImport.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedImport.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-container-low rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{selectedImport.details.valid}</p>
                    <p className="text-xs text-on-surface-variant">Valid</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{selectedImport.details.duplicates}</p>
                    <p className="text-xs text-on-surface-variant">Duplicates</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-4 text-center">
                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">{selectedImport.details.errors}</p>
                    <p className="text-xs text-on-surface-variant">Errors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface-container-lowest rounded-xl p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
