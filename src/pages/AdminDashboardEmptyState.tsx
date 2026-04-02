export function AdminDashboardEmptyState() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📊</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">No Data Yet</h1>
        <p className="text-on-surface-variant mb-6">
          Start by creating your first form or importing contacts to see your dashboard come to life.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 bg-primary text-white rounded-md font-bold text-sm">
            Create Form
          </button>
          <button className="px-4 py-2 bg-surface-container-high text-on-surface rounded-md font-bold text-sm">
            Import Contacts
          </button>
        </div>
      </div>
    </div>
  )
}
