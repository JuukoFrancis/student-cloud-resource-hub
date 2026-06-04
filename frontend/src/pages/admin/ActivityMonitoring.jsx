import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/axios'

export default function ActivityMonitoring() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await adminAPI.getActivityLogs({ page_size: 50 })
      setLogs(res.data.results || res.data)
    } catch (err) {
      console.error('Failed to load activity logs', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action) => {
    const map = {
      upload: 'badge-green',
      download: 'badge-blue',
      view: 'badge-purple',
      delete: 'badge-orange',
      share: 'badge-blue',
      login: 'badge-green',
    }
    return map[action] || 'badge-blue'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Monitoring</h1>
        <p className="text-gray-600 mt-1">Track platform activity and user actions</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.username}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getActionBadge(log.action)}`}>
                      {log.action_display}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.resource_title || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
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
