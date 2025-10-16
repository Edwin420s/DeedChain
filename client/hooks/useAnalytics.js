import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { analytics } from '../utils/analytics'

export const useAnalytics = () => {
  const router = useRouter()
  const pageLoaded = useRef(false)

  useEffect(() => {
    const handleRouteChange = (url) => {
      analytics.trackPageView(url)
    }

    // Track initial page load
    if (!pageLoaded.current) {
      analytics.trackPageView(router.pathname)
      pageLoaded.current = true
    }

    // Track route changes
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return analytics
}