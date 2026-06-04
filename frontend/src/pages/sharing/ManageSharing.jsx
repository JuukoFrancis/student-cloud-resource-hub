import { useState, useEffect } from 'react'
import { sharingAPI } from '../../api/axios'
import toast from 'react-hot-toast'

export default function ManageSharing() {
  const [sharedByMe, setSharedByMe] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShared()
  }, [])

  const fetchShared = async () => {
    try {
      const res = await sharingAPI.sharedByMe()
      setSharedByMe(res.data)
    } catch (err) {
      console.error('Failed to load sharing data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveShare = async (id, username) => {
    if (!window.confirm(`Remove sharing with ${username}?`)) return
    try {
      await sharingAPI.removeShare(id)
      toast.success('Sharing permission removed.')
      fetchShared()
    } catch (err) {
      toast.error('Failed to remove sharing.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Sharing</h1>
        <p className="text-gray-600 mt-1">Resources you've shared with others</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : sharedByMe.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">You haven't shared any resources yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shared With</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sharedByMe.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.resource_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.shared_with_username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.shared_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveShare(item.id, item.shared_with_username)}
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
