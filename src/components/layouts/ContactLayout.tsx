import { useState } from 'react'
import { cn } from "@/lib/utils"
import { Outlet } from "react-router-dom"
import { ContactSidebar } from "./ContactSidebar"

interface ContactLayoutProps {
  children?: React.ReactNode
}

export function ContactLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <ContactSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={cn(
        "min-h-screen bg-[#f7f9fb] flex flex-col transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <section className="flex-1 overflow-hidden">
          <Outlet />
        </section>
      </main>
    </div>
  )
}