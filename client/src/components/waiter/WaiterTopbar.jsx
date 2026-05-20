import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const WaiterTopbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="waiter-topbar glass-card">
      <h3>🌿 GARDEN & CAFE</h3>
      <span>{new Date().toDateString()}</span>
      <span style={{ fontWeight: 600 }}>
        {user?.name?.toUpperCase()}
      </span>
      <button className="gold-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default WaiterTopbar;