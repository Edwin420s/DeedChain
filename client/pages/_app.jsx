import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import { polygon, polygonMumbai } from 'wagmi/chains'
import '../styles/globals.css'

const { provider, webSocketProvider } = configureChains(
  [polygon, polygonMumbai],
  [publicProvider()]
)

const client = createClient(
  getDefaultClient({
    appName: 'DeedChain',
    chains: [polygon, polygonMumbai],
    provider,
    webSocketProvider,
  })
)

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <div className="min-h-screen bg-deedchain-navy text-white">
          <Component {...pageProps} />
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default MyApp