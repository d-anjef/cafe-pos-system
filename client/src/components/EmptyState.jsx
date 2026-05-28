const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  description = 'Add your first item to get started',
  actionLabel,
  onAction
}) => {
  return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      opacity: 0.7
    }}>
      <div style={{
        fontSize: 64,
        marginBottom: 16,
        filter: 'grayscale(0.3)'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        margin: '0 0 8px 0',
        color: 'var(--text-dark, #1a1a1a)'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 14,
        margin: '0 0 24px 0',
        color: 'var(--text-muted, #888)',
        maxWidth: 320,
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: 1.6
      }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="gold-btn"
          style={{ marginTop: 8 }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;