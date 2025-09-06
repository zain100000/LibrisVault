/**
 * Dashboard Component
 *
 * Provides an overview of key business metrics including:
 * - Products: total count
 * - Reviews: total and average rating
 * - Orders: total and status breakdown
 *
 * Features:
 * - Fetches data from Redux slices (products, reviews, orders)
 * - Displays interactive statistic cards with icons
 * - Allows navigation to management pages (products, reviews, orders)
 * - Includes an order status summary section
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
import { getAllBooks } from "../../redux/slices/inventory.slice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const books = useSelector((state) => state.books.books);

  console.log('BOOKS', books)

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllBooks());
    }
  }, [dispatch, user?.id]);

  // Book statistics
  const { totalBooks } = books.reduce(
    (acc, book) => {
      acc.totalBooks++;
      return acc;
    },
    { totalBooks: 0 }
  );

  const handleNavigate = (path) => navigate(path);

  return (
    <section id="dashboard" className="p-4">
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
        <div className="row g-2 mb-4">
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              onClick={() => handleNavigate("/admin/books/manage-books")}
              title="Books"
              icon={
                <i
                  className="fas fa-book fa-bounce text-primary"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[{ label: "Total", value: totalBooks }]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
