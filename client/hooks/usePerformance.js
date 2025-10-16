import { useEffect, useRef } from 'react'

export const usePerformance = (componentName) => {
  const mountTime = useRef(performance.now())
  const renderCount = useRef(0)

  useEffect(() => {
    const mountDuration = performance.now() - mountTime.current
    renderCount.current++

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${componentName} mounted in ${mountDuration.toFixed(2)}ms`)
    }

    return () => {
      const lifeDuration = performance.now() - mountTime.current
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 ${componentName} lifecycle: ${lifeDuration.toFixed(2)}ms, renders: ${renderCount.current}`)
      }
    }
  }, [componentName])

  return {
    markRender: () => {
      renderCount.current++
    }
  }
}