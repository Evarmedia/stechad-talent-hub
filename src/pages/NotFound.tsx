
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
    <h1 className="text-7xl font-bold text-primary mb-3">404</h1>
    <p className="text-2xl text-text-muted mb-6">Page Not Found</p>
    <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-faint transition">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
