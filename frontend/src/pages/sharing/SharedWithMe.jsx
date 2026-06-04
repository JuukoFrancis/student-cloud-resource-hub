import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sharingAPI } from '../../api/axios'

export default function SharedWithMe() {
  const [shared, setShared] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShared()
  }, [])

  const fetchShared = async () => {
    try {
      const res = await sharingAPI.sharedWithMe()
      setShared(res.data)
    } catch (err) {
      console.error('Failed to load shared resources', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shared With Me</h1>
        <p className="text-gray-600 mt-1">Resources others have shared with you</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : shared.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No resources have been shared with you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shared.map((item) => (
            <Link
              key={item.id}
              to={`/resources/${item.resource}`}
              className="card hover:shadow-md transition-shadow"
            >
              <h3 className="text-sm font-semibold text-gray-900 truncate">{item.resource_title}</h3>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>Shared by: {item.owner_username}</span>
                <span>{new Date(item.shared_date).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
