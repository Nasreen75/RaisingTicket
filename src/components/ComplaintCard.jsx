import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const categoryLabels = {
  hostel: 'Hostel',
  it_technical: 'IT / Technical',
  maintenance: 'Maintenance',
  academic: 'Academic',
  transport: 'Transport',
  library: 'Library',
  canteen: 'Canteen / Mess',
  other: 'Other',
  civil: 'Civil Engineering',
  ece: 'ECE',
  eee: 'EEE',
  mechanical: 'Mechanical',
  mba: 'MBA',
  mca: 'MCA',
  electrical: 'Electrical'
};

const ComplaintCard = ({ complaint, showRaisedBy = false }) => {
  const navigate = useNavigate();

  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div style={styles.card} onClick={() => navigate(`/complaints/${complaint.id}`)}>
      <div style={styles.header}>
        <h3 style={styles.title}>{complaint.title}</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {complaint.queue_position ? (
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.3px',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe'
            }}>
              Queue #{complaint.queue_position}
            </span>
          ) : (
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1'
            }}>
              {complaint.token_number || `TKN-${String(complaint.id).padStart(4, '0')}`}
            </span>
          )}
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <p style={styles.description}>
        {complaint.description.length > 100
          ? complaint.description.slice(0, 100) + '...'
          : complaint.description}
      </p>

      <div style={styles.footer}>
        <span style={styles.category}>{categoryLabels[complaint.category] || complaint.category}</span>
        <span style={styles.date}>{formattedDate}</span>
      </div>

      {showRaisedBy && complaint.raised_by_name && (
        <div style={styles.raisedBy}>
          Raised by: <strong>{complaint.raised_by_name}</strong> ({complaint.raised_by_role})
        </div>
      )}

      {complaint.assigned_worker_name && (
        <div style={styles.assignedTo}>
          Assigned to: <strong>{complaint.assigned_worker_name}</strong>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '16px 20px',
    marginBottom: '14px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  title: { fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 },
  description: { fontSize: '14px', color: '#6b7280', margin: '6px 0' },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px',
  },
  category: {
    background: '#f3f4f6',
    padding: '2px 10px',
    borderRadius: '6px',
    fontWeight: '500',
  },
  date: {},
  raisedBy: { fontSize: '12px', color: '#4b5563', marginTop: '8px' },
  assignedTo: { fontSize: '12px', color: '#4b5563', marginTop: '4px' },
};

export default ComplaintCard;