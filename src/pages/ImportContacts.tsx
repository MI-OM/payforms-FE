import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileSpreadsheet, Check, X, Loader, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { contactService, type ImportContactRow, type ImportValidationResult } from '@/services/contactService'

const CSV_TEMPLATE = `first_name,last_name,email,phone,gender,student_id,external_id,guardian_name,guardian_email,guardian_phone,groups,group_paths,require_login,is_active,must_reset_password
John,Doe,john@example.com,+2348012345678,M,STU-001,EXT-123,Jane Doe,guardian@example.com,+2348098765432,"Returning Students; Priority","Faculty > Engineering",true,true,false
Jane,Smith,jane@example.com,+2348012345679,F,STU-002,EXT-124,John Smith,guardian2@example.com,+2348098765430,"Alumni","Faculty > Arts",true,true,true`

function downloadCSVTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contacts-import-template.csv'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

interface ParsedRow {
  first_name?: string
  last_name?: string
  name?: string
  email: string
  phone?: string
  gender?: string
  student_id?: string
  external_id?: string
  guardian_name?: string
  guardian_email?: string
  guardian_phone?: string
  groups?: string
  group_paths?: string
  require_login?: string
  is_active?: string
  must_reset_password?: string
  [key: string]: string | undefined
}

function parseCSV(csvText: string): ParsedRow[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const row: ParsedRow = { email: '' }
    headers.forEach((header, i) => {
      row[header.toLowerCase().replace(/\s+/g, '_')] = values[i] || ''
    })
    return row
  })
}

function mapRowToImportContact(row: ParsedRow): ImportContactRow {
  return {
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email || '',
    phone: row.phone || undefined,
    gender: row.gender || undefined,
    student_id: row.student_id || undefined,
    external_id: row.external_id || undefined,
    guardian_name: row.guardian_name || undefined,
    guardian_email: row.guardian_email || undefined,
    guardian_phone: row.guardian_phone || undefined,
    groups: row.groups ? row.groups.split(';').map(g => g.trim()) : undefined,
    group_paths: row.group_paths ? row.group_paths.split(';').map(p => p.trim()) : undefined,
    require_login: row.require_login === 'true',
    is_active: row.is_active === 'true',
    must_reset_password: row.must_reset_password === 'true',
  }
}

export function ImportContacts() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [fileName, setFileName] = useState<string | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null)
  const [importId, setImportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      setParsedData(rows)
      setCsvContent(text)
      setFileName(file.name)
      setStep(2)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleValidate = async () => {
    setLoading(true)
    setError(null)
    try {
      const contacts = parsedData.map(mapRowToImportContact).filter(c => c.email)
      const result = await contactService.validateImport(contacts)
      setValidationResult(result)
      setStep(3)
    } catch (err) {
      setError('Failed to validate contacts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await contactService.commitCSVImport(csvContent)
      setImportedCount(result.imported)
      setStep(4)
    } catch (err) {
      setError('Failed to import contacts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDone = () => {
    navigate('/contacts')
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Import Contacts</h1>
                <p className="text-gray-500">Upload a CSV file to bulk import contacts</p>
              </div>

              <div className="mb-6 flex justify-center">
                <button
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors border border-green-200"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
              </div>

              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center mb-6"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-bold text-gray-900 mb-2">Drag and drop your CSV file here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Browse Files
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                </label>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>CSV Format:</strong> Include columns for first_name, last_name, email. Optional: phone, gender, student_id, external_id, guardian fields, groups, group_paths, require_login, is_active, must_reset_password.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Review Data</h1>
                <p className="text-gray-500">{parsedData.length} contacts found in CSV</p>
              </div>

              {fileName && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                  <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{fileName}</p>
                    <p className="text-sm text-gray-500">{parsedData.length} contacts ready to import</p>
                  </div>
                  <button onClick={() => { setFileName(null); setParsedData([]); setStep(1) }} className="text-gray-400 hover:text-red-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 text-gray-500">Name</th>
                      <th className="text-left p-2 text-gray-500">Email</th>
                      <th className="text-left p-2 text-gray-500">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="p-2 text-gray-900">{row.name || '-'}</td>
                        <td className="p-2 text-gray-700">{row.email || '-'}</td>
                        <td className="p-2 text-gray-700">{row.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <p className="text-center text-gray-500 text-sm py-2">
                    ...and {parsedData.length - 10} more
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleValidate} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Validating...
                    </span>
                  ) : 'Continue'}
                </Button>
              </div>
            </>
          )}

          {step === 3 && validationResult && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Review Import</h1>
                <p className="text-gray-500">Validation results for your contacts</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{validationResult.valid}</p>
                  <p className="text-xs text-gray-500">Valid</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{validationResult.duplicates}</p>
                  <p className="text-xs text-gray-500">Duplicates</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{validationResult.errors}</p>
                  <p className="text-xs text-gray-500">Errors</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 text-gray-500">Name</th>
                      <th className="text-left p-2 text-gray-500">Email</th>
                      <th className="text-left p-2 text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.rows.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="p-2 text-gray-900">{row.name}</td>
                        <td className="p-2 text-gray-700">{row.email}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            validationResult.rows.find(r => r.email === row.email) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {row.email ? 'Valid' : 'Missing email'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={handleImport} disabled={loading || validationResult.valid === 0}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Importing...
                    </span>
                  ) : `Import ${validationResult.valid} Contacts`}
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Import Complete!</h1>
                <p className="text-gray-500">Successfully imported {importedCount} contacts</p>
              </div>

              <Button className="w-full" onClick={handleDone}>Done</Button>
            </>
          )}
        </div>
      </div>
  )
}
