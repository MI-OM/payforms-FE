import type { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="space-y-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-8 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="w-6 h-6" />
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="bg-blue-50 p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="ml-auto h-8 w-20 rounded-lg" />
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <div className="divide-y">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="h-64 flex items-end justify-between gap-4">
        {[60, 80, 45, 90, 70, 55].map((height, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <StatsSkeleton count={4} />
      </div>
      <div className="mt-6">
        <ChartSkeleton />
      </div>
    </div>
  )
}
