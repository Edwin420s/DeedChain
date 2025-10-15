const StatsOverview = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Properties',
      value: stats.totalProperties || 0,
      color: 'text-accent-teal',
      icon: '🏠'
    },
    {
      label: 'Verified Properties',
      value: stats.verifiedProperties || 0,
      color: 'text-green-400',
      icon: '✅'
    },
    {
      label: 'Pending Verifications',
      value: stats.pendingVerifications || 0,
      color: 'text-yellow-400',
      icon: '⏳'
    },
    {
      label: 'Total Users',
      value: stats.totalUsers || 0,
      color: 'text-blue-400',
      icon: '👥'
    },
    {
      label: 'Total Transfers',
      value: stats.totalTransfers || 0,
      color: 'text-purple-400',
      icon: '🔄'
    },
    {
      label: 'Tokenized Properties',
      value: stats.tokenizedProperties || 0,
      color: 'text-indigo-400',
      icon: '💰'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statItems.map((stat, index) => (
        <div key={index} className="card hover:transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-300 text-sm">{stat.label}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
          
          {/* Progress bar for verification rate */}
          {(stat.label === 'Verified Properties' && stats.totalProperties > 0) && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Verification Rate</span>
                <span>{Math.round((stat.value / stats.totalProperties) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stat.value / stats.totalProperties) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default StatsOverview