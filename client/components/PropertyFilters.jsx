import { useState } from 'react'

const PropertyFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    status: '',
    minArea: '',
    maxArea: '',
    location: '',
    sortBy: 'newest',
    ...initialFilters
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      minArea: '',
      maxArea: '',
      location: '',
      sortBy: 'newest'
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'newest'
  )

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent-teal hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Area Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Min Area (acres)
          </label>
          <input
            type="number"
            value={filters.minArea}
            onChange={(e) => handleFilterChange('minArea', e.target.value)}
            className="input-field"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Area (acres)
          </label>
          <input
            type="number"
            value={filters.maxArea}
            onChange={(e) => handleFilterChange('maxArea', e.target.value)}
            className="input-field"
            placeholder="Any"
            min="0"
            step="0.01"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="area_asc">Area: Low to High</option>
            <option value="area_desc">Area: High to Low</option>
          </select>
        </div>
      </div>

      {/* Location Search */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location Search
        </label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="input-field"
          placeholder="Search by location..."
        />
      </div>
    </div>
  )
}

export default PropertyFilters