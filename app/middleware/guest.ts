export default defineNuxtRouteMiddleware(async () => {
  const { client, authUser, isConfigured, setAuthSession } = useSupabase()

  // If user is already authenticated, redirect to dashboard
  if (import.meta.client && isConfigured) {
    if (!authUser.value && client) {
      try {
        const { data } = await client.auth.getSession()
        if (data?.session) {
          setAuthSession(data.session)
        }
      } catch (e) {
        console.warn('[middleware/guest] Error retrieving session:', e)
      }
    }

    if (authUser.value) {
      return navigateTo('/dashboard')
    }
  }
})
