export default defineNuxtRouteMiddleware(async (to) => {
  const { client, authUser, isConfigured, setAuthSession } = useSupabase()

  // In client environment, if Supabase is connected and no active user session, verify session
  if (import.meta.client && isConfigured) {
    if (!authUser.value && client) {
      try {
        const { data } = await client.auth.getSession()
        if (data?.session) {
          setAuthSession(data.session)
        }
      } catch (e) {
        console.warn('[middleware/auth] Error retrieving session:', e)
      }
    }

    if (!authUser.value) {
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
})
