"use client"

import { useState } from "react"
import { ChevronDown, Delete } from "lucide-react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Brand, ThemeToggle } from "@/components/shared"

const PIN_LENGTH = 4

export function LoginScreen() {
  const { users, login } = useStore()
  const [userId, setUserId] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const selectedUser = users.find((u) => u.id === userId)

  function handleDigit(digit: string) {
    setError(null)
    setPin((p) => (p.length >= PIN_LENGTH ? p : p + digit))
  }

  function back() {
    setError(null)
    setPin((p) => p.slice(0, -1))
  }

  function submit() {
    if (!userId) {
      setError("Pilih nama pengguna terlebih dahulu.")
      return
    }
    if (pin.length < PIN_LENGTH) {
      setError("Masukkan 4 digit PIN.")
      return
    }
    const res = login(userId, pin)
    if (!res.ok) {
      setError(res.error ?? "Akses ditolak.")
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setPin("")
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
            shake && "animate-[wiggle_0.4s_ease-in-out]",
          )}
        >
          <div className="relative flex flex-col items-center bg-primary px-6 pb-14 pt-8 text-primary-foreground">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-primary-foreground/30 bg-white">
              <img src="/images/mx-logo.png" alt="MX Brangkas" className="h-full w-full object-contain p-1" />
            </div>
            <div className="absolute -bottom-6 left-1/2 h-12 w-[130%] -translate-x-1/2 rounded-[100%] bg-card" />
          </div>

          <div className="px-6 pb-7 pt-2 text-center">
            <h1 className="font-display text-2xl font-bold uppercase tracking-[0.15em]">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pilih nama Anda, lalu masukkan PIN.</p>

            <div className="mt-5">
              <div className="relative">
                <select
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    setPin("")
                    setError(null)
                  }}
                  className={cn(
                    "w-full appearance-none rounded-lg border border-input bg-secondary px-4 py-3 text-left text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/40",
                    !userId && "text-muted-foreground",
                  )}
                  aria-label="Pilih nama pengguna"
                >
                  <option value="">Pilih Username...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} · {u.role === "admin" ? "Admin" : "Member"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="mb-5 mt-6 flex justify-center gap-3">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5 rounded-full border transition-all",
                    i < pin.length
                      ? "scale-110 border-primary bg-primary"
                      : "border-muted-foreground/40 bg-transparent",
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <KeypadButton key={d} onClick={() => handleDigit(d)} disabled={!userId}>
                  {d}
                </KeypadButton>
              ))}
              <KeypadButton onClick={back} aria-label="Hapus" muted disabled={!userId || pin.length === 0}>
                <Delete className="h-5 w-5" />
              </KeypadButton>
              <KeypadButton onClick={() => handleDigit("0")} disabled={!userId}>
                0
              </KeypadButton>
              <span />
            </div>

            <p
              className={cn(
                "mt-4 min-h-[1.25rem] text-sm font-medium",
                error ? "text-destructive" : "text-transparent",
              )}
              role="status"
            >
              {error ?? "."}
            </p>

            <button
              type="button"
              onClick={submit}
              className="mt-1 w-full rounded-lg bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-[0.15em] text-primary-foreground transition-all hover:brightness-95 active:scale-[0.99]"
            >
              Continue
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <ThemeToggle variant="pill" />
        </div>

        {selectedUser && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo PIN {selectedUser.name}: <span className="font-medium text-foreground">{selectedUser.pin}</span>
          </p>
        )}
      </div>

      <style>{`@keyframes wiggle{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
    </div>
  )
}

function KeypadButton({
  children,
  onClick,
  muted,
  disabled,
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
      disabled={disabled}
      className={cn(
        "flex h-14 items-center justify-center rounded-full font-display text-xl font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
        muted
          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
          : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground",
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
