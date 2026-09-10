"use client"

import { useState } from "react"
import { Delete, Lock } from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Brand, ThemeToggle } from "@/components/shared"

const PIN_LENGTH = 4

export function LoginScreen() {
  const { login } = useStore()
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  function press(digit: string) {
    setError(null)
    setPin((p) => (p.length >= PIN_LENGTH ? p : p + digit))
  }

  function back() {
    setError(null)
    setPin((p) => p.slice(0, -1))
  }

  function submit(value: string) {
    const res = login(value)
    if (!res.ok) {
      setError(res.error ?? "Akses ditolak.")
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setPin("")
    }
  }

  function handleDigit(digit: string) {
    const next = pin.length >= PIN_LENGTH ? pin : pin + digit
    setError(null)
    setPin(next)
    if (next.length === PIN_LENGTH) {
      setTimeout(() => submit(next), 120)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Brand />
          <p className="max-w-xs text-balance text-sm text-muted-foreground">
            Terminal akses terenkripsi. Masukkan PIN keanggotaan Anda untuk membuka brankas.
          </p>
        </div>

        <div
          className={cn(
            "rounded-xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur",
            shake && "animate-[wiggle_0.4s_ease-in-out]",
          )}
        >
          <div className="mb-5 flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-display text-xs uppercase tracking-[0.25em]">Kode Akses</span>
          </div>

          <div className="mb-6 flex justify-center gap-3">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-3.5 w-3.5 rounded-full border transition-all",
                  i < pin.length ? "scale-110 border-primary bg-primary" : "border-muted-foreground/40 bg-transparent",
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <KeypadButton key={d} onClick={() => handleDigit(d)}>
                {d}
              </KeypadButton>
            ))}
            <div />
            <KeypadButton onClick={() => handleDigit("0")}>0</KeypadButton>
            <KeypadButton onClick={back} aria-label="Hapus" muted>
              <Delete className="h-5 w-5" />
            </KeypadButton>
          </div>

          <p
            className={cn(
              "mt-5 min-h-[1.25rem] text-center text-sm font-medium",
              error ? "text-destructive" : "text-transparent",
            )}
            role="status"
          >
            {error ?? "."}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-center text-xs">
          <div className="rounded-md border border-border bg-card/60 px-3 py-2">
            <p className="font-display uppercase tracking-widest text-muted-foreground">Demo Member</p>
            <p className="mt-0.5 font-medium">PIN 1234</p>
          </div>
          <div className="rounded-md border border-border bg-card/60 px-3 py-2">
            <p className="font-display uppercase tracking-widest text-muted-foreground">Demo Admin</p>
            <p className="mt-0.5 font-medium">PIN 9999</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes wiggle{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
    </div>
  )
}

function KeypadButton({
  children,
  onClick,
  muted,
  ...rest
}: {
  children: React.ReactNode
  onClick: () => void
  muted?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 items-center justify-center rounded-md border border-border font-display text-xl font-medium transition-all active:scale-95",
        muted
          ? "bg-transparent text-muted-foreground hover:bg-accent"
          : "bg-secondary text-foreground hover:border-primary/50 hover:bg-accent",
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
