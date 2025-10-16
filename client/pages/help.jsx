import { useState } from 'react'
import Navbar from '../components/Navbar'

const HelpPage = () => {
  const [activeCategory, setActiveCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = {
    general: [
      {
        question: 'What is DeedChain?',
        answer: 'DeedChain is a blockchain-based platform for land and property ownership verification, tokenization, and transfer. It helps combat land fraud by digitizing property deeds into on-chain NFTs.'
      },
      {
        question: 'How does property registration work?',
        answer: 'Property registration involves uploading property details and documents, which are stored on IPFS. The property is then minted as an NFT on the blockchain and goes through a verification process by trusted validators.'
      },
      {
        question: 'What blockchain does DeedChain use?',
        answer: 'DeedChain currently operates on Polygon blockchain for low gas fees and fast transactions, with plans to expand to other EVM-compatible chains.'
      }
    ],
    registration: [
      {
        question: 'What documents do I need to register a property?',
        answer: 'You need the property title deed, survey documents, identification documents, and any other relevant ownership proofs. All documents are stored securely on IPFS.'
      },
      {
        question: 'How long does verification take?',
        answer: 'Verification typically takes 2-5 business days, depending on the complexity of the property and validator availability.'
      },
      {
        question: 'Can I register multiple properties?',
        answer: 'Yes, you can register multiple properties. Each property is minted as a separate NFT with its own unique token ID.'
      }
    ],
    tokenization: [
      {
        question: 'What is property tokenization?',
        answer: 'Property tokenization allows you to convert property ownership into fractional ERC-20 tokens, enabling multiple investors to own shares of a single property.'
      },
      {
        question: 'How do I tokenize my property?',
        answer: 'Navigate to the tokenization section, select your verified property, set token parameters (name, symbol, supply), and confirm the transaction. The original NFT gets locked and tokens are minted.'
      },
      {
        question: 'Can I reverse tokenization?',
        answer: 'Yes, tokenization can be reversed by burning all tokens and unlocking the original NFT, provided you own all outstanding tokens.'
      }
    ],
    technical: [
      {
        question: 'What wallets are supported?',
        answer: 'DeedChain supports all EVM-compatible wallets including MetaMask, WalletConnect, Coinbase Wallet, and others.'
      },
      {
        question: 'What are the gas fees?',
        answer: 'Gas fees vary based on network congestion. On Polygon, fees are typically very low ($0.01-$0.10 per transaction).'
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes, all sensitive documents are encrypted and stored on IPFS. Ownership records are immutable on the blockchain.'
      }
    ]
  }

  const filteredFAQs = faqCategories[activeCategory].filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-deedchain-navy">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions and learn how to use DeedChain
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal transition-colors"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <nav className="space-y-2">
                {Object.keys(faqCategories).map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeCategory === category
                        ? 'bg-accent-teal text-deedchain-navy font-semibold'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6 capitalize">
                {activeCategory} Questions
              </h2>

              {filteredFAQs.length > 0 ? (
                <div className="space-y-6">
                  {filteredFAQs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-700 last:border-0 pb-6 last:pb-0">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-300">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </div>

            {/* Contact Support */}
            <div className="card mt-8 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-700">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-3">Still need help?</h3>
                <p className="text-gray-300 mb-4">
                  Our support team is here to assist you with any questions or issues.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-primary">
                    Contact Support
                  </button>
                  <button className="btn-secondary">
                    Join Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage