/**
 * Dashboard Component
 *
 * Provides an overview of key business metrics including:
 * - Inventory: total count
 * - Sellers: total, active, suspended, banned
 * - Stores: total, active, suspended, banned
 *
 * Features:
 * - Fetches data from Redux slices (inventory, sellers, stores)
 * - Displays interactive statistic cards with icons
 * - Allows navigation to management pages
 *
 * @component
 * @example
 * return <Dashboard />
 *
 * @returns {JSX.Element} A dashboard overview with statistics and navigation
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../utilities/Card/Card.utility";
import { getAllInventory } from "../../redux/slices/inventory.slice";
import { getSellers } from "../../redux/slices/seller.slice";
import { getAllStores } from "../../redux/slices/store.slice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const inventory = useSelector((state) => state.inventory.inventory || []);
  const sellers = useSelector((state) => state.sellers.sellers || []);
  const stores = useSelector((state) => state.store.stores || []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllInventory());
      dispatch(getSellers());
      dispatch(getAllStores());
    }
  }, [dispatch, user?.id]);

  // Inventory statistics
  const { totalInventory, totalStock, outOfStock } = inventory.reduce(
    (acc, item) => {
      acc.totalInventory++; // number of inventory items
      acc.totalStock += item.stock; // sum of stock values
      if (item.stock === 0) acc.outOfStock++; // count items with no stock
      return acc;
    },
    { totalInventory: 0, totalStock: 0, outOfStock: 0 }
  );

  // Seller statistics
  const { totalSellers, activeSellers, suspendedSellers, bannedSellers } =
    sellers.reduce(
      (acc, seller) => {
        acc.totalSellers++;
        if (seller.status === "ACTIVE") acc.activeSellers++;
        if (seller.status === "SUSPENDED") acc.suspendedSellers++;
        if (seller.status === "BANNED") acc.bannedSellers++;
        return acc;
      },
      {
        totalSellers: 0,
        activeSellers: 0,
        suspendedSellers: 0,
        bannedSellers: 0,
      }
    );

  // Store statistics
  const { totalStores, pendingStores, activeStores, suspendedStores } =
    stores.reduce(
      (acc, store) => {
        acc.totalStores++;
        if (store.status === "PENDING") acc.pendingStores++;
        if (store.status === "ACTIVE") acc.activeStores++;
        if (store.status === "SUSPENDED") acc.suspendedStores++;
        return acc;
      },
      {
        totalStores: 0,
        pendingStores: 0,
        activeStores: 0,
        suspendedStores: 0,
      }
    );

  const handleNavigate = (path) => navigate(path);

  return (
    <section id="dashboard" style={{ marginTop: 15 }}>
      <div className="container-fluid">
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "var(--primary)",
            margin: 0,
            paddingLeft: "10px",
            borderLeft: "4px solid var(--primary)",
            marginBottom: "40px",
          }}
        >
          Dashboard Overview
        </h2>

        {/* Statistic Cards */}
        <div className="row g-2 mb-2">
          {/* Inventory Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() =>
                handleNavigate("/super-admin/inventory/manage-inventory")
              }
              title="Inventory"
              icon={
                <i
                  className="fas fa-book fa-bounce text-primary"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total Inventory", value: totalInventory },
                { label: "Total Stock", value: totalStock },
                { label: "Out of Stock", value: outOfStock },
              ]}
              gradientType="ocean"
            />
          </div>

          {/* Sellers Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() =>
                handleNavigate("/super-admin/sellers/manage-sellers")
              }
              title="Sellers"
              icon={
                <i
                  className="fas fa-users fa-shake text-success"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalSellers },
                { label: "Active", value: activeSellers },
                { label: "Suspended", value: suspendedSellers },
                { label: "Banned", value: bannedSellers },
              ]}
              gradientType="emerald"
            />
          </div>

          {/* Stores Card */}
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() =>
                handleNavigate("/super-admin/stores/manage-stores")
              }
              title="Stores"
              icon={
                <i
                  className="fas fa-store fa-flip text-warning"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalStores },
                { label: "Pending", value: pendingStores },
                { label: "Active", value: activeStores },
                { label: "Suspended", value: suspendedStores },
              ]}
              gradientType="sunset"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
