const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center mr-3">
                <span className="text-deedchain-navy font-bold text-lg">D</span>
              </div>
              <span className="text-white text-xl font-bold">DeedChain</span>
            </div>
            <p className="text-gray-300 max-w-md">
              Revolutionizing land ownership through blockchain technology. 
              Bringing transparency, security, and accessibility to property registration and transfer.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/marketplace" className="hover:text-accent-teal transition-colors">Marketplace</a></li>
              <li><a href="/dashboard" className="hover:text-accent-teal transition-colors">Dashboard</a></li>
              <li><a href="/register" className="hover:text-accent-teal transition-colors">Register Property</a></li>
              <li><a href="/verify" className="hover:text-accent-teal transition-colors">Verify Property</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-accent-teal transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-accent-teal transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 DeedChain. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-accent-teal transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-accent-teal transition-colors">
              GitHub
            </a>
            <a href="#" className="text-gray-400 hover:text-accent-teal transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer