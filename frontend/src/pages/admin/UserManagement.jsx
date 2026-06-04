import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/axios'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.listUsers()
      setUsers(res.data.results || res.data)
    } catch (err) {
      console.error('Failed to load users', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (id, username) => {
    if (!window.confirm(`Deactivate user "${username}"?`)) return
    try {
      await adminAPI.deactivateUser(id)
      toast.success(`User "${username}" deactivated.`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deactivate user.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage platform users</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'lecturer' ? 'badge-blue' : 'badge-green'} capitalize`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-orange'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {u.is_active && (
                      <button
                        onClick={() => handleDeactivate(u.id, u.username)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Deactivate
                      </button>
                    )}
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
