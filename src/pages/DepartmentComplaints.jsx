import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import BackButton from '../components/BackButton';
import theme from '../theme';

const DepartmentComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    if (!user || !user.department) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get(`/complaints/department/${user.department}`, { params });
      setComplaints(res.data.complaints);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.total || res.data.complaints.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load department complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter, page, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleExportCSV = () => {
    if (complaints.length === 0) {
      alert('No complaints to export');
      return;
    }
    const headers = ['ID', 'Token', 'Title', 'Category', 'Queue Pos', 'Status', 'Raised By', 'Department', 'Created Date'];
    const rows = complaints.map(c => [
      c.id,
      c.token_number || `TKN-${String(c.id).padStart(4, '0')}`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.queue_position || 'Resolved',
      c.status,
      `"${(c.raised_by_name || '').replace(/"/g, '""')}"`,
      `"${(c.raised_by_department || '').replace(/"/g, '""')}"`,
      new Date(c.created_at).toLocaleDateString('en-IN')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${user.department.toUpperCase()}_Complaints_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user?.department) {
    return (
      <div>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.container}>
            <div style={styles.empty}>You do not belong to a specific department in your profile.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <BackButton fallbackPath="/dashboard" />
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.heading}>{user.department.toUpperCase()} Department Complaints</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme.colors.textMuted }}>
                Dedicated departmental board for {user.department.toUpperCase()} students, staff, and faculty.
              </p>
            </div>
            <button onClick={handleExportCSV} style={styles.exportBtn}>
              📥 Export CSV
            </button>
          </div>

          <div style={styles.filterBar}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 220px' }}>
              <input
                type="text"
                placeholder="Search departmental complaints..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchBtn}>Search</button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setPage(1); }}
                  style={styles.clearBtn}
                >
                  Clear
                </button>
              )}
            </form>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={styles.filterSelect}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ margin: '10px 0 16px', fontSize: '13px', color: theme.colors.textMuted }}>
            Showing <strong>{complaints.length}</strong> complaints (Total: {totalCount})
          </div>

          {loading && <p style={styles.loadingText}>Loading...</p>}
          {error && <p style={styles.error}>{error}</p>}
          {!loading && complaints.length === 0 && <div style={styles.empty}>No complaints found for your department.</div>}

          <div style={styles.cardList}>
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} showRaisedBy={true} />
            ))}
          </div>

          {!loading && complaints.length > 0 && (
            <div style={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{ ...styles.pageBtn, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Prev
              </button>
              <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
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
  container: { maxWidth: '860px', margin: '0 auto' },
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px',
  },
  heading: { fontSize: '24px', fontWeight: '700', color: theme.colors.text, margin: 0 },
  exportBtn: {
    background: '#1f2937', color: '#fff', border: 'none', padding: '8px 14px',
    borderRadius: theme.radius.sm, fontSize: '12px', fontWeight: '600',
    cursor: 'pointer',
  },
  filterBar: {
    display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
    background: theme.colors.surface, padding: '12px 16px', borderRadius: theme.radius.md,
    boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`,
  },
  searchInput: {
    flex: 1, padding: '8px 12px', borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.border}`, fontSize: '13px', outline: 'none',
  },
  searchBtn: {
    background: theme.colors.primary, color: '#fff', border: 'none',
    padding: '8px 14px', borderRadius: theme.radius.sm, fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
  },
  clearBtn: {
    background: 'none', border: `1px solid ${theme.colors.border}`,
    padding: '8px 10px', borderRadius: theme.radius.sm, fontSize: '12px',
    cursor: 'pointer', color: theme.colors.textMuted,
  },
  filterSelect: {
    padding: '8px 12px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`,
    fontSize: '13px', background: theme.colors.surface, color: theme.colors.text, cursor: 'pointer',
  },
  loadingText: { color: theme.colors.textMuted, fontSize: '14px' },
  error: {
    color: theme.colors.danger, fontSize: '14px', background: theme.colors.dangerBg,
    padding: '10px 14px', borderRadius: theme.radius.sm,
  },
  empty: {
    background: theme.colors.surface, padding: '2.5rem', borderRadius: theme.radius.lg,
    textAlign: 'center', color: theme.colors.textMuted, boxShadow: theme.shadow.sm,
  },
  cardList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '14px', marginTop: '24px', paddingTop: '10px',
  },
  pageBtn: {
    padding: '8px 16px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surface, color: theme.colors.text, fontSize: '13px',
  },
  pageInfo: { fontSize: '13px', color: theme.colors.textMuted },
};

export default DepartmentComplaints;
