import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WaiterDashboard from "./pages/WaiterDashboard";
import KitchenKDS from "./pages/KitchenKDS";
import AdminLayoutDesigner from "./pages/admin/AdminLayoutDesigner";
import WaiterFloorPlan from "./pages/waiter/WaiterFloorPlan";
import ProtectedRoute from "./ProtectedRoute";

/* ---------------- PROTECTED ROUTE ---------------- */
const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d4af37",
          fontSize: 18,
          background: "#f8f8f8",
        }}
      >
        Loading...
      </div>
    );
  }

  // not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // role mismatch
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  // app loading state
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d4af37",
          fontSize: 18,
          background: "#f8f8f8",
        }}
      >
        Loading Application...
      </div>
    );
  }

  return (
    <Routes>

      {/* LOGIN / HOME */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin"
                  : user.role === "waiter"
                  ? "/waiter"
                  : "/kitchen"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <Protected roles={["admin"]}>
            <AdminDashboard />
            <ProtectedRoute/>
          </Protected>
        }
      />

      {/* ADMIN LAYOUT */}
      <Route
        path="/admin/layout"
        element={
          <Protected roles={["admin"]}>
            <AdminLayoutDesigner />
            <ProtectedRoute/>
          </Protected>
        }
      />

      {/* WAITER */}
      <Route
        path="/waiter"
        element={
          <Protected roles={["waiter"]}>
            <WaiterDashboard />
            <ProtectedRoute/>
          </Protected>
        }
      />

      {/* WAITER FLOOR */}
      <Route
        path="/waiter/floor"
        element={
          <Protected roles={["waiter"]}>
            <WaiterFloorPlan />
            <ProtectedRoute/>
          </Protected>
        }
      />

      {/* KITCHEN */}
      <Route
        path="/kitchen"
        element={
          <Protected roles={["kitchen"]}>
            <KitchenKDS />
            <ProtectedRoute/>
          </Protected>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;