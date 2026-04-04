import { useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Download, Check, Loader2, FileText, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { contactService, type ImportContactRow, type ImportValidationResult } from '@/services/contactService'
import { toast } from '@/components/ui/use-toast'

type ImportStep = 'upload' | 'mapping' | 'review'

export function ImportContactsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string>('')
  const [parsedRows, setParsedRows] = useState<ImportContactRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [importId, setImportId] = useState<string | null>(null)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})

  const requiredFields = ['email', 'first_name', 'last_name']

  const parseCSV = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) return { headers: [], rows: [] }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      return values
    })
    
    return { headers, rows }
  }

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvData(text)
      const { headers, rows } = parseCSV(text)
      setHeaders(headers)
      
      const mappedRows: ImportContactRow[] = rows.map(row => {
        const contact: ImportContactRow = { email: '' }
        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader === 'email') contact.email = row[index] || ''
          else if (lowerHeader === 'first_name' || lowerHeader === 'firstname' || lowerHeader === 'first name') contact.first_name = row[index]
          else if (lowerHeader === 'last_name' || lowerHeader === 'lastname' || lowerHeader === 'last name') contact.last_name = row[index]
          else if (lowerHeader === 'phone' || lowerHeader === 'phone_number' || lowerHeader === 'telephone') contact.phone = row[index]
          else if (lowerHeader === 'gender') contact.gender = row[index]
          else if (lowerHeader === 'student_id' || lowerHeader === 'studentid') contact.student_id = row[index]
          else if (lowerHeader === 'external_id' || lowerHeader === 'externalid') contact.external_id = row[index]
        })
        return contact
      })
      setParsedRows(mappedRows)
      setCurrentStep('mapping')
    }
    reader.readAsText(selectedFile)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      handleFileSelect(droppedFile)
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      })
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleMappingComplete = async () => {
    setLoading(true)
    try {
      const result = await contactService.importContactsCSV(csvData)
      setImportId(result.import_id)
      setCurrentStep('review')
      
      const validation = await contactService.validateImport(parsedRows)
      setValidationResult(validation)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to validate import. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importId) return
    
    setLoading(true)
    try {
      const result = await contactService.commitImport(importId)
      toast({
        title: 'Success',
        description: `Successfully imported ${result.imported} contacts`,
      })
      navigate('/contacts')
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to import contacts. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'first_name,last_name,email,phone,gender,student_id\nJohn,Doe,john@example.com,+1234567890,Male,STU001'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts_template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col">
      <div className="max-w-5xl mx-auto flex-1 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link to="/contacts" className="inline-flex items-center gap-2 text-[#188ace] text-xs uppercase tracking-widest font-semibold mb-4 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Link>
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tighter text-[#191c1e] mb-3">
            Bulk Import Contacts
          </h1>
          <p className="text-[#45464d] text-lg max-w-2xl">
            Populate your ledger by importing contacts from a CSV file. Our system will automatically map common fields for rapid ingestion.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4">
          <div className={`flex items-center gap-3 shrink-0 ${currentStep === 'upload' ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep !== 'upload' ? 'bg-[#009668] text-white' : 'bg-black text-white'}`}>
              {currentStep === 'mapping' || currentStep === 'review' ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className={`font-bold ${currentStep !== 'upload' ? '' : 'text-[#191c1e]'}`}>Upload CSV</span>
          </div>
          <div className="w-12 h-px bg-[#c6c6cd] opacity-30 shrink-0"></div>
          <div className={`flex items-center gap-3 shrink-0 ${currentStep === 'mapping' ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'review' ? 'bg-[#009668] text-white' : 'bg-[#e6e8ea] text-[#45464d]'}`}>
              {currentStep === 'review' ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className={`font-medium ${currentStep === 'mapping' ? 'text-[#191c1e] font-bold' : ''}`}>Map Fields</span>
          </div>
          <div className="w-12 h-px bg-[#c6c6cd] opacity-30 shrink-0"></div>
          <div className={`flex items-center gap-3 shrink-0 ${currentStep === 'review' ? 'opacity-100' : 'opacity-40'}`}>
            <div className="w-8 h-8 rounded-full bg-[#e6e8ea] text-[#45464d] flex items-center justify-center font-bold text-sm">3</div>
            <span className="font-medium">Review & Import</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-1 text-center border-2 border-dashed border-[#c6c6cd] hover:border-[#006398] transition-colors">
                <div
                  className="bg-[#f2f4f6] rounded-lg p-12 lg:p-16 flex flex-col items-center justify-center transition-all"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="w-20 h-20 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2">Drag and drop your file</h3>
                  <p className="text-[#45464d] mb-8">CSV or XLSX files only. Max file size 50MB.</p>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleBrowseClick}
                      className="px-8 py-3 bg-black text-white rounded-md font-bold text-sm hover:bg-slate-800"
                    >
                      Browse Files
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-[#001d31] text-white rounded-xl p-6 lg:p-8 overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Need a template?</h4>
                  <p className="text-white/60 text-sm mb-6">Download our pre-formatted CSV template to ensure your data maps perfectly.</p>
                  <Button
                    onClick={downloadTemplate}
                    className="w-full py-3 bg-white text-black rounded-md font-bold text-xs uppercase tracking-widest hover:bg-[#f2f4f6]"
                  >
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-[#f2f4f6] rounded-xl p-6 lg:p-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#45464d] mb-6">Import Guidelines</h4>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Check className="w-4 h-4 text-[#009668] mt-0.5 shrink-0" />
                    <div className="text-sm text-[#191c1e]">First row must contain unique headers.</div>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-4 h-4 text-[#009668] mt-0.5 shrink-0" />
                    <div className="text-sm text-[#191c1e]">Emails must be in valid format.</div>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-4 h-4 text-[#009668] mt-0.5 shrink-0" />
                    <div className="text-sm text-[#191c1e]">Dates should use YYYY-MM-DD formatting.</div>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-4 h-4 text-[#009668] mt-0.5 shrink-0" />
                    <div className="text-sm text-[#191c1e]">Tags should be comma-separated.</div>
                  </li>
                </ul>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#002113]/5 border border-[#002113]/10">
                <svg className="w-5 h-5 text-[#009668]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                <span className="text-xs font-semibold text-[#009668] uppercase tracking-wider">Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'mapping' && (
          <div className="bg-white rounded-xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#191c1e]">Field Mapping</h3>
                <p className="text-sm text-[#45464d]">We found {parsedRows.length} records. Please verify the field mappings.</p>
              </div>
              <Button variant="secondary" onClick={() => setCurrentStep('upload')}>
                Upload Different File
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f2f4f6]">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#45464d]">CSV Column</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#45464d]">Sample Data</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#45464d]">Maps To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {headers.slice(0, 10).map((header, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-medium">{header}</td>
                      <td className="px-4 py-3 text-sm text-[#45464d]">{parsedRows[0]?.[header.toLowerCase() as keyof ImportContactRow] || '-'}</td>
                      <td className="px-4 py-3">
                        <select
                          className="w-full bg-[#f2f4f6] border-none rounded px-3 py-2 text-sm"
                          value={fieldMapping[header] || 'skip'}
                          onChange={(e) => setFieldMapping(prev => ({ ...prev, [header]: e.target.value }))}
                        >
                          <option value="skip">Skip</option>
                          <option value="email">Email</option>
                          <option value="first_name">First Name</option>
                          <option value="last_name">Last Name</option>
                          <option value="phone">Phone</option>
                          <option value="gender">Gender</option>
                          <option value="student_id">Student ID</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-[#e0e3e5]">
              <Button variant="secondary" onClick={() => setCurrentStep('upload')}>
                Back
              </Button>
              <Button onClick={handleMappingComplete} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Mapping
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'review' && validationResult && (
          <div className="bg-white rounded-xl p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#191c1e]">Review Import</h3>
              <p className="text-sm text-[#45464d]">Review the validation results before importing.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#f2f4f6] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#009668]">{validationResult.valid}</div>
                <div className="text-xs text-[#45464d] uppercase tracking-wider">Valid Records</div>
              </div>
              <div className="bg-[#f2f4f6] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#ba1a1a]">{validationResult.errors}</div>
                <div className="text-xs text-[#45464d] uppercase tracking-wider">Errors</div>
              </div>
              <div className="bg-[#f2f4f6] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#45464d]">{validationResult.duplicates}</div>
                <div className="text-xs text-[#45464d] uppercase tracking-wider">Duplicates</div>
              </div>
            </div>

            {validationResult.errors > 0 && (
              <div className="mb-6 p-4 bg-[#ffdad6] rounded-lg">
                <h4 className="text-sm font-bold text-[#93000a] mb-2">Validation Errors</h4>
                <p className="text-xs text-[#93000a]">
                  Some records have errors. Please fix them in your CSV file and re-upload.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => setCurrentStep('mapping')}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={loading || validationResult.valid === 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${validationResult.valid} Contacts`
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#e0e3e5] p-4 mt-auto">
        <div className="max-w-5xl mx-auto flex justify-end gap-4">
          <Button variant="secondary" onClick={() => navigate('/contacts')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
