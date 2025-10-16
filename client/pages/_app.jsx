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

export default MyAppimport { WagmiConfig, createClient, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { WalletProvider } from '../context/WalletContext'
import { ContractProvider } from '../context/ContractContext'
import { AccessibilityProvider } from '../components/AccessibilityProvider'
import ErrorBoundary from '../components/ErrorBoundary'
import NetworkStatus from '../components/NetworkStatus'
import OfflineIndicator from '../components/OfflineIndicator'
import RealTimeUpdates from '../components/RealTimeUpdates'
import ScrollToTop from '../components/ScrollToTop'
import AccessibilityToolbar from '../components/AccessibilityToolbar'
import SecurityMonitor from '../components/SecurityMonitor'
import OnboardingTour from '../components/OnboardingTour'
import SEOHead from '../components/SEOHead'
import Footer from '../components/Footer'
import '../styles/globals.css'
import '../styles/theme.css'

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
    <ErrorBoundary>
      <SEOHead />
      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <AccessibilityProvider>
            <WalletProvider>
              <ContractProvider>
                <div className="min-h-screen bg-deedchain-navy text-white theme-transition">
                  <NetworkStatus />
                  <OfflineIndicator />
                  <RealTimeUpdates />
                  <ScrollToTop />
                  <AccessibilityToolbar />
                  <SecurityMonitor />
                  <OnboardingTour />
                  
                  <Component {...pageProps} />
                  
                  <Footer />
                </div>
              </ContractProvider>
            </WalletProvider>
          </AccessibilityProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </ErrorBoundary>
  )
}

export default MyApp