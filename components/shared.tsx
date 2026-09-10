"use client"

import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import type { Category, TxStatus } from "@/lib/store"
import { useStore } from "@/lib/store"

const categoryStyles: Record<Category, string> = {
  Weapon: "bg-primary/15 text-primary border-primary/30",
  Ammo: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  Drugs: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  Equipment: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
}

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-display text-[11px] font-medium uppercase tracking-widest",
        categoryStyles[category],
        className,
      )}
    >
      {category}
    </span>
  )
}

export function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-widest",
        status === "PAID"
          ? "border-chart-4/40 bg-chart-4/15 text-chart-4"
          : "border-destructive/40 bg-destructive/15 text-destructive",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "PAID" ? "bg-chart-4" : "bg-destructive")} />
      {status}
    </span>
  )
}

export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "pill" }) {
  const { theme, toggleTheme } = useStore()
  const isLight = theme === "light"

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-pressed={isLight}
        aria-label={isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
      >
        {isLight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="font-display text-xs font-medium uppercase tracking-[0.2em]">
          {isLight ? "Light Mode" : "Dark Mode"}
        </span>
        <span
          className={cn(
            "relative h-5 w-9 rounded-full border border-border transition-colors",
            isLight ? "bg-primary" : "bg-secondary",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-card shadow transition-all",
              isLight ? "left-4" : "left-0.5",
            )}
          />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label={isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
      title={isLight ? "Mode gelap" : "Mode terang"}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
        <img src="/images/mx-logo.png" alt="MX Brangkas" className="h-full w-full object-contain" />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="font-display text-lg font-semibold uppercase tracking-[0.2em]">MX BRANGKAS</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Brankas &amp; Inventaris</p>
        </div>
      )}
    </div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-primary">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em]">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}
