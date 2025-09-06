/**
 * Card Component
 *
 * A reusable card component for displaying stats, icons, and titles.
 * Includes interactive hover effects, animations, and customizable backgrounds.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.title - Title text displayed at the top of the card.
 * @param {Array<{ label: string, value: string|number }>} [props.stats=[]] - Array of stat objects to display inside the card.
 * @param {function} [props.onClick] - Optional click handler for the entire card.
 * @param {React.ReactNode} [props.icon] - Optional icon element displayed next to the title.
 * @param {string} [props.customClassName] - Optional custom class name for styling overrides.
 *
 * @example
 * // Simple stats card
 * <Card
 *   title="Daily Sales"
 *   stats={[
 *     { label: "Orders", value: 120 },
 *     { label: "Revenue", value: "$1,250" }
 *   ]}
 *   icon={<i className="fas fa-coffee"></i>}
 *   onClick={() => console.log("Card clicked")}
 * />
 */

import "../../styles/global.styles.css";
import "./Card.utility.css";

const Card = ({ title, stats = [], onClick, icon, customClassName = "" }) => {
  return (
    <section id="card">
      <div className={`card-container ${customClassName}`} onClick={onClick}>
        <div className="card custom-card">
          <div className="card-body">
            {/* Card header with title and optional icon */}
            <div className="card-header">
              <h5 className="card-title">{title}</h5>
              <div className="card-icon">{icon}</div>
            </div>

            {/* Card stats list */}
            <div className="card-stats">
              {stats.length > 0 ? (
                stats.map((stat, index) => (
                  <div className="stat-item" key={index}>
                    <span className="stat-label">{stat.label}:</span>
                    <span className="stat-number">{stat.value}</span>
                  </div>
                ))
              ) : (
                <span>No stats available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Card;
