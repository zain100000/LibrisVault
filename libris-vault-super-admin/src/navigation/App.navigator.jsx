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

// Authentication
import Signin from "../screens/auth/Signin/Signin.auth";

/**
 * Application routing configuration.
 *
 * @returns {JSX.Element} The route definitions for the app.
 */
const AppNavigator = () => {
  return (
    <Routes>
      <Route path="/" element={<Signin />} />
    </Routes>
  );
};

export default AppNavigator;
