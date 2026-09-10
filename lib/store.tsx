"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Category = "Weapon" | "Ammo" | "Drugs" | "Equipment"

export const CATEGORIES: Category[] = ["Weapon", "Ammo", "Drugs", "Equipment"]

export type Role = "member" | "admin"

export type Item = {
  id: string
  name: string
  category: Category
  price: number
  stock: number
  image: string
}

export type User = {
  id: string
  name: string
  pin: string
  role: Role
}

export type CartLine = {
  itemId: string
  qty: number
}

export type TxLine = {
  name: string
  category: Category
  price: number
  qty: number
}

export type TxStatus = "PAID" | "UNPAID"

export type Transaction = {
  id: string
  userId: string
  userName: string
  lines: TxLine[]
  total: number
  status: TxStatus
  createdAt: number
}

const SEED_ITEMS: Item[] = [
  { id: "i1", name: "Combat Pistol", category: "Weapon", price: 4500, stock: 12, image: "/images/pistol.png" },
  { id: "i2", name: "Carbine Rifle", category: "Weapon", price: 18500, stock: 5, image: "/images/rifle.png" },
  { id: "i3", name: "9mm Box (x50)", category: "Ammo", price: 850, stock: 240, image: "/images/ammo.png" },
  { id: "i4", name: "Rifle Rounds (x30)", category: "Ammo", price: 1200, stock: 160, image: "/images/ammo.png" },
  { id: "i5", name: "Green Packet", category: "Drugs", price: 320, stock: 88, image: "/images/supply.png" },
  { id: "i6", name: "Refined Batch", category: "Drugs", price: 2100, stock: 24, image: "/images/supply.png" },
  { id: "i7", name: "Kevlar Vest", category: "Equipment", price: 3200, stock: 18, image: "/images/armor.png" },
  { id: "i8", name: "Encrypted Radio", category: "Equipment", price: 1500, stock: 30, image: "/images/radio.png" },
]

const SEED_USERS: User[] = [
  { id: "u_admin", name: "Overseer", pin: "9999", role: "admin" },
  { id: "u1", name: "pukky", pin: "1234", role: "member" },
  { id: "u2", name: "Rook", pin: "1111", role: "member" },
  { id: "u3", name: "Kilo", pin: "2222", role: "member" },
  { id: "u4", name: "Nyx", pin: "3333", role: "member" },
  { id: "u5", name: "Dozer", pin: "4444", role: "member" },
]

const SEED_TX: Transaction[] = [
  {
    id: "TX-0481",
    userId: "u1",
    userName: "Vega",
    lines: [
      { name: "Combat Pistol", category: "Weapon", price: 4500, qty: 1 },
      { name: "9mm Box (x50)", category: "Ammo", price: 850, qty: 2 },
    ],
    total: 6200,
    status: "PAID",
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "TX-0482",
    userId: "u2",
    userName: "Rook",
    lines: [{ name: "Kevlar Vest", category: "Equipment", price: 3200, qty: 1 }],
    total: 3200,
    status: "UNPAID",
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
]

type StoreValue = {
  theme: "dark" | "light"
  toggleTheme: () => void
  currentUser: User | null
  login: (userId: string, pin: string) => { ok: boolean; error?: string }
  logout: () => void
  items: Item[]
  users: User[]
  transactions: Transaction[]
  cart: CartLine[]
  addItem: (item: Omit<Item, "id">) => void
  removeItem: (id: string) => void
  addUser: (user: Omit<User, "id">) => { ok: boolean; error?: string }
  removeUser: (id: string) => void
  addToCart: (itemId: string) => void
  setCartQty: (itemId: string, qty: number) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  checkout: () => { ok: boolean; error?: string }
  setTxStatus: (id: string, status: TxStatus) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [items, setItems] = useState<Item[]>(SEED_ITEMS)
  const [users, setUsers] = useState<User[]>(SEED_USERS)
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TX)
  const [cart, setCart] = useState<CartLine[]>([])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  const login = useCallback(
    (userId: string, pin: string) => {
      const found = users.find((u) => u.id === userId)
      if (!found) return { ok: false, error: "Pilih nama pengguna terlebih dahulu." }
      if (found.pin !== pin.trim()) return { ok: false, error: "PIN salah untuk pengguna ini." }
      setCurrentUser(found)
      setCart([])
      return { ok: true }
    },
    [users],
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setCart([])
  }, [])

  const addItem = useCallback((item: Omit<Item, "id">) => {
    setItems((prev) => [{ ...item, id: uid("i") }, ...prev])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const addUser = useCallback(
    (user: Omit<User, "id">) => {
      if (users.some((u) => u.pin === user.pin)) {
        return { ok: false, error: "PIN sudah digunakan." }
      }
      setUsers((prev) => [...prev, { ...user, id: uid("u") }])
      return { ok: true }
    },
    [users],
  )

  const removeUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const addToCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const line = prev.find((l) => l.itemId === itemId)
      if (line) return prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l))
      return [...prev, { itemId, qty: 1 }]
    })
  }, [])

  const setCartQty = useCallback((itemId: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: Math.max(0, Math.floor(qty) || 0) } : l))
        .filter((l) => l.qty > 0),
    )
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const checkout = useCallback(() => {
    if (!currentUser) return { ok: false, error: "Sesi berakhir." }
    if (cart.length === 0) return { ok: false, error: "Keranjang kosong." }

    const lines: TxLine[] = []
    for (const line of cart) {
      const item = items.find((i) => i.id === line.itemId)
      if (!item) continue
      if (line.qty > item.stock) {
        return { ok: false, error: `Stok ${item.name} tidak mencukupi.` }
      }
      lines.push({ name: item.name, category: item.category, price: item.price, qty: line.qty })
    }

    const total = lines.reduce((s, l) => s + l.price * l.qty, 0)
    const tx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      lines,
      total,
      status: "UNPAID",
      createdAt: Date.now(),
    }

    setItems((prev) =>
      prev.map((i) => {
        const l = cart.find((c) => c.itemId === i.id)
        return l ? { ...i, stock: Math.max(0, i.stock - l.qty) } : i
      }),
    )
    setTransactions((prev) => [tx, ...prev])
    setCart([])
    return { ok: true }
  }, [cart, currentUser, items])

  const setTxStatus = useCallback((id: string, status: TxStatus) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      theme,
      toggleTheme,
      currentUser,
      login,
      logout,
      items,
      users,
      transactions,
      cart,
      addItem,
      removeItem,
      addUser,
      removeUser,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      checkout,
      setTxStatus,
    }),
    [
      theme,
      toggleTheme,
      currentUser,
      login,
      logout,
      items,
      users,
      transactions,
      cart,
      addItem,
      removeItem,
      addUser,
      removeUser,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      checkout,
      setTxStatus,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export function formatMoney(n: number) {
  return "$" + n.toLocaleString("en-US")
}
