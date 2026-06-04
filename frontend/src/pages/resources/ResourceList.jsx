import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resourcesAPI } from '../../api/axios'

export default function ResourceList() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [pagination, setPagination] = useState({})

  const course = searchParams.get('course') || ''
  const semester = searchParams.get('semester') || ''
  const resource_type = searchParams.get('resource_type') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    fetchResources()
  }, [searchParams])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = {}
      if (course) params.course = course
      if (semester) params.semester = semester
      if (resource_type) params.resource_type = resource_type
      if (search) params.search = search

      const res = await resourcesAPI.list(params)
      setResources(res.data.results || res.data)
      setPagination({
        next: res.data.next,
        previous: res.data.previous,
        count: res.data.count,
      })
    } catch (err) {
      console.error('Failed to load resources', err)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-1">Browse and search academic resources</p>
        </div>
        <Link to="/resources/upload" className="btn-primary">
          Upload Resource
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field"
            />
          </div>
          <select
            value={course}
            onChange={(e) => updateFilter('course', e.target.value)}
            className="input-field"
          >
            <option value="">All Courses</option>
            <option value="CS101">CS101</option>
            <option value="CS201">CS201</option>
            <option value="CS301">CS301</option>
            <option value="MATH101">MATH101</option>
            <option value="MATH201">MATH201</option>
          </select>
          <select
            value={semester}
            onChange={(e) => updateFilter('semester', e.target.value)}
            className="input-field"
          >
            <option value="">All Semesters</option>
            <option value="1_1">Year 1 - Sem 1</option>
            <option value="1_2">Year 1 - Sem 2</option>
            <option value="2_1">Year 2 - Sem 1</option>
            <option value="2_2">Year 2 - Sem 2</option>
            <option value="3_1">Year 3 - Sem 1</option>
            <option value="3_2">Year 3 - Sem 2</option>
            <option value="4_1">Year 4 - Sem 1</option>
            <option value="4_2">Year 4 - Sem 2</option>
          </select>
          <select
            value={resource_type}
            onChange={(e) => updateFilter('resource_type', e.target.value)}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="lecture_notes">Lecture Notes</option>
            <option value="assignment">Assignment</option>
            <option value="past_paper">Past Paper</option>
            <option value="tutorial">Tutorial</option>
            <option value="project_report">Project Report</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Resource List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No resources found.</p>
          <Link to="/resources/upload" className="btn-primary mt-4 inline-block">
            Upload Your First Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              to={`/resources/${resource.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{resource.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{resource.course}</p>
                </div>
                <span className={`badge ${getTypeBadge(resource.resource_type)} ml-2`}>
                  {resource.resource_type_display}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>{resource.uploaded_by_username}</span>
                <span>{resource.file_size_mb} MB</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(resource.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function getTypeBadge(type) {
  const map = {
    lecture_notes: 'badge-blue',
    assignment: 'badge-green',
    past_paper: 'badge-purple',
    tutorial: 'badge-orange',
    project_report: 'badge-blue',
    other: 'badge-green',
  }
  return map[type] || 'badge-blue'
}
