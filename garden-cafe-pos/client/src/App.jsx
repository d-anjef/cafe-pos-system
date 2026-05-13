import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WaiterDashboard from "./pages/WaiterDashboard";
import KitchenKDS from "./pages/KitchenKDS";
import AdminLayoutDesigner from "./pages/admin/AdminLayoutDesigner";
import WaiterFloorPlan from "./pages/waiter/WaiterFloorPlan";

const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#d4af37",
      fontSize: 18
    }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={
              user.role === "admin" ? "/admin" :
              user.role === "waiter" ? "/waiter" :
              "/kitchen"
            } />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/admin"
        element={
          <Protected roles={["admin"]}>
            <AdminDashboard />
          </Protected>
        }
      />

      <Route
        path="/waiter"
        element={
          <Protected roles={["waiter"]}>
            <WaiterDashboard />
          </Protected>
        }
      />

      <Route
        path="/kitchen"
        element={
          <Protected roles={["kitchen"]}>
            <KitchenKDS />
          </Protected>
        }
      />

      <Route
  path="/admin/layout"
  element={
    <Protected roles={["admin"]}>
      <AdminLayoutDesigner />
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;