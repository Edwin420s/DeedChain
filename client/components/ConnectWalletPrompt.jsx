import { useConnectModal } from 'connectkit'

const ConnectWalletPrompt = ({ 
  title = "Connect Your Wallet",
  description = "Connect your wallet to access DeedChain features",
  showOnPage = true 
}) => {
  const { openConnectModal } = useConnectModal()

  if (!showOnPage) return null

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="card text-center max-w-md">
        <div className="w-20 h-20 bg-accent-teal/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-gray-300 mb-6">{description}</p>
        
        <button
          onClick={openConnectModal}
          className="w-full btn-primary py-4 text-lg"
        >
          Connect Wallet
        </button>
        
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Supported Wallets</h4>
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>MetaMask</span>
            <span>WalletConnect</span>
            <span>Coinbase</span>
            <span>Trust Wallet</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectWalletPrompt