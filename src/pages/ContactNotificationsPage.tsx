import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contactAuthService, type ContactNotification } from '@/services/contactAuthService'
import { Bell, Check, Loader2, FileText } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function ContactNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<ContactNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const fetchNotifications = async (pageNum: number = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const response = await contactAuthService.getNotifications({ 
        page: pageNum, 
        limit: 20 
      })
      
      if (append) {
        setNotifications(prev => [...prev, ...response.data])
      } else {
        setNotifications(response.data)
      }
      
      setHasMore(response.data.length > 0 && pageNum < response.totalPages)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      toast({ 
        title: 'Error', 
        description: 'Failed to load notifications', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setMarkingId(notificationId)
      await contactAuthService.markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    } finally {
      setMarkingId(null)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNotifications(page + 1, true)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You have no unread notifications'}
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              You don't have any notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  !notification.is_read ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    handleMarkAsRead(notification.id)
                  }
                  if (notification.link) {
                    navigate(notification.link)
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notification.is_read ? 'bg-gray-100' : 'bg-blue-100'
                  }`}>
                    <FileText className={`w-5 h-5 ${notification.is_read ? 'text-gray-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        disabled={markingId === notification.id}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {markingId === notification.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}