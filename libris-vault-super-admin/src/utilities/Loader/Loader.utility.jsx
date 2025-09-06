import "../../styles/global.styles.css";
import "./Loader.utility.css";

/**
 * Loader Component
 *
 * A simple loading spinner component used to indicate ongoing background
 * processes such as data fetching or form submissions.
 *
 * @component
 * @example
 * // Basic usage
 * <Loader />
 *
 * @returns {JSX.Element} A centered animated loader element.
 */
const Loader = () => {
  return (
    <section id="loader">
      <div className="custom-loader-container">
        <div className="custom-loader"></div>
      </div>
    </section>
  );
};

export default Loader;
