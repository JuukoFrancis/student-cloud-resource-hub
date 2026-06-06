import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
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
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* <Route
          path="/dashboard"
          element={<AppLayout><Dashboard /></AppLayout>}
        /> */}
        <Route
          path="/resources"
          element={<AppLayout><ResourceList /></AppLayout>}
        />
        <Route
          path="/resources/upload"
          element={<AppLayout><UploadResource /></AppLayout>}
        />
        <Route
          path="/resources/search"
          element={<AppLayout><SearchResults /></AppLayout>}
        />
        <Route
          path="/resources/:id"
          element={<AppLayout><ResourceDetail /></AppLayout>}
        />
        <Route
          path="/resources/shared"
          element={<AppLayout><SharedWithMe /></AppLayout>}
        />
        <Route
          path="/resources/sharing"
          element={<AppLayout><ManageSharing /></AppLayout>}
        />
        <Route
          path="/profile"
          element={<AppLayout><Profile /></AppLayout>}
        />
        <Route
          path="/profile/uploads"
          element={<AppLayout><MyUploads /></AppLayout>}
        />
        <Route
          path="/admin"
          element={<AppLayout><UserManagement /></AppLayout>}
        />
        <Route
          path="/admin/resources"
          element={<AppLayout><ResourceModeration /></AppLayout>}
        />
        <Route
          path="/admin/activity"
          element={<AppLayout><ActivityMonitoring /></AppLayout>}
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  )
}
