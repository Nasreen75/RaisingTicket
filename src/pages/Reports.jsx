import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import theme from '../theme';

const categoryLabels = {
  hostel: 'Hostel',
  academic: 'Academic',
  transport: 'Transport',
  it_technical: 'IT / Technical',
  library: 'Library',
  fee: 'Fee / Accounts / Scholarship',
  maintenance: 'Maintenance',
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

const Reports = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const res = await api.get('/complaints/reports/summary');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const stats = data?.stats || {
    total: 0,
    pending: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    avg_rating: 0,
    total_rated: 0,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <BackButton fallbackPath="/dashboard" />
          {/* Header */}
          <div style={styles.headerRow}>
            <div>
              <h1 style={styles.heading}>📊 Campus Helpdesk Analytics &amp; Reports</h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme.colors.textMuted }}>
                {user?.role === 'admin'
                  ? 'Official central administrative audit metrics and complaint statistics across all departments.'
                  : `Departmental resolution and ticket summary report for ${user?.category?.toUpperCase() || 'HOD'}.`}
              </p>
            </div>
            <button onClick={handlePrint} style={styles.printBtn}>
              🖨️ Print / Save PDF
            </button>
          </div>

          {loading && <p style={{ color: theme.colors.textMuted }}>Computing campus report metrics...</p>}
          {error && <p style={{ color: theme.colors.danger }}>{error}</p>}

          {data && (
            <>
              {/* Stat Cards Row */}
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <span style={styles.statNumber}>{stats.total}</span>
                  <span style={styles.statLabel}>Total Tickets</span>
                </div>
                <div style={{ ...styles.statCard, background: '#fef3c7' }}>
                  <span style={{ ...styles.statNumber, color: '#92400e' }}>{stats.pending}</span>
                  <span style={styles.statLabel}>Open / Pending</span>
                </div>
                <div style={{ ...styles.statCard, background: '#e0e7ff' }}>
                  <span style={{ ...styles.statNumber, color: '#3730a3' }}>{stats.assigned}</span>
                  <span style={styles.statLabel}>Assigned</span>
                </div>
                <div style={{ ...styles.statCard, background: '#dbeafe' }}>
                  <span style={{ ...styles.statNumber, color: '#1e40af' }}>{stats.in_progress}</span>
                  <span style={styles.statLabel}>In Progress</span>
                </div>
                <div style={{ ...styles.statCard, background: '#d1fae5' }}>
                  <span style={{ ...styles.statNumber, color: '#065f46' }}>{stats.resolved}</span>
                  <span style={styles.statLabel}>Resolved</span>
                </div>
                <div style={{ ...styles.statCard, background: '#f3f4f6' }}>
                  <span style={{ ...styles.statNumber, color: '#374151' }}>{stats.closed}</span>
                  <span style={styles.statLabel}>Closed</span>
                </div>
                <div style={{ ...styles.statCard, background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <span style={{ ...styles.statNumber, color: '#d97706' }}>
                    {stats.avg_rating > 0 ? `★ ${stats.avg_rating}` : 'N/A'}
                  </span>
                  <span style={styles.statLabel}>Avg Satisfaction ({stats.total_rated} ratings)</span>
                </div>
              </div>

              {/* Resolution Rate Bar */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>🎯 Campus Resolution Rate</h3>
                {stats.total > 0 ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ fontWeight: '600', color: '#059669' }}>
                        Resolved &amp; Closed: {stats.resolved + stats.closed} ({Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%)
                      </span>
                      <span style={{ fontWeight: '600', color: '#d97706' }}>
                        Active / Pending: {stats.pending + stats.assigned + stats.in_progress}
                      </span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '13px' }}>No complaints recorded yet.</p>
                )}
              </div>

              {/* Two Column Breakdown: Category & Department */}
              <div style={styles.twoCol}>
                {/* Category-wise Breakdown */}
                <div style={styles.sectionCard}>
                  <h3 style={styles.sectionTitle}>📁 Category-Wise Ticket Distribution</h3>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Category</th>
                          <th style={styles.th}>Total</th>
                          <th style={styles.th}>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.byCategory.map((cat) => {
                          const percent = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
                          return (
                            <tr key={cat.category}>
                              <td style={styles.td}>{categoryLabels[cat.category] || cat.category}</td>
                              <td style={{ ...styles.td, fontWeight: 'bold' }}>{cat.count}</td>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '4px' }}>
                                    <div style={{ height: '6px', width: `${percent}%`, background: '#c1121f', borderRadius: '4px' }} />
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#6b7280', minWidth: '30px' }}>{percent}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Department-wise Breakdown */}
                <div style={styles.sectionCard}>
                  <h3 style={styles.sectionTitle}>🏛️ Department-Wise Ticket Origin</h3>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Department</th>
                          <th style={styles.th}>Tickets</th>
                          <th style={styles.th}>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.byDepartment.map((dept) => {
                          const percent = stats.total > 0 ? Math.round((dept.count / stats.total) * 100) : 0;
                          return (
                            <tr key={dept.department}>
                              <td style={{ ...styles.td, textTransform: 'uppercase', fontWeight: '600' }}>
                                {dept.department}
                              </td>
                              <td style={{ ...styles.td, fontWeight: 'bold' }}>{dept.count}</td>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '4px' }}>
                                    <div style={{ height: '6px', width: `${percent}%`, background: '#1f2937', borderRadius: '4px' }} />
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#6b7280', minWidth: '30px' }}>{percent}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: theme.colors.background,
    minHeight: 'calc(100vh - 60px)',
    padding: '2rem 1rem',
    fontFamily: theme.font.family,
  },
  container: { maxWidth: '960px', margin: '0 auto' },
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.4rem', flexWrap: 'wrap', gap: '14px',
  },
  heading: { fontSize: '24px', fontWeight: '800', color: theme.colors.text, margin: 0 },
  printBtn: {
    background: '#1f2937', color: '#fff', border: 'none', padding: '9px 18px',
    borderRadius: theme.radius.sm, fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px', marginBottom: '20px',
  },
  statCard: {
    background: '#fff', borderRadius: theme.radius.md, padding: '16px 14px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`,
  },
  statNumber: { fontSize: '26px', fontWeight: '800', color: theme.colors.text },
  statLabel: { fontSize: '11px', color: theme.colors.textMuted, marginTop: '4px', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' },
  sectionCard: {
    background: '#fff', borderRadius: theme.radius.md, padding: '20px',
    boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, marginBottom: '20px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: theme.colors.text, margin: '0 0 14px' },
  progressBarBg: { height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: '#059669', transition: 'width 0.3s ease' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    textAlign: 'left', padding: '8px 10px', background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600',
  },
  td: { padding: '9px 10px', borderBottom: '1px solid #f3f4f6', color: '#374151' },
};

export default Reports;

