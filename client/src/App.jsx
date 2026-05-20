import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* ================= LANDING PAGES ================= */
import Home from "./landing/pages/Home";
import Features from "./landing/pages/Features";
import Pricing from "./landing/pages/Pricing";
import About from "./landing/pages/About";
import Contact from "./landing/pages/Contact";

/* ================= AUTH ================= */
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* ================= POS DASHBOARD ================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayoutDesigner from "./pages/admin/AdminLayoutDesigner";

import WaiterDashboard from "./pages/WaiterDashboard";
import WaiterFloorPlan from "./pages/waiter/WaiterFloorPlan";

import KitchenKDS from "./pages/KitchenKDS";

/* ================= STYLES ================= */
import "./styles/global.css";
import "./landing/styles/landing.css";

/* =========================================================
   LOADER
========================================================= */

const FullPageLoader = ({ text = "Loading..." }) => {
  return (
    <div className="app-loader">
      <div className="loader-ring"></div>
      <p>{text}</p>
    </div>
  );
};

/* =========================================================
   PROTECTED ROUTES
========================================================= */

const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/* =========================================================
   PUBLIC ROUTES
========================================================= */

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    const redirectPath =
      user.role === "owner" || user.role === "admin"
        ? "/admin"
        : user.role === "waiter"
        ? "/waiter"
        : "/kitchen";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/* =========================================================
   UNAUTHORIZED PAGE
========================================================= */

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <h1>403</h1>
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    </div>
  );
};

/* =========================================================
   APP
========================================================= */

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <FullPageLoader text="Loading Application..." />;
  }

  return (
    <Routes>

      {/* =====================================================
          LANDING WEBSITE
      ===================================================== */}

      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      <Route
        path="/features"
        element={
          <PublicRoute>
            <Features />
          </PublicRoute>
        }
      />

      <Route
        path="/pricing"
        element={
          <PublicRoute>
            <Pricing />
          </PublicRoute>
        }
      />

      <Route
        path="/about"
        element={
          <PublicRoute>
            <About />
          </PublicRoute>
        }
      />

      <Route
        path="/contact"
        element={
          <PublicRoute>
            <Contact />
          </PublicRoute>
        }
      />

      {/* =====================================================
          AUTH
      ===================================================== */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* =====================================================
          ADMIN
      ===================================================== */}

      <Route
        path="/admin"
        element={
          <Protected roles={["owner", "admin"]}>
            <AdminDashboard />
          </Protected>
        }
      />

      <Route
        path="/admin/layout"
        element={
          <Protected roles={["owner", "admin"]}>
            <AdminLayoutDesigner />
          </Protected>
        }
      />

      {/* =====================================================
          WAITER
      ===================================================== */}

      <Route
        path="/waiter"
        element={
          <Protected roles={["waiter"]}>
            <WaiterDashboard />
          </Protected>
        }
      />

      <Route
        path="/waiter/floor"
        element={
          <Protected roles={["waiter"]}>
            <WaiterFloorPlan />
          </Protected>
        }
      />

      {/* =====================================================
          KITCHEN
      ===================================================== */}

      <Route
        path="/kitchen"
        element={
          <Protected roles={["kitchen"]}>
            <KitchenKDS />
          </Protected>
        }
      />

      {/* =====================================================
          DASHBOARD REDIRECT
      ===================================================== */}

      <Route
        path="/dashboard"
        element={<DashboardRedirect />}
      />

      {/* =====================================================
          UNAUTHORIZED
      ===================================================== */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

/* =========================================================
   DASHBOARD REDIRECT
========================================================= */

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const redirectPath =
    user.role === "owner" || user.role === "admin"
      ? "/admin"
      : user.role === "waiter"
      ? "/waiter"
      : "/kitchen";

  return <Navigate to={redirectPath} replace />;
};

export default App;