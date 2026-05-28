import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* ================= LANDING PAGES ================= */
import Home from "./landing/pages/Home";
import Features from "./landing/pages/Features";
import Pricing from "./landing/pages/Pricing";
import About from "./landing/pages/About";
import Contact from "./landing/pages/Contact";
import Privacy from "./landing/pages/Privacy";          
import Terms from "./landing/pages/Terms";              
import Refund from "./landing/pages/Refund";            

/* ================= AUTH ================= */
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* ================= POS DASHBOARD ================= */
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayoutDesigner from "./pages/admin/AdminLayoutDesigner";
import WaiterDashboard from "./pages/WaiterDashboard";
import WaiterFloorPlan from "./pages/waiter/WaiterFloorPlan";
import KitchenKDS from "./pages/KitchenKDS";
import PublicMenu from "./pages/PublicMenu";

/* ================= COMPONENTS ================= */
import CookieBanner from "./components/ConsentBanner";   
import NotFound from "./pages/Notfound";
/* ================= STYLES ================= */
import "./styles/global.css";
import "./landing/styles/landing.css";

/* =========================================================
   ROLE HELPER
========================================================= */
const getRedirectPath = (role) => {
  switch (role) {
    case "super_admin":    return "/super-admin";
    case "owner":          return "/admin";
    case "admin":          return "/admin";
    case "branch_manager": return "/admin";
    case "waiter":         return "/waiter";
    case "kitchen":        return "/kitchen";
    default:               return "/login";
  }
};

/* =========================================================
   LOADER
========================================================= */
const FullPageLoader = ({ text = "Loading..." }) => (
  <div className="app-loader">
    <div className="loader-ring"></div>
    <p>{text}</p>
  </div>
);

/* =========================================================
   PROTECTED ROUTE
========================================================= */
const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader text="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/* =========================================================
   PUBLIC ROUTE (redirect if already logged in)
========================================================= */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader text="Loading..." />;
  if (user) return <Navigate to={getRedirectPath(user.role)} replace />;

  return children;
};

/* =========================================================
   DASHBOARD REDIRECT
========================================================= */
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRedirectPath(user.role)} replace />;
};

/* =========================================================
   UNAUTHORIZED PAGE
========================================================= */
const Unauthorized = () => (
  <div className="unauthorized-page">
    <div className="unauthorized-card">
      <h1>403</h1>
      <h2>Unauthorized Access</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  </div>
);

/* =========================================================
   APP
========================================================= */
function App() {
  const { loading } = useAuth();

  if (loading) return <FullPageLoader text="Loading Application..." />;

  return (
    <>
      <Routes>

        {/* ===== LANDING ===== */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
        <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
        <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />

        {/* ===== LEGAL — ✅ NEW (public, no PublicRoute wrapper so logged-in users can view too) ===== */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<Refund />} />

        {/* ===== AUTH ===== */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>}/>
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* ===== SUPER ADMIN ===== */}
        <Route
          path="/super-admin"
          element={
            <Protected roles={["super_admin"]}>
              <SuperAdminDashboard />
            </Protected>
          }
        />

        {/* ===== ADMIN / OWNER / MANAGER ===== */}
        <Route
          path="/admin"
          element={
            <Protected roles={["owner", "admin", "branch_manager"]}>
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin/layout"
          element={
            <Protected roles={["owner", "admin", "branch_manager"]}>
              <AdminLayoutDesigner />
            </Protected>
          }
        />

        {/* ===== WAITER ===== */}
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

        {/* ===== KITCHEN ===== */}
        <Route
          path="/kitchen"
          element={
            <Protected roles={["kitchen"]}>
              <KitchenKDS />
            </Protected>
          }
        />

        {/* ===== PUBLIC QR MENU (no auth required) ===== */}
        <Route path="/menu/:branchId/:tableId" element={<PublicMenu />} />

        {/* ===== UTILS ===== */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />

      </Routes>

      {/* ✅ COOKIE BANNER — shows on all pages */}
      <CookieBanner />
    </>
  );
}

export default App;