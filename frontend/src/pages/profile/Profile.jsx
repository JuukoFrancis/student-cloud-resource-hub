import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api/axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.updateProfile(form)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error('Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.username}</h2>
            <span className="badge-blue capitalize">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              className="input-field bg-gray-50"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={user?.role || ''}
              className="input-field bg-gray-50 capitalize"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <input
              type="text"
              value={user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : ''}
              className="input-field bg-gray-50"
              disabled
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
