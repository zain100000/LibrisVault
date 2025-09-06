import { NavLink, useLocation } from "react-router-dom";
import "../../styles/global.styles.css";
import "./Sidebar.utility.css";

/**
 * Sidebar Component
 *
 * Provides a fixed navigation menu for the admin dashboard.
 * Uses `NavLink` for route navigation with active highlighting.
 * The current route is tracked using `useLocation` to apply "active" styling
 * to grouped navigation links (e.g., all `/admin/products/*` routes).
 *
 * @component
 * @example
 * return (
 *   <Sidebar />
 * )
 */
const Sidebar = () => {
  const location = useLocation();

  return (
    <section id="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-container">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-home"></i>
            </div>
            <span>Dashboard</span>
          </NavLink>

          {/* Product Management */}
          <NavLink
            to="/admin/products/manage-products"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/products") ? "active" : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-coffee"></i>
            </div>
            <span>Manage Products</span>
          </NavLink>

          {/* Review Management */}
          <NavLink
            to="/admin/reviews/manage-reviews"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/reviews") ? "active" : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-star"></i>
            </div>
            <span>Manage Reviews</span>
          </NavLink>

          {/* Order Management */}
          <NavLink
            to="/admin/orders/manage-orders"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/orders") ? "active" : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <span>Manage Orders</span>
          </NavLink>

          {/* Customer Care */}
          <NavLink
            to="/admin/customer-care/chats"
            className={() =>
              `sidebar-link ${
                location.pathname.startsWith("/admin/customer-care")
                  ? "active"
                  : ""
              }`
            }
          >
            <div className="sidebar-icon">
              <i className="fas fa-headset"></i>
            </div>
            <span>Customer Care</span>
          </NavLink>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
