"use client"

import { cn } from "@/lib/utils"
import { Moon, Shield, Sun } from "lucide-react"
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

export function ThemeToggle() {
  const { theme, toggleTheme } = useStore()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Shield className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="font-display text-lg font-semibold uppercase tracking-[0.2em]">BRANGKAS MX</p>
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
