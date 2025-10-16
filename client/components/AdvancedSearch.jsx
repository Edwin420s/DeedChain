import { useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'

const AdvancedSearch = ({ onSearch, onFiltersChange, className = '' }) => {
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    minArea: '',
    maxArea: '',
    priceRange: '',
    propertyType: '',
    status: '',
    sortBy: 'newest'
  })

  const debouncedQuery = useDebounce(filters.query, 300)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    if (key === 'query') {
      onSearch?.(value)
    } else {
      onFiltersChange?.(newFilters)
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      query: '',
      location: '',
      minArea: '',
      maxArea: '',
      priceRange: '',
      propertyType: '',
      status: '',
      sortBy: 'newest'
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
    onSearch?.('')
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'sortBy' && value !== ''
  )

  return (
    <div className={`card ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h3 className="text-xl font-semibold text-white mb-4 lg:mb-0">Advanced Search</h3>
        
        <div className="flex items-center space-x-4">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-accent-teal hover:underline"
            >
              Clear All Filters
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-accent-teal"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_asc">Area: Small to Large</option>
              <option value="area_desc">Area: Large to Small</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search Query */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Properties
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              placeholder="Search by address, survey number, or description..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal transition-colors"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            placeholder="City or region..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-teal transition-colors"
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="agricultural">Agricultural</option>
            <option value="industrial">Industrial</option>
            <option value="vacant">Vacant Land</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Area Range */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Area Range (acres)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.minArea}
              onChange={(e) => handleFilterChange('minArea', e.target.value)}
              placeholder="Min"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal transition-colors"
            />
            <span className="text-gray-400 flex items-center">to</span>
            <input
              type="number"
              value={filters.maxArea}
              onChange={(e) => handleFilterChange('maxArea', e.target.value)}
              placeholder="Max"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal transition-colors"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price Range
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-teal transition-colors"
          >
            <option value="">Any Price</option>
            <option value="0-10000">Under $10K</option>
            <option value="10000-50000">$10K - $50K</option>
            <option value="50000-100000">$50K - $100K</option>
            <option value="100000-500000">$100K - $500K</option>
            <option value="500000+">$500K+</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-teal transition-colors"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="tokenized">Tokenized</option>
            <option value="for_sale">For Sale</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={() => onFiltersChange?.(filters)}
            className="w-full btn-primary py-2"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || key === 'sortBy') return null
              
              let displayValue = value
              if (key === 'priceRange') {
                displayValue = `Price: ${value}`
              } else if (key === 'propertyType') {
                displayValue = `Type: ${value}`
              } else if (key === 'status') {
                displayValue = `Status: ${value}`
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-accent-teal text-deedchain-navy font-medium"
                >
                  {displayValue}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch