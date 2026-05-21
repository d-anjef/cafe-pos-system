import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const BranchContext = createContext();

export function BranchProvider({ children }) {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState(null);

  // ============================================================
  // ✅ FIX: UPDATED BRANCH INITIALIZATION LOGIC
  // ============================================================
  useEffect(() => {
    if (!user) return;

    // ✅ Super admins have no branches
    if (user.role === "super_admin") {
      setBranches([]);
      setActiveBranch(null);
      return;
    }

    // ✅ Regular admins get branches from user object
    if (user?.branches?.length) {
      setBranches(user.branches);
      // Auto-select first branch if none selected
      if (!activeBranch) {
        setActiveBranch(user.branches[0]);
      }
    }
  }, [user]);

  return (
    <BranchContext.Provider value={{
      branches,
      activeBranch,
      setActiveBranch,
      setBranches
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within BranchProvider");
  }
  return context;
}