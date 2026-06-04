import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import ResourceList from './pages/resources/ResourceList'
import ResourceDetail from './pages/resources/ResourceDetail'
import UploadResource from './pages/resources/UploadResource'
import SearchResults from './pages/resources/SearchResults'
import SharedWithMe from './pages/sharing/SharedWithMe'
import ManageSharing from './pages/sharing/ManageSharing'
import Profile from './pages/profile/Profile'
import MyUploads from './pages/profile/MyUploads'
import UserManagement from './pages/admin/UserManagement'
import ResourceModeration from './pages/admin/ResourceModeration'
import ActivityMonitoring from './pages/admin/ActivityMonitoring'

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <AppLayout><ResourceList /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/upload"
          element={
            <ProtectedRoute>
              <AppLayout><UploadResource /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/search"
          element={
            <ProtectedRoute>
              <AppLayout><SearchResults /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:id"
          element={
            <ProtectedRoute>
              <AppLayout><ResourceDetail /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/shared"
          element={
            <ProtectedRoute>
              <AppLayout><SharedWithMe /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/sharing"
          element={
            <ProtectedRoute>
              <AppLayout><ManageSharing /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/uploads"
          element={
            <ProtectedRoute>
              <AppLayout><MyUploads /></AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AppLayout><UserManagement /></AppLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <AdminRoute>
              <AppLayout><ResourceModeration /></AppLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <AdminRoute>
              <AppLayout><ActivityMonitoring /></AppLayout>
            </AdminRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  )
}
