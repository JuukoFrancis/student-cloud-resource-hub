import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'student',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        Object.entries(data).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages[0] : messages
          toast.error(`${field}: ${msg}`)
        })
      } else {
        toast.error('Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg className="w-16 h-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900">Cloud Resource Hub</h1>
          <p className="text-gray-600 mt-2">Create an account to get started</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-center mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Choose a username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Create a password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                className="input-field"
                placeholder="Confirm your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
