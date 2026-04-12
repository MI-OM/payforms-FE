import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { notificationService } from '@/services/notificationService'
import { contactService } from '@/services/contactService'
import { formService } from '@/services/formService'
import { paymentService } from '@/services/paymentService'

interface TopNavProps {
  user?: {
    first_name?: string
    last_name?: string
    email?: string
    role?: string
  }
  onLogout: () => void
  onToggleMobileMenu?: () => void
  notificationCount?: number
  onNotificationCountChange?: (count: number) => void
}

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  const icons: Record<string, string> = {
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    notifications: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
    help_outline: "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z",
    person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    settings: "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  }
  
  const d = icons[name]
  if (!d) return null
  
  return (
    <svg viewBox="0 0 24 24" className="material-symbols-outlined" style={{ width: '1.5rem', height: '1.5rem' }}>
      <path d={d} fill="currentColor"/>
    </svg>
  )
}

export function TopNav({ user, onLogout, onToggleMobileMenu, notificationCount = 0 }: TopNavProps) {
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [badgeCount, setBadgeCount] = useState(notificationCount)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    contacts: { id: string; name: string; email: string }[]
    forms: { id: string; title: string }[]
    transactions: { id: string; reference: string; customer_name: string }[]
  }>({ contacts: [], forms: [], transactions: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults({ contacts: [], forms: [], transactions: [] })
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      const [contactsRes, formsRes, transactionsRes] = await Promise.all([
        contactService.getContacts({ search: query, limit: 5 }),
        formService.getForms({ limit: 5 }),
        paymentService.getTransactions({ limit: 5 }).catch(() => ({ data: [] }))
      ])

      // Filter forms locally since API might not support search
      const forms = formsRes.data.filter(f => 
        f.title.toLowerCase().includes(query.toLowerCase())
      )

      // Filter transactions locally
      const transactions = transactionsRes.data.filter(t =>
        t.reference?.toLowerCase().includes(query.toLowerCase()) ||
        t.customer_name?.toLowerCase().includes(query.toLowerCase()) ||
        t.customer_email?.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults({
        contacts: contactsRes.data.map(c => ({
          id: c.id,
          name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
          email: c.email
        })),
        forms: forms.map(f => ({ id: f.id, title: f.title })),
        transactions: transactions.map(t => ({
          id: t.id,
          reference: t.reference || t.id,
          customer_name: t.customer_name || 'Unknown'
        }))
      })
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (type: string, id: string) => {
    setSearchQuery('')
    setShowResults(false)
    switch (type) {
      case 'contact':
        navigate(`/contacts/${id}`)
        break
      case 'form':
        navigate(`/forms/${id}/fields`)
        break
      case 'transaction':
        navigate(`/transactions/${id}`)
        break
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // If there are results, click the first one, otherwise go to contacts
      if (searchResults.contacts.length > 0) {
        handleResultClick('contact', searchResults.contacts[0].id)
      } else if (searchResults.forms.length > 0) {
        handleResultClick('form', searchResults.forms[0].id)
      } else if (searchResults.transactions.length > 0) {
        handleResultClick('transaction', searchResults.transactions[0].id)
      } else {
        navigate(`/contacts?search=${encodeURIComponent(searchQuery.trim())}`)
        setSearchQuery('')
        setShowResults(false)
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 lg:px-8">
      {/* Mobile Menu Button */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
      >
        <MaterialIcon name="menu" />
      </button>

      {/* Search - Hidden on mobile */}
      <div className="hidden lg:flex justify-center items-center flex-1 max-w-2xl relative" ref={searchRef}>
        <form onSubmit={handleSubmit} className="relative gap-2 w-full flex items-center">
          <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-slate-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-slate-200 transition-all font-headline"
            placeholder="Search contacts, transactions, or forms..."
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
        </form>
        
        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-100 max-h-96 overflow-y-auto z-50">
            {isSearching ? (
              <div className="p-4 text-center text-slate-500">Searching...</div>
            ) : (
              <>
                {searchResults.contacts.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase px-3 py-1">Contacts</div>
                    {searchResults.contacts.map(contact => (
                      <button
                        key={contact.id}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left"
                        onClick={() => handleResultClick('contact', contact.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">{contact.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{contact.name}</div>
                          <div className="text-xs text-slate-500">{contact.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchResults.forms.length > 0 && (
                  <div className="p-2 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-400 uppercase px-3 py-1">Forms</div>
                    {searchResults.forms.map(form => (
                      <button
                        key={form.id}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left"
                        onClick={() => handleResultClick('form', form.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600">F</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900">{form.title}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchResults.transactions.length > 0 && (
                  <div className="p-2 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-400 uppercase px-3 py-1">Transactions</div>
                    {searchResults.transactions.map(tx => (
                      <button
                        key={tx.id}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-left"
                        onClick={() => handleResultClick('transaction', tx.id)}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">T</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{tx.reference}</div>
                          <div className="text-xs text-slate-500">{tx.customer_name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchResults.contacts.length === 0 && searchResults.forms.length === 0 && searchResults.transactions.length === 0 && (
                  <div className="p-4 text-center text-slate-500">No results found</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-slate-500">
          <button 
            onClick={() => navigate('/settings/notifications/scheduled')}
            className="hover:text-slate-900 transition-opacity flex items-center relative"
          >
            <MaterialIcon name="notifications" />
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </button>
          <button className="hover:text-slate-900 transition-opacity flex items-center">
            <MaterialIcon name="help_outline" />
          </button>
        </div>
        <div className="h-6 w-[1px] bg-slate-200 hidden lg:block" />
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-slate-100 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold text-slate-900">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                {user?.role === 'ADMIN' ? 'Admin' : 'Staff'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-600">
                {user?.first_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <p className="text-[10px] text-slate-400 uppercase mt-1">{user?.role === 'ADMIN' ? 'Admin' : 'Staff'}</p>
              </div>
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm"
                onClick={() => setShowUserMenu(false)}
              >
                <MaterialIcon name="person" />
                <span>My Profile</span>
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm"
                onClick={() => setShowUserMenu(false)}
              >
                <MaterialIcon name="settings" />
                <span>Settings</span>
              </Link>
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-red-600 text-sm w-full"
                >
                  <MaterialIcon name="logout" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
