"use client"

import { useMemo, useState } from "react"
import {
  Boxes,
  PackagePlus,
  ShieldPlus,
  Trash2,
  Users,
  Wallet,
} from "lucide-react"
import {
  CATEGORIES,
  formatMoney,
  useStore,
  type Category,
  type Role,
} from "@/lib/store"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import { CategoryBadge, SectionTitle, StatusBadge } from "@/components/shared"

type Tab = "stock" | "users" | "ledger"

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "stock", label: "Barang", icon: PackagePlus },
  { id: "users", label: "User", icon: Users },
  { id: "ledger", label: "Transaksi", icon: Wallet },
]

export function AdminPortal() {
  const { items, transactions } = useStore()
  const [tab, setTab] = useState<Tab>("stock")

  const unpaid = transactions.filter((t) => t.status === "UNPAID").length
  const revenue = transactions.filter((t) => t.status === "PAID").reduce((s, t) => s + t.total, 0)

  return (
    <div className="min-h-screen">
      <AppHeader>
        <nav className="hidden items-center gap-1 rounded-md border border-border bg-card p-1 md:flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-display text-xs font-medium uppercase tracking-widest transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </nav>
      </AppHeader>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <AdminStat label="Total SKU" value={String(items.length)} icon={Boxes} />
          <AdminStat label="Total Transaksi" value={String(transactions.length)} icon={Wallet} />
          <AdminStat label="Belum Dibayar" value={String(unpaid)} icon={Wallet} tone="text-destructive" />
          <AdminStat label="Pendapatan (PAID)" value={formatMoney(revenue)} icon={Wallet} tone="text-chart-4" />
        </div>

        {/* mobile tabs */}
        <div className="mt-6 flex gap-1 rounded-md border border-border bg-card p-1 md:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-2 font-display text-xs font-medium uppercase tracking-widest transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "stock" && <StockManager />}
          {tab === "users" && <UserManager />}
          {tab === "ledger" && <LedgerManager />}
        </div>
      </main>
    </div>
  )
}

function AdminStat({
  label,
  value,
  icon: Icon,
  tone = "text-foreground",
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-display text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={cn("font-display text-lg font-semibold tabular-nums", tone)}>{value}</p>
      </div>
    </div>
  )
}

