import toast from 'react-hot-toast';

// Success messages (green checkmark)
export const showSuccess = (message) => {
  toast.success(message, {
    icon: '✅',
    style: {
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid rgba(76, 175, 80, 0.3)'
    }
  });
};

// Error messages (red x)
export const showError = (message) => {
  toast.error(message, {
    icon: '❌',
    duration: 5000,
    style: {
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    }
  });
};

// Warning (yellow)
export const showWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    duration: 4500,
    style: {
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid rgba(245, 158, 11, 0.3)'
    }
  });
};

// Info (gold)
export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid rgba(212, 175, 55, 0.3)'
    }
  });
};

// Loading (returns id to dismiss later)
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message, {
    style: {
      background: '#1a1a1a',
      color: '#fff'
    }
  });
};

// Dismiss specific toast
export const dismissToast = (id) => {
  toast.dismiss(id);
};

// Promise toast - auto handles loading/success/error
export const showPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Processing...',
      success: messages.success || 'Done!',
      error: (err) => messages.error || err?.response?.data?.message || 'Something went wrong'
    },
    {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }
    }
  );
};

// Confirm dialog (returns promise that resolves boolean)
export const confirmAction = (message) => {
  return new Promise((resolve) => {
    const toastId = toast(
      (t) => (
        <div style={{ minWidth: 280 }}>
          <div style={{ marginBottom: 12, fontWeight: 600 }}>
            {message}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid #555',
                color: '#fff',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              style={{
                padding: '6px 14px',
                background: '#d4af37',
                border: 'none',
                color: '#000',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          minWidth: 320
        }
      }
    );
  });
};