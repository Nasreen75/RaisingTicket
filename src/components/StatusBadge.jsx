const statusConfig = {
  pending: { label: 'Open', bg: '#fef3c7', color: '#92400e' },
  assigned: { label: 'Assigned', bg: '#e0e7ff', color: '#3730a3' },
  in_progress: { label: 'In Progress', bg: '#dbeafe', color: '#1e40af' },
  resolved: { label: 'Resolved', bg: '#d1fae5', color: '#065f46' },
  closed: { label: 'Closed', bg: '#f3f4f6', color: '#374151' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 11px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '700',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}22`,
        textTransform: 'capitalize',
        letterSpacing: '0.3px',
      }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;