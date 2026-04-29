import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import VendorsPage from "@/pages/VendorsPage"
import VendorDetailPage from "@/pages/VendorDetailPage"
import BookingPage from "@/pages/BookingPage"
import BookingSuccessPage from "@/pages/BookingSuccessPage"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import AdminLoginPage from "@/pages/AdminLoginPage"
import DashboardLayout from "@/layouts/DashboardLayout"
import VendorDashboardLayout from "@/layouts/VendorDashboardLayout"
import AdminDashboardLayout from "@/layouts/AdminDashboardLayout"
import UserDashboardPage from "@/pages/UserDashboardPage"
import UserBookingsPage from "@/pages/UserBookingsPage"
import {
  UserFavoritesPage,
  UserMessagesPage,
  UserNotificationsPage,
  UserPaymentsPage,
  UserProfilePage,
  UserSettingsPage,
} from "@/pages/UserDashboardExtraPages"
import VendorDashboardPage from "@/pages/VendorDashboardPage"
import VendorBookingsPage from "@/pages/VendorBookingsPage"
import {
  VendorAnalyticsPage,
  VendorWalletPage,
  VendorMessagesPage,
  VendorNotificationsPage,
  VendorProfilePage,
  VendorReviewsPage,
  VendorServicesPage,
  VendorSettingsPage,
} from "@/pages/VendorDashboardExtraPages"
import AdminDashboardPage from "@/pages/AdminDashboardPage"
import AdminUsersPage from "@/pages/AdminUsersPage"
import AdminVendorsPage from "@/pages/AdminVendorsPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { VendorBrowseGate } from "@/components/VendorBrowseGate"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/vendors" element={<VendorBrowseGate><VendorsPage /></VendorBrowseGate>} />
      <Route path="/vendors/:id" element={<VendorBrowseGate><VendorDetailPage /></VendorBrowseGate>} />
      <Route path="/booking/:id" element={<BookingPage />} />
      <Route path="/booking/success/:id" element={<BookingSuccessPage />} />
      <Route path="/login" element={<LoginPage role="user" />} />
      <Route path="/vendor/login" element={<LoginPage role="vendor" />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/vendor/register" element={<SignupPage defaultAccountType="vendor" />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route path="/dashboard" element={<ProtectedRoute role="user"><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboardPage />} />
        <Route path="bookings" element={<UserBookingsPage />} />
        <Route path="favorites" element={<UserFavoritesPage />} />
        <Route path="messages" element={<UserMessagesPage />} />
        <Route path="notifications" element={<UserNotificationsPage />} />
        <Route path="payments" element={<UserPaymentsPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="settings" element={<UserSettingsPage />} />
      </Route>

      <Route path="/vendor/dashboard" element={<ProtectedRoute role="vendor"><VendorDashboardLayout /></ProtectedRoute>}>
        <Route index element={<VendorDashboardPage />} />
        <Route path="bookings" element={<VendorBookingsPage />} />
        <Route path="services" element={<VendorServicesPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
        <Route path="messages" element={<VendorMessagesPage />} />
        <Route path="reviews" element={<VendorReviewsPage />} />
        <Route path="wallet" element={<VendorWalletPage />} />
        <Route path="analytics" element={<VendorAnalyticsPage />} />
        <Route path="notifications" element={<VendorNotificationsPage />} />
        <Route path="settings" element={<VendorSettingsPage />} />
      </Route>

      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="vendors" element={<AdminVendorsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
