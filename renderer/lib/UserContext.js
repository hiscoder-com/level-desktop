import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const UserContext = createContext({ user: null, session: false, loading: true })

export const UserContextProvider = (props) => {
  const { supabaseClient } = props
  const [session, setSession] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getUser = useCallback(async () => {
    if (!session || !session.user?.id) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data: user, error } = await supabaseClient
        .from('users_view')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (error) throw error
      setUser(user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [session, supabaseClient])

  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await supabaseClient.auth.getSession()
      setSession(sessionData)
    }
    getSession()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, sessionData) => {
        setSession(sessionData)
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [supabaseClient])

  useEffect(() => {
    getUser()
  }, [getUser])

  const value = {
    session,
    user,
    loading,
    getUser,
  }

  return <UserContext.Provider value={value} {...props} />
}

export const useCurrentUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error(`useCurrentUser must be used within a UserContextProvider.`)
  }
  return context
}