function StockManager() {
  const { items, addItem, removeItem } = useStore()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<Category>("Weapon")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [image, setImage] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const priceNum = Number(price)
    const stockNum = Number(stock)
    if (!name.trim() || !Number.isFinite(priceNum) || priceNum <= 0 || !Number.isFinite(stockNum) || stockNum < 0) {
      setMsg("Lengkapi nama, harga, dan stok dengan benar.")
      return
    }
    addItem({
      name: name.trim(),
      category,
      price: Math.round(priceNum),
      stock: Math.floor(stockNum),
      image: image.trim() || "/placeholder.svg?height=300&width=400",
    })
    setName("")
    setPrice("")
    setStock("")
    setImage("")
    setMsg("Barang ditambahkan ke inventaris.")
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="lg:sticky lg:top-20 lg:h-fit">
        <SectionTitle title="Tambah Barang" subtitle="Daftarkan stok baru" icon={PackagePlus} />
        <form onSubmit={submit} className="mt-4 space-y-4 rounded-lg border border-border bg-card p-4">
          <Field label="Nama Barang">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="cth. Combat Pistol" />
          </Field>
          <Field label="Kategori">
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-md border px-3 py-2 font-display text-xs font-medium uppercase tracking-widest transition-colors",
                    category === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga ($)">
              <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" className={inputClass} placeholder="4500" />
            </Field>
            <Field label="Stok">
              <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" className={inputClass} placeholder="12" />
            </Field>
          </div>
          <Field label="URL Gambar">
            <input value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="https://… atau /images/…" />
          </Field>
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PackagePlus className="h-4 w-4" />
            Simpan Barang
          </button>
          {msg && (
            <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary" role="status">
              {msg}
            </p>
          )}
        </form>
      </section>

      <section>
        <SectionTitle title="Inventaris" subtitle={`${items.length} barang terdaftar`} icon={Boxes} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
              <img src={item.image || "/placeholder.svg"} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-display text-sm font-semibold uppercase tracking-wide">{item.name}</h3>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Hapus ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1"><CategoryBadge category={item.category} /></div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-semibold tabular-nums text-primary">{formatMoney(item.price)}</span>
                  <span className="text-xs text-muted-foreground">Stok: {item.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function UserManager() {
  const { users, addUser, removeUser, currentUser } = useStore()
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [role, setRole] = useState<Role>("member")
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !/^\d{4}$/.test(pin)) {
      setErr("Nama wajib diisi dan PIN harus 4 digit.")
      return
    }
    const res = addUser({ name: name.trim(), pin, role })
    if (!res.ok) {
      setErr(res.error ?? "Gagal menambah user.")
      return
    }
    setName("")
    setPin("")
    setRole("member")
    setErr(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="lg:sticky lg:top-20 lg:h-fit">
        <SectionTitle title="Tambah User" subtitle="Buat kredensial akses" icon={ShieldPlus} />
        <form onSubmit={submit} className="mt-4 space-y-4 rounded-lg border border-border bg-card p-4">
          <Field label="Nama">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="cth. Kilo" />
          </Field>
          <Field label="PIN (4 digit)">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              className={cn(inputClass, "tracking-[0.4em]")}
              placeholder="0000"
            />
          </Field>
          <Field label="Role">
            <div className="grid grid-cols-2 gap-2">
              {(["member", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-md border px-3 py-2 font-display text-xs font-medium uppercase tracking-widest transition-colors",
                    role === r
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ShieldPlus className="h-4 w-4" />
            Buat User
          </button>
          {err && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
              {err}
            </p>
          )}
        </form>
      </section>

      <section>
        <SectionTitle title="Kelola User" subtitle={`${users.length} akun terdaftar`} icon={Users} />
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-[1fr_100px_100px_60px] gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
            <span>Nama</span>
            <span>PIN</span>
            <span>Role</span>
            <span className="text-right">Aksi</span>
          </div>
          {users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[1fr_100px_100px_60px] sm:gap-4"
            >
              <span className="text-sm font-medium">{u.name}</span>
              <span className="hidden font-mono text-sm tabular-nums text-muted-foreground sm:block">{u.pin}</span>
              <span>
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-widest",
                    u.role === "admin" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {u.role}
                </span>
              </span>
              <span className="flex justify-end">
                <button
                  type="button"
                  disabled={u.id === currentUser?.id}
                  onClick={() => removeUser(u.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Hapus ${u.name}`}
                  title={u.id === currentUser?.id ? "Tidak dapat menghapus diri sendiri" : "Hapus user"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function LedgerManager() {
  const { transactions, setTxStatus } = useStore()
  const sorted = useMemo(() => [...transactions].sort((a, b) => b.createdAt - a.createdAt), [transactions])

  return (
    <section>
      <SectionTitle title="Ubah Status Transaksi" subtitle="Kelola ledger pembayaran" icon={Wallet} />
      <div className="mt-4 space-y-3">
        {sorted.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Belum ada transaksi.
          </p>
        )}
        {sorted.map((t) => (
          <div key={t.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold tabular-nums text-primary">{t.id}</span>
                <span className="text-sm text-muted-foreground">{t.userName}</span>
                <StatusBadge status={t.status} />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-semibold tabular-nums">{formatMoney(t.total)}</span>
                <div className="flex overflow-hidden rounded-md border border-border">
                  <button
                    type="button"
                    onClick={() => setTxStatus(t.id, "PAID")}
                    className={cn(
                      "px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-widest transition-colors",
                      t.status === "PAID" ? "bg-chart-4 text-background" : "bg-transparent text-muted-foreground hover:bg-accent",
                    )}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxStatus(t.id, "UNPAID")}
                    className={cn(
                      "border-l border-border px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-widest transition-colors",
                      t.status === "UNPAID" ? "bg-destructive text-background" : "bg-transparent text-muted-foreground hover:bg-accent",
                    )}
                  >
                    Unpaid
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              {t.lines.map((l, i) => (
                <span key={i} className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs">
                  <CategoryBadge category={l.category} />
                  {l.name} <span className="tabular-nums text-muted-foreground">×{l.qty}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  "h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm outline-none transition-colors focus:border-primary/60"
