import { cn } from "@/lib/utils"
import { Search, Bell, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface TopNavProps {
  className?: string
}

export function TopNav({ className }: TopNavProps) {
  return (
    <header className={cn("sticky top-0 z-40 flex justify-between items-center px-8 w-full ml-64 h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/15 dark:border-slate-800/15 font-['Manrope'] text-sm uppercase tracking-widest font-bold", className)}>
      <div className="flex items-center flex-1">
        <div className="relative w-96 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-4 w-4" />
          <Input 
            className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm lowercase tracking-normal" 
            placeholder="Search activities..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="hover:text-slate-950 dark:hover:text-white transition-all">
          <Bell className="h-6 w-6" />
        </button>
        <button className="hover:text-slate-950 dark:hover:text-white transition-all">
          <HelpCircle className="h-6 w-6" />
        </button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGn1DQc79_E48pOVL90nU4BrdWF_O9bxKMGmW2VMAcSQ6T7PqI4mtYKcAS84Bkg3MYqVzf74Lu0ZTTzH2zgQ7jAlKd-cfHvqGIIjcOEwYNZJSK89i4X2JooFzEO-j0eVPOIUeON0HGtNV346Jj0cKEqFwK01bW64gD9DvP7rN-RVWY1vblnniiuh1Bg0-nrVQPVnbBfBRsdw4sKQGC7ClC1JQCsUIk9I54CiKwQLBaRFhEgn0-ZZ6NlW_CBA6QuT3VGO5xA91xtNQ" alt="Administrator Profile" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
