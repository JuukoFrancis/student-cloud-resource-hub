import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resourcesAPI, sharingAPI } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareUsername, setShareUsername] = useState('')
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      const res = await resourcesAPI.get(id)
      setResource(res.data)
    } catch (err) {
      toast.error('Resource not found.')
      navigate('/resources')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const res = await resourcesAPI.download(id)
      if (res.data.file_url) {
        window.open(res.data.file_url, '_blank')
        toast.success('Download started!')
      }
    } catch (err) {
      toast.error('Download failed.')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return
    try {
      await resourcesAPI.delete(id)
      toast.success('Resource deleted.')
      navigate('/resources')
    } catch (err) {
      toast.error('Delete failed.')
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()
    if (!shareUsername.trim()) return
    setSharing(true)
    try {
      await sharingAPI.share({ resource_id: parseInt(id), shared_with_username: shareUsername })
      toast.success(`Shared with ${shareUsername}`)
      setShareUsername('')
      fetchResource()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sharing failed.')
    } finally {
      setSharing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!resource) return null

  const isOwner = resource.uploaded_by === user?.id || resource.uploaded_by_username === user?.username
  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
          <p className="text-gray-600 mt-1">{resource.course} &middot; {resource.semester_display}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="btn-primary">Download</button>
          {(isOwner || isAdmin) && (
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Details */}
        <div className="lg:col-span-2 card space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Description</h2>
            <p className="mt-1 text-gray-900">{resource.description || 'No description provided.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Type</h2>
              <span className={`badge ${getTypeBadge(resource.resource_type)} mt-1`}>
                {resource.resource_type_display}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">File Size</h2>
              <p className="mt-1 text-gray-900">{resource.file_size_mb} MB</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Uploaded By</h2>
              <p className="mt-1 text-gray-900">{resource.uploaded_by_username}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Uploaded On</h2>
              <p className="mt-1 text-gray-900">{new Date(resource.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        {(isOwner || isAdmin) && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Share Resource</h2>
            <form onSubmit={handleShare} className="space-y-3">
              <input
                type="text"
                placeholder="Username to share with"
                value={shareUsername}
                onChange={(e) => setShareUsername(e.target.value)}
                className="input-field"
                required
              />
              <button type="submit" disabled={sharing} className="btn-primary w-full">
                {sharing ? 'Sharing...' : 'Share'}
              </button>
            </form>
            {resource.is_shared && (
              <p className="text-sm text-green-600 mt-3">This resource has been shared.</p>
            )}
          </div>
        )}
      </div>
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
