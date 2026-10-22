import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import MenuPage from './pages/MenuPage'
import GalleryPage from './pages/GalleryPage'
import BookingPage from './pages/BookingPage'
import Login from './pages/Login'
import Register from './pages/Register'

import CustomerDashboard from './pages/customer/Dashboard'
import CustomerOrders from './pages/customer/Orders'
import CustomerReservations from './pages/customer/Reservations'

import StaffDashboard from './pages/staff/Dashboard'
import StaffOrders from './pages/staff/Orders'
import StaffReservations from './pages/staff/Reservations'

import AdminDashboard from './pages/admin/Dashboard'
import AdminMenu from './pages/admin/ManageMenu'
import AdminGallery from './pages/admin/ManageGallery'
import AdminUsers from './pages/admin/ManageUsers'
import AdminReviews from './pages/admin/ManageReviews'
import AdminSettings from './pages/admin/Settings'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-brand-gold text-xl animate-pulse">Đang tải...</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function BookingAccessRoute() {
  const { user } = useAuth()

  if (user?.role === 'staff') {
    return <Navigate to="/staff" replace />
  }

  return <Layout><BookingPage /></Layout>
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-brand-brown">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/menu" element={<Layout><MenuPage /></Layout>} />
          <Route path="/gallery" element={<Layout><GalleryPage /></Layout>} />
          <Route path="/booking" element={<BookingAccessRoute />} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />

          {/* Customer routes */}
          <Route path="/customer" element={<ProtectedRoute roles={['customer', 'admin', 'staff']}><DashboardLayout><CustomerDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/customer/orders" element={<ProtectedRoute roles={['customer']}><DashboardLayout><CustomerOrders /></DashboardLayout></ProtectedRoute>} />
          <Route path="/customer/reservations" element={<ProtectedRoute roles={['customer']}><DashboardLayout><CustomerReservations /></DashboardLayout></ProtectedRoute>} />

          {/* Staff routes */}
          <Route path="/staff" element={<ProtectedRoute roles={['staff', 'admin']}><DashboardLayout><StaffDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/staff/orders" element={<ProtectedRoute roles={['staff', 'admin']}><DashboardLayout><StaffOrders /></DashboardLayout></ProtectedRoute>} />
          <Route path="/staff/reservations" element={<ProtectedRoute roles={['staff', 'admin']}><DashboardLayout><StaffReservations /></DashboardLayout></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/menu" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminMenu /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/gallery" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminGallery /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminReviews /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminSettings /></DashboardLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
