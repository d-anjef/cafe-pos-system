import { useState, useEffect } from "react";
import { Download, RefreshCw, WifiOff, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWAManager() {
  // ── Online/offline tracking ─────────────────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // ── Install prompt tracking ─────────────────────────────
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(
    localStorage.getItem("pwa-install-dismissed") === "true"
  );

  // ── Service worker update tracking ──────────────────────
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("✅ Service Worker registered");
    },
    onRegisterError(error) {
      console.error("❌ SW registration failed:", error);
    },
  });

  // ── Listen for online/offline ────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Keep banner visible for 2s to show "back online"
      setTimeout(() => setShowOfflineBanner(false), 2000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Listen for install prompt ────────────────────────────
  useEffect(() => {
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Don't show if user dismissed it
      if (!installDismissed) {
        setShowInstallBtn(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Check if already installed
    window.addEventListener("appinstalled", () => {
      setShowInstallBtn(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, [installDismissed]);

  // ── Handle install click ─────────────────────────────────
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("✅ PWA installed");
    }
    
    setInstallPrompt(null);
    setShowInstallBtn(false);
  };

  const handleDismissInstall = () => {
    setShowInstallBtn(false);
    setInstallDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  return (
    <>
      {/* ── OFFLINE BANNER ────────────────────────────── */}
      {showOfflineBanner && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: isOnline ? "#4caf50" : "#e53935",
          color: "white",
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          animation: "slideDown 0.3s ease-out"
        }}>
          {isOnline ? (
            <>✅ Back online</>
          ) : (
            <>
              <WifiOff size={16} />
              No internet connection — orders may fail
            </>
          )}
        </div>
      )}

      {/* ── INSTALL APP BUTTON ────────────────────────── */}
      {showInstallBtn && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: 16,
          right: 16,
          maxWidth: 400,
          margin: "0 auto",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "1px solid #d4af37",
          borderRadius: 14,
          padding: 16,
          zIndex: 9998,
          boxShadow: "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: "slideUp 0.4s ease-out"
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(212,175,55,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Download size={22} color="#d4af37" />
          </div>

          <div style={{ flex: 1, color: "white" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              Install NUVLYX
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
              Add to home screen for faster access
            </div>
          </div>

          <button
            onClick={handleInstall}
            style={{
              background: "#d4af37",
              color: "#000",
              border: "none",
              padding: "8px 16px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            Install
          </button>

          <button
            onClick={handleDismissInstall}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── UPDATE AVAILABLE NOTIFICATION ─────────────── */}
      {needRefresh && (
        <div style={{
          position: "fixed",
          top: 16,
          right: 16,
          maxWidth: 340,
          background: "#1a1a1a",
          border: "1px solid #4caf50",
          borderRadius: 12,
          padding: 14,
          zIndex: 9998,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          animation: "slideInRight 0.3s ease-out"
        }}>
          <RefreshCw size={20} color="#4caf50" />
          
          <div style={{ flex: 1, color: "white" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              Update available
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
              Click to install the latest version
            </div>
          </div>

          <button
            onClick={handleUpdate}
            style={{
              background: "#4caf50",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            Update
          </button>

          <button
            onClick={() => setNeedRefresh(false)}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              border: "none",
              padding: 4,
              cursor: "pointer"
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── INLINE STYLES FOR ANIMATIONS ──────────────── */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(120%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}