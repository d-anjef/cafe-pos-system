import './SKele_ton.css';

// Generic skeleton
export const Skeleton = ({ width = '100%', height = 20, radius = 6, style = {} }) => (
  <div
    className="skeleton-shimmer"
    style={{
      width,
      height,
      borderRadius: radius,
      ...style
    }}
  />
);

// KPI card skeleton (matches your dashboard cards)
export const KpiCardSkeleton = () => (
  <div className="kpi-card glass-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <Skeleton width={40} height={40} radius={10} />
    <div style={{ flex: 1 }}>
      <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={20} />
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton = () => (
  <div className="chart-card glass-card">
    <Skeleton width="40%" height={16} style={{ marginBottom: 20 }} />
    <Skeleton width="100%" height={220} radius={8} />
  </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr>
    {[...Array(columns)].map((_, i) => (
      <td key={i} style={{ padding: '12px 16px' }}>
        <Skeleton width={i === 0 ? '60%' : '80%'} height={14} />
      </td>
    ))}
  </tr>
);

// List item skeleton (for orders, staff, etc.)
export const ListItemSkeleton = () => (
  <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <Skeleton width={48} height={48} radius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="50%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={12} />
      </div>
      <Skeleton width={80} height={32} radius={8} />
    </div>
  </div>
);

// Dashboard full skeleton
export const DashboardSkeleton = () => (
  <div className="dashboard-tab">
    <div className="tab-header">
      <Skeleton width={180} height={28} />
    </div>
    <div className="kpi-grid">
      {[...Array(4)].map((_, i) => <KpiCardSkeleton key={i} />)}
    </div>
    <div className="charts-grid">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);