import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = isAdmin
          ? await dashboardAPI.adminStats()
          : await dashboardAPI.stats()
        setStats(res.data)
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [isAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!stats) {
    return <p className="text-red-500">Failed to load dashboard data.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isAdmin ? 'Total Users' : 'My Resources'}
          value={isAdmin ? stats.total_users : stats.my_resources_count}
          icon="users"
          color="blue"
        />
        <StatCard
          title={isAdmin ? 'Total Resources' : 'Storage Used'}
          value={isAdmin ? stats.total_resources : `${stats.my_storage_mb} MB`}
          icon="storage"
          color="green"
        />
        <StatCard
          title="Shared With Me"
          value={isAdmin ? stats.total_storage_mb + ' MB' : stats.shared_with_me_count}
          icon="share"
          color="purple"
        />
        <StatCard
          title={isAdmin ? 'Users by Role' : 'Shared By Me'}
          value={isAdmin ? stats.users_by_role?.length || 0 : stats.shared_by_me_count}
          icon="chart"
          color="orange"
        />
      </div>

      {/* Recent Uploads & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
          {stats.recent_uploads && stats.recent_uploads.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_uploads.map((r) => (
                <Link
                  key={r.id}
                  to={`/resources/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.course} &middot; {r.resource_type}</p>
                  </div>
                  <span className="text-xs text-gray-400">{r.file_size_mb} MB</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No uploads yet.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {stats.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <span className={`badge ${getActionBadge(log.action)}`}>
                    {log.action_display}
                  </span>
                  <span className="text-sm text-gray-700">
                    {log.resource_title || log.username || '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity.</p>
          )}
        </div>
      </div>

      {/* Resources by Course (for admin) or by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Resources by Course</h2>
          {stats.resources_by_course?.length > 0 ? (
            <div className="space-y-2">
              {stats.resources_by_course.map((item) => (
                <div key={item.course} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.course}</span>
                  <span className="badge-blue">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data yet.</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Resources by Type</h2>
          {stats.resources_by_type?.length > 0 ? (
            <div className="space-y-2">
              {stats.resources_by_type.map((item) => (
                <div key={item.resource_type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{item.resource_type.replace('_', ' ')}</span>
                  <span className="badge-green">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <span className="text-xl">&#x1F4C1;</span>
        </div>
      </div>
    </div>
  )
}

function getActionBadge(action) {
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
