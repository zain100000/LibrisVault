/**
 * Dashboard Layout
 *
 * Provides the main layout structure for authenticated dashboard pages.
 * It includes:
 * - A persistent Header at the top
 * - A Sidebar for navigation
 * - A main content area where nested routes are rendered via React Router's Outlet
 *
 * This layout ensures a consistent structure across all admin dashboard screens.
 */

import { Outlet } from "react-router-dom";
import "./Dashboard.layout.css";
import Header from '../../utilities/Header/Header.utility'

/**
 * Dashboard page layout wrapper.
 *
 * @returns {JSX.Element} The structured dashboard layout with header, sidebar, and content area.
 */
const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Header />
      {/* <div className="d-flex">
        <Sidebar /> */}
      <main className="content">
        <Outlet />
      </main>
      {/* </div> */}
    </div>
  );
};

export default DashboardLayout;
