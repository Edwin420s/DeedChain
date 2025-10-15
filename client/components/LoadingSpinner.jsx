const LoadingSpinner = ({ size = 'md', color = 'teal' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    teal: 'border-accent-teal',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`} />
  )
}

export default LoadingSpinner