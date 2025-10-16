import { useWallet } from '../context/WalletContext'
import { useRouter } from 'next/router'

const QuickActions = () => {
  const { isConnected } = useWallet()
  const router = useRouter()

  const actions = [
    {
      title: 'Register Property',
      description: 'Add a new property to the blockchain',
      icon: '🏠',
      path: '/register',
      color: 'from-blue-500 to-cyan-500',
      requiresAuth: true
    },
    {
      title: 'View Marketplace',
      description: 'Browse available properties',
      icon: '🛒',
      path: '/marketplace',
      color: 'from-green-500 to-emerald-500',
      requiresAuth: false
    },
    {
      title: 'Tokenize Property',
      description: 'Create fractional ownership tokens',
      icon: '💰',
      path: '/tokenized',
      color: 'from-purple-500 to-pink-500',
      requiresAuth: true
    },
    {
      title: 'Verify Properties',
      description: 'Review pending registrations',
      icon: '✅',
      path: '/admin/verify',
      color: 'from-orange-500 to-red-500',
      requiresAuth: true,
      requiresAdmin: true
    }
  ]

  const handleActionClick = (action) => {
    if (action.requiresAuth && !isConnected) {
      // Trigger wallet connect modal
      return
    }
    if (action.requiresAdmin) {
      // Check admin permissions
      return
    }
    router.push(action.path)
  }

  const filteredActions = actions.filter(action => {
    if (action.requiresAdmin) {
      // Add admin check logic here
      return true
    }
    return true
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredActions.map((action, index) => (
        <button
          key={index}
          onClick={() => handleActionClick(action)}
          className="card text-left hover-lift group p-6"
        >
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
            {action.icon}
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            {action.title}
          </h3>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            {action.description}
          </p>
          
          <div className="mt-4 flex items-center text-accent-teal text-sm font-medium">
            Get started
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  )
}

export default QuickActions