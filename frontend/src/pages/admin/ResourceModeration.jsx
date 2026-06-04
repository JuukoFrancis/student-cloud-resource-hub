import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI, resourcesAPI } from '../../api/axios'
import toast from 'react-hot-toast'

export default function ResourceModeration() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const res = await resourcesAPI.list({ page_size: 50 })
      setResources(res.data.results || res.data)
    } catch (err) {
      console.error('Failed to load resources', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove resource "${title}"?`)) return
    try {
      await adminAPI.deleteResource(id)
      toast.success('Resource removed.')
      fetchResources()
    } catch (err) {
      toast.error('Failed to remove resource.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resource Moderation</h1>
        <p className="text-gray-600 mt-1">Review and manage uploaded resources</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4">
                    <Link to={`/resources/${r.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-800">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.course}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.resource_type_display}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.uploaded_by_username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(r.id, r.title)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
