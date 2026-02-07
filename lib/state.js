import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { supabase } from './supabaseClient'

/* =========================
   INITIAL STATE
========================= */

const initialState = {
  user: null,
  profile: null,
  categories: [],
  courses: [],
  favorites: [],
  purchases: [],
  loading: true,
}

/* =========================
   REDUCER
========================= */

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: action.user,
        profile: action.profile,
        loading: false,
      }

    case 'SET_DATA':
      return {
        ...state,
        categories: action.categories || [],
        courses: action.courses || [],
        favorites: action.favorites || [],
        purchases: action.purchases || [],
      }

    default:
      return state
  }
}

/* =========================
   CONTEXT
========================= */

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  /* ---------- AUTH ---------- */
  useEffect(() => {
    async function initAuth() {
      const { data } = await supabase.auth.getSession()
      const user = data?.session?.user || null

      const profile = user
        ? {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
            name: user.user_metadata?.name || '',
            avatar: user.user_metadata?.avatar || '',
          }
        : null

      dispatch({ type: 'SET_AUTH', user, profile })
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      const user = session?.user || null

      const profile = user
        ? {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
            name: user.user_metadata?.name || '',
            avatar: user.user_metadata?.avatar || '',
          }
        : null

      dispatch({ type: 'SET_AUTH', user, profile })
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  /* ---------- MOCK DATA (localStorage) ---------- */
  useEffect(() => {
    const data = {
      categories: JSON.parse(localStorage.getItem('categories') || '[]'),
      courses: JSON.parse(localStorage.getItem('courses') || '[]'),
      favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
      purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
    }

    dispatch({ type: 'SET_DATA', ...data })
  }, [])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      isAuthor: state.profile?.role === 'author',
    }),
    [state]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/* =========================
   HOOK
========================= */

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

/* =========================
   SELECTORS (ВАЖНО!)
========================= */

export function selectCategories(state) {
  return state.categories || []
}

export function selectCourses(state) {
  return state.courses || []
}

export function selectFavorites(state) {
  return state.favorites || []
}

export function selectPurchases(state) {
  return state.purchases || []
}
