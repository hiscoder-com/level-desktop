import { createClient } from '@supabase/supabase-js'

const supabaseApi = async () => {
  const supabaseServerApi = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    const { data: session, error } = await supabaseServerApi.auth.getSession()
    if (error || !session) {
      throw new Error('Access denied!')
    }
  } catch (error) {
    console.error('Ошибка при проверке сессии:', error)
    throw error
  }

  return supabaseServerApi
}

export default supabaseApi
