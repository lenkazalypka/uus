import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthCtx = createContext({ user: null, loading: true, signOut: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let sub = null
    async function init() {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
      const { data: on } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
      sub = on?.subscription
    }
    init()
    return () => sub?.unsubscribe?.()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [user, loading]
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
