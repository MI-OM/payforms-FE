import { useState } from 'react'
import { Upload, FileSpreadsheet, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImportContacts() {
  const [step, setStep] = useState(1)

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Import Contacts</h1>
                <p className="text-gray-500">Upload a CSV file to bulk import contacts</p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center mb-6">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-bold text-gray-900 mb-2">Drag and drop your CSV file here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <Button variant="secondary">Browse Files</Button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">contacts_sample.csv</p>
                  <p className="text-sm text-gray-500">1,248 contacts ready to import</p>
                </div>
                <button className="text-gray-400 hover:text-red-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1">Cancel</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>Continue</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Map Fields</h1>
                <p className="text-gray-500">Match your CSV columns to contact fields</p>
              </div>

              <div className="space-y-4 mb-6">
                {['Email', 'First Name', 'Last Name', 'Phone', 'Company'].map((field) => (
                  <div key={field} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-900">{field}</span>
                    <select className="w-48 h-8 px-2 bg-white border border-gray-200 rounded text-sm">
                      <option>Select column...</option>
                      <option>Column A</option>
                      <option>Column B</option>
                      <option>Column C</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Review Import</h1>
                <p className="text-gray-500">Review your contacts before importing</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 text-gray-500">Email</th>
                      <th className="text-left p-2 text-gray-500">Name</th>
                      <th className="text-left p-2 text-gray-500">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-2 text-gray-700">sarah@studio-h.co</td>
                      <td className="p-2 text-gray-900">Sarah Higgins</td>
                      <td className="p-2 text-gray-700">Studio H</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-2 text-gray-700">mk@krayarch.com</td>
                      <td className="p-2 text-gray-900">Marcus Kray</td>
                      <td className="p-2 text-gray-700">Kray Architecture</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(4)}>Import Contacts</Button>
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
                <p className="text-gray-500">Successfully imported 1,248 contacts</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">1,248</p>
                  <p className="text-xs text-gray-500">Imported</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">12</p>
                  <p className="text-xs text-gray-500">Duplicates</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">0</p>
                  <p className="text-xs text-gray-500">Errors</p>
                </div>
              </div>

              <Button className="w-full">Done</Button>
            </>
          )}
        </div>
      </div>
  )
}
