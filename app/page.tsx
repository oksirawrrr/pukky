"use client"

import { StoreProvider, useStore } from "@/lib/store"
import { LoginScreen } from "@/components/login-screen"
import { MemberPortal } from "@/components/member-portal"
import { AdminPortal } from "@/components/admin-portal"

function Router() {
  const { currentUser } = useStore()
  if (!currentUser) return <LoginScreen />
  return currentUser.role === "admin" ? <AdminPortal /> : <MemberPortal />
}

export default function Page() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
