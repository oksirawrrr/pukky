"use client"

import { LogOut } from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Brand, ThemeToggle } from "@/components/shared"

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const { currentUser, logout } = useStore()
  if (!currentUser) return null

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Brand />
        <div className="flex items-center gap-2 sm:gap-3">
          {children}
          <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 sm:flex">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <span
              className={cn(
                "rounded-sm px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-widest",
                currentUser.role === "admin"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {currentUser.role}
            </span>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
