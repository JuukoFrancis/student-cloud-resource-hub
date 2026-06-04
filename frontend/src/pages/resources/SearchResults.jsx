import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resourcesAPI } from '../../api/axios'

export default function SearchResults() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') || ''

  useEffect(() => {
    if (search) fetchResults()
  }, [search])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await resourcesAPI.search({ search })
      setResources(res.data.results || res.data)
    } catch (err) {
      console.error('Search failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set('q', e.target.elements.searchInput.value)
    }
    setSearchParams(params)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Resources</h1>
        <p className="text-gray-600 mt-1">Find academic resources by keyword</p>
      </div>

      <form onSubmit={handleSearch} className="card">
        <div className="flex gap-3">
          <input
            name="searchInput"
            type="text"
            defaultValue={search}
            className="input-field"
            placeholder="Search by title, description, or course..."
          />
          <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : search && resources.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No resources found for "{search}".</p>
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              to={`/resources/${resource.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <h3 className="text-sm font-semibold text-gray-900 truncate">{resource.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{resource.course} &middot; {resource.semester_display}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span className="badge-blue">{resource.resource_type_display}</span>
                <span>{resource.file_size_mb} MB</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
