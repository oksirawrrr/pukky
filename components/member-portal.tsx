"use client"

import { useMemo, useState } from "react"
import { Minus, Package, Plus, Receipt, ScrollText, Search, ShoppingCart, Trash2, Check } from "lucide-react"
import { CATEGORIES, formatMoney, useStore, type Category } from "@/lib/store"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import { CategoryBadge, SectionTitle, StatusBadge } from "@/components/shared"

export function MemberPortal() {
  const { items, cart, currentUser, transactions, addToCart, setCartQty, removeFromCart, checkout } = useStore()
  const [filter, setFilter] = useState<Category | "Semua">("Semua")
  const [query, setQuery] = useState("")
  const [flash, setFlash] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchCat = filter === "Semua" || i.category === filter
      const matchQuery = i.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchCat && matchQuery
    })
  }, [items, filter, query])

  const cartDetailed = useMemo(
    () =>
      cart
        .map((line) => {
          const item = items.find((i) => i.id === line.itemId)
          return item ? { ...line, item } : null
        })
        .filter((x): x is { itemId: string; qty: number; item: (typeof items)[number] } => Boolean(x)),
    [cart, items],
  )

  const cartTotal = cartDetailed.reduce((s, l) => s + l.item.price * l.qty, 0)
  const cartCount = cartDetailed.reduce((s, l) => s + l.qty, 0)

  const myTx = useMemo(
    () => transactions.filter((t) => t.userId === currentUser?.id).sort((a, b) => b.createdAt - a.createdAt),
    [transactions, currentUser],
  )
  const unpaidTotal = myTx.filter((t) => t.status === "UNPAID").reduce((s, t) => s + t.total, 0)

  function handleCheckout() {
    const res = checkout()
    setFlash(res.ok ? "Transaksi tercatat pada ledger (status UNPAID)." : (res.error ?? "Gagal."))
    setTimeout(() => setFlash(null), 3500)
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <StatRow items={filtered.length} cartTotal={cartTotal} unpaid={unpaidTotal} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Catalog */}
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle title="Katalog Stok" subtitle="Inventaris brankas aktif" icon={Package} />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari barang…"
                  className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/60 sm:w-56"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["Semua", ...CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 font-display text-xs font-medium uppercase tracking-widest transition-colors",
                    filter === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => {
                const inCart = cart.find((l) => l.itemId === item.id)?.qty ?? 0
                const soldOut = item.stock <= 0
                return (
                  <article
                    key={item.id}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-2 top-2">
                        <CategoryBadge category={item.category} />
                      </div>
                      {soldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/70 font-display text-sm font-semibold uppercase tracking-widest text-destructive">
                          Stok Habis
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3.5">
                      <h3 className="font-display text-base font-semibold uppercase tracking-wide">{item.name}</h3>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="font-semibold tabular-nums text-primary">{formatMoney(item.price)}</span>
                        <span className="text-xs text-muted-foreground">Stok: {item.stock}</span>
                      </div>
                      <button
                        type="button"
                        disabled={soldOut}
                        onClick={() => addToCart(item.id)}
                        className="mt-3.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                        {inCart > 0 ? `Di keranjang (${inCart})` : "Tambah"}
                      </button>
                    </div>
                  </article>
                )
              })}
              {filtered.length === 0 && (
                <p className="col-span-full rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                  Tidak ada barang yang cocok.
                </p>
              )}
            </div>
          </section>

          {/* Cart + summary */}
          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em]">Keranjang</h2>
                </div>
                <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums">{cartCount}</span>
              </div>

              <div className="max-h-[320px] overflow-y-auto p-2">
                {cartDetailed.length === 0 && (
                  <p className="px-2 py-8 text-center text-sm text-muted-foreground">Keranjang kosong.</p>
                )}
                {cartDetailed.map(({ item, qty }) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/60">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs tabular-nums text-muted-foreground">{formatMoney(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <QtyBtn onClick={() => setCartQty(item.id, qty - 1)} aria-label="Kurangi">
                        <Minus className="h-3.5 w-3.5" />
                      </QtyBtn>
                      <span className="w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
                      <QtyBtn
                        onClick={() => setCartQty(item.id, Math.min(item.stock, qty + 1))}
                        aria-label="Tambah"
                        disabled={qty >= item.stock}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </QtyBtn>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="ml-1 text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Hapus dari keranjang"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transaction summary */}
              <div className="border-t border-border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Ringkasan Transaksi
                  </h3>
                </div>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Item</dt>
                    <dd className="tabular-nums">{cartCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatMoney(cartTotal)}</dd>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums text-primary">{formatMoney(cartTotal)}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={cartDetailed.length === 0}
                  onClick={handleCheckout}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                  Proses Transaksi
                </button>
                {flash && (
                  <p className="mt-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary" role="status">
                    {flash}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Ledger */}
        <section className="mt-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle title="Ledger Status" subtitle="Riwayat & tanggungan pembayaran Anda" icon={ScrollText} />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Belum dibayar:</span>
              <span className="font-semibold tabular-nums text-destructive">{formatMoney(unpaidTotal)}</span>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <div className="hidden grid-cols-[120px_1fr_120px_120px] gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 font-display text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
              <span>ID</span>
              <span>Barang</span>
              <span className="text-right">Total</span>
              <span className="text-right">Status</span>
            </div>
            {myTx.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">Belum ada transaksi.</p>
            )}
            {myTx.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-2 gap-2 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-[120px_1fr_120px_120px] sm:items-center sm:gap-4"
              >
                <span className="font-display text-sm font-medium tabular-nums text-primary">{t.id}</span>
                <span className="col-span-2 order-3 text-sm text-muted-foreground sm:order-none sm:col-span-1">
                  {t.lines.map((l) => `${l.name} ×${l.qty}`).join(", ")}
                </span>
                <span className="text-right text-sm font-medium tabular-nums sm:order-none">{formatMoney(t.total)}</span>
                <span className="flex justify-start sm:justify-end">
                  <StatusBadge status={t.status} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function StatRow({ items, cartTotal, unpaid }: { items: number; cartTotal: number; unpaid: number }) {
  const stats = [
    { label: "Barang Tersedia", value: String(items), tone: "text-foreground" },
    { label: "Nilai Keranjang", value: formatMoney(cartTotal), tone: "text-primary" },
    { label: "Tanggungan (UNPAID)", value: formatMoney(unpaid), tone: "text-destructive" },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="font-display text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {s.label}
          </p>
          <p className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", s.tone)}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function QtyBtn({
  children,
  ...rest
}: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-secondary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      {...rest}
    >
      {children}
    </button>
  )
}
