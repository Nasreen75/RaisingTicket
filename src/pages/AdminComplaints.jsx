import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import theme from '../theme';

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

const AdminComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [unresolvedHodOnly, setUnresolvedHodOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();
      if (unresolvedHodOnly) params.unresolved_hod = 'true';

      const res = await api.get('/complaints', { params });
      setComplaints(res.data.complaints);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.total || res.data.complaints.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/users', { params: { role: 'worker' } });
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, unresolvedHodOnly, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleAssign = async (id, assigned_to) => {
    if (!assigned_to) return;
    setUpdatingId(id);
    try {
      await api.patch(`/complaints/${id}/assign`, { assigned_to });
      await fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    let admin_remarks = '';
    let closure_otp = '';
    let admin_override = false;

    if (status === 'resolved' || status === 'closed') {
      const otpPromptMsg = user?.role === 'admin'
        ? '🔐 DIGITAL HANDOVER VERIFICATION:\nEnter the 4-digit Student Handover OTP (obtain from student upon physical resolution).\n\n(Admins: type "OVERRIDE" for emergency bypass if student is unreachable):'
        : '🔐 DIGITAL HANDOVER VERIFICATION:\nEnter the 4-digit Student Handover OTP provided by the student upon physical resolution:';

      const otpInput = window.prompt(otpPromptMsg, '');
      if (otpInput === null) {
        setUpdatingId(null);
        return;
      }

      if (user?.role === 'admin' && otpInput.trim().toUpperCase() === 'OVERRIDE') {
        admin_override = true;
      } else {
        closure_otp = otpInput.trim();
        if (!closure_otp) {
          alert('Closure Cancelled: 4-digit Student Handover OTP is required.');
          setUpdatingId(null);
          return;
        }
      }

      admin_remarks = window.prompt('Enter resolution remarks (will be emailed to the student):', 'Issue resolved successfully on-site.') || '';
    } else if (status === 'rejected') {
      admin_remarks = window.prompt('Enter reason for rejection (will be emailed to the student):', '') || '';
      if (admin_remarks === null) {
        setUpdatingId(null);
        return;
      }
    }

    try {
      await api.patch(`/complaints/${id}/status`, { status, admin_remarks, closure_otp, admin_override });
      await fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReassign = async (id, category) => {
    if (!category) return;
    setUpdatingId(id);
    try {
      await api.patch(`/complaints/${id}/reassign`, { category });
      await fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    if (complaints.length === 0) {
      alert('No complaints to export');
      return;
    }
    const headers = ['ID', 'Token', 'Title', 'Category', 'Queue Pos', 'Status', 'Raised By', 'Department', 'Assigned To', 'Created Date'];
    const rows = complaints.map(c => [
      c.id,
      c.token_number || `TKN-${String(c.id).padStart(4, '0')}`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.queue_position || 'Resolved',
      c.status,
      `"${(c.raised_by_name || '').replace(/"/g, '""')}"`,
      `"${(c.raised_by_department || '').replace(/"/g, '""')}"`,
      `"${(c.assigned_worker_name || 'Unassigned').replace(/"/g, '""')}"`,
      new Date(c.created_at).toLocaleDateString('en-IN')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MITS_Complaints_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <BackButton fallbackPath="/dashboard" />
          {/* Header Row */}
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.heading}>
                {isAdmin ? 'Campus Central Administration Portal' : `Department Head Portal (${user?.category?.toUpperCase() || user?.department?.toUpperCase() || 'HOD'})`}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: theme.colors.textMuted }}>
                {isAdmin
                  ? 'Full administrative control to monitor, assign, and resolve all campus complaints.'
                  : 'Manage, assign staff, and resolve complaints dedicated to your department.'}
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              style={styles.exportBtn}
              title="Download official report for NAAC/Campus Records"
            >
              📥 Export CSV Report
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={styles.filterBar}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 250px' }}>
              <input
                type="text"
                placeholder="Search by Title, Raiser, Roll No..."
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

              {isAdmin && (
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  style={styles.filterSelect}
                >
                  <option value="">All Categories</option>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => { setUnresolvedHodOnly(!unresolvedHodOnly); setPage(1); }}
                  style={{
                    ...styles.filterSelect,
                    background: unresolvedHodOnly ? '#fee2e2' : theme.colors.surface,
                    color: unresolvedHodOnly ? '#b91c1c' : theme.colors.text,
                    fontWeight: unresolvedHodOnly ? '700' : 'normal',
                    borderColor: unresolvedHodOnly ? '#f87171' : theme.colors.border,
                  }}
                >
                  {unresolvedHodOnly ? '⚠️ Showing HOD Unresolved' : '⚡ Unresolved by HOD'}
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ margin: '10px 0 16px', fontSize: '13px', color: theme.colors.textMuted, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Showing <strong>{complaints.length}</strong> complaints (Total: {totalCount})</span>
            {isAdmin && <span style={{ color: '#059669', fontWeight: '600' }}>🛡️ Admin Superuser Mode: Direct Resolution Enabled</span>}
          </div>

          {loading && <p style={styles.loadingText}>Loading complaints...</p>}
          {error && <p style={styles.error}>{error}</p>}
          {!loading && complaints.length === 0 && (
            <div style={styles.empty}>
              No complaints found matching the current filters.
            </div>
          )}

          {/* Complaints List */}
          {complaints.map((c) => (
            <div key={c.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: theme.colors.primary }}>#{c.id}</span>
                    <h3 style={styles.title}>{c.title}</h3>
                  </div>
                  <span style={styles.meta}>
                    {categoryLabels[c.category] || c.category} • Raised by <strong>{c.raised_by_name}</strong> ({c.raised_by_role || 'Student'})
                    {c.raised_by_department ? ` • Dept: ${c.raised_by_department.toUpperCase()}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {c.queue_position ? (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe'
                    }}>
                      Queue #{c.queue_position}
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
                      {c.token_number || `TKN-${String(c.id).padStart(4, '0')}`}
                    </span>
                  )}
                  <StatusBadge status={c.status} />
                </div>
              </div>

              <p style={styles.description}>{c.description}</p>

              {c.admin_remarks && (
                <p style={styles.remarks}><strong>Official Remarks:</strong> {c.admin_remarks}</p>
              )}

              <div style={styles.actions}>
                <div style={styles.actionGroup}>
                  <label style={styles.actionLabel}>Assign Worker / Staff</label>
                  <select
                    defaultValue=""
                    disabled={updatingId === c.id}
                    onChange={(e) => handleAssign(c.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="">
                      {c.assigned_worker_name ? `Assigned: ${c.assigned_worker_name}` : 'Select worker'}
                    </option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.actionGroup}>
                  <label style={styles.actionLabel}>Update Status (Resolves &amp; Mails User)</label>
                  <select
                    value={c.status}
                    disabled={updatingId === c.id}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    style={{
                      ...styles.select,
                      fontWeight: '600',
                      borderColor: c.status === 'resolved' ? '#10b981' : theme.colors.border,
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed (Final)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {isAdmin && (
                  <div style={styles.actionGroup}>
                    <label style={styles.actionLabel}>Reassign Department</label>
                    <select
                      defaultValue=""
                      disabled={updatingId === c.id}
                      onChange={(e) => handleReassign(c.id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="">
                        Current: {categoryLabels[c.category] || c.category}
                      </option>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
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
  container: { maxWidth: '900px', margin: '0 auto' },
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '1.2rem', flexWrap: 'wrap', gap: '14px',
  },
  heading: { fontSize: '24px', fontWeight: '700', color: theme.colors.text, margin: 0 },
  exportBtn: {
    background: '#1f2937', color: '#fff', border: 'none', padding: '9px 16px',
    borderRadius: theme.radius.sm, fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', transition: 'background 0.2s',
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
  card: {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg, padding: '20px 22px', marginBottom: '16px',
    boxShadow: theme.shadow.sm, transition: 'box-shadow 0.15s ease',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' },
  title: { fontSize: '17px', fontWeight: '600', color: theme.colors.text, margin: 0 },
  meta: { fontSize: '12px', color: theme.colors.textFaint },
  description: { fontSize: '14px', color: theme.colors.textMuted, margin: '12px 0', lineHeight: '1.5' },
  remarks: {
    fontSize: '13px', color: theme.colors.text, background: theme.colors.background,
    padding: '10px 12px', borderRadius: theme.radius.sm, borderLeft: `3px solid ${theme.colors.primary}`,
  },
  actions: { display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap', paddingTop: '14px', borderTop: `1px solid ${theme.colors.border}` },
  actionGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  actionLabel: { fontSize: '11px', color: theme.colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.02em' },
  select: {
    padding: '8px 12px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`,
    fontSize: '13px', minWidth: '180px', background: theme.colors.surface,
    color: theme.colors.text, cursor: 'pointer',
  },
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

export default AdminComplaints;