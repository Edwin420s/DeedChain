import { useState, useRef, useEffect } from 'react'

const LazyImage = ({ src, alt, className, fallback = '/images/placeholder.jpg' }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = imgRef.current
            if (img) {
              img.src = src
              observer.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src])

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse rounded" />
      )}
      <img
        ref={imgRef}
        src={error ? fallback : undefined}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded && !error ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  )
}

export default LazyImage