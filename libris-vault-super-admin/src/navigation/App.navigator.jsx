/**
 * App Navigator
 *
 * Defines the routing structure of the application using React Router.
 * It organizes public and protected routes, ensuring that only
 * authenticated users can access admin-related screens.
 *
 * Structure:
 * - Public Routes: Signin
 * - Protected Routes: Wrapped with ProtectedRoute and DashboardLayout
 *   - Dashboard
 *   - Product Management
 *   - Review Management
 *   - Order Management
 *   - Chats Management
 * - Fallback: 404 Not Found page
 */

import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./outlet/Outlet.outlet";
import ProtectedRoute from "./protected-routes/Protected.routes";

// Authentication
import Signin from "../screens/auth/Signin/Signin.auth";
import ForgotPassword from "../screens/auth/Forgot-password/ForgotPassword.auth";
import ResetPassword from "../screens/auth/Reset-password/ResetPassword.auth";

// Not Found
import NotFound from "../screens/Not-found/Not-Found";


// Dashboard Screens
import Dashboard from "../screens/Dashboard/Main.dashboard";

/**
 * Application routing configuration.
 *
 * @returns {JSX.Element} The route definitions for the app.
 */
const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Signin />} />
      <Route path="/super-admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/super-admin/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Make dashboard the index route for /admin */}
        <Route index element={<Dashboard />} />

        {/* Dashboard Routes */}
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
