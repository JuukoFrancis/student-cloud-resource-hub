import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resourcesAPI } from '../../api/axios'
import toast from 'react-hot-toast'

export default function MyUploads() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyUploads()
  }, [])

  const fetchMyUploads = async () => {
    try {
      const res = await resourcesAPI.myUploads()
      setResources(res.data.results || res.data)
    } catch (err) {
      console.error('Failed to load uploads', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return
    try {
      await resourcesAPI.delete(id)
      toast.success('Resource deleted.')
      fetchMyUploads()
    } catch (err) {
      toast.error('Delete failed.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Uploads</h1>
          <p className="text-gray-600 mt-1">Manage resources you've uploaded</p>
        </div>
        <Link to="/resources/upload" className="btn-primary">Upload New</Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">You haven't uploaded any resources yet.</p>
          <Link to="/resources/upload" className="btn-primary mt-4 inline-block">
            Upload Your First Resource
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                  <td className="px-6 py-4 text-sm text-gray-500">{r.file_size_mb} MB</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
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
