import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';

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

const statusSteps = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
const statusLabels = {
  pending: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

const HIERARCHY_LABELS = {
  mentor: '👨‍🏫 Faculty Mentor / Class Advisor',
  aao: '🏢 AAO (Academic & Administrative Officer)',
  hod: '🏛️ Head of Department (HOD)',
  warden: '🛏️ Hostel Warden / Resident Incharge',
  lab_incharge: '💻 Lab Incharge / System Administrator',
  not_contacted: '⚠️ Direct Submission (Not Contacted Prior)',
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin / HOD Status Management state
  const [newStatus, setNewStatus] = useState('');
  const [resolutionOtp, setResolutionOtp] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [adminOverride, setAdminOverride] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
      setNewStatus(res.data.status);
      setResolutionRemarks(res.data.admin_remarks || '');
      if (res.data.rating) {
        setRating(res.data.rating);
        setFeedbackComment(res.data.feedback_comment || '');
        setRatingSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    if ((newStatus === 'resolved' || newStatus === 'closed') && !adminOverride && !resolutionOtp.trim()) {
      alert('⚠️ Verification Required: Please enter the 4-digit Student Handover OTP provided by the student upon physical completion.');
      return;
    }

    setStatusUpdating(true);
    try {
      await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        admin_remarks: resolutionRemarks,
        closure_otp: resolutionOtp.trim(),
        admin_override: adminOverride
      });
      alert('Status updated successfully!');
      setResolutionOtp('');
      await fetchComplaint();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/complaints/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err.message);
    }
  };

  useEffect(() => {
    fetchComplaint();
    fetchComments();
  }, [id]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, { message: newComment.trim() });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setRatingLoading(true);
    try {
      await api.post(`/complaints/${id}/rating`, {
        rating,
        feedback_comment: feedbackComment,
      });
      setRatingSubmitted(true);
      fetchComplaint();
      alert('Thank you for rating our resolution service!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const formattedDate = complaint
    ? new Date(complaint.created_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '';

  const isRaiser = user && complaint && user.id === complaint.raised_by;
  const currentStepIndex = complaint ? statusSteps.indexOf(complaint.status) : 0;

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <BackButton fallbackPath="/dashboard" />

          {loading && <p style={{ color: '#6b7280' }}>Loading ticket details...</p>}
          {error && <p style={styles.error}>{error}</p>}

          {complaint && (
            <>
              {/* Main Ticket Card */}
              <div style={styles.card}>
                <div style={styles.header}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#c1121f' }}>
                      Ticket #{complaint.id}
                    </span>
                    <h2 style={styles.title}>{complaint.title}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      🎫 {complaint.token_number || `TKN-${String(complaint.id).padStart(4, '0')}`}
                    </span>
                    <StatusBadge status={complaint.status} />
                  </div>
                </div>

                {/* Status Tracking Progress Bar */}
                <div style={styles.trackerContainer}>
                  <div style={styles.trackerLabel}>Ticket Tracking Status:</div>
                  <div style={styles.trackerSteps}>
                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      return (
                        <div key={step} style={styles.trackerStep}>
                          <div style={{
                            ...styles.stepCircle,
                            background: isCurrent ? '#c1121f' : isCompleted ? '#10b981' : '#e5e7eb',
                            color: isCompleted ? '#fff' : '#6b7280',
                          }}>
                            {isCompleted && !isCurrent ? '✓' : idx + 1}
                          </div>
                          <span style={{
                            ...styles.stepName,
                            fontWeight: isCurrent ? '700' : '500',
                            color: isCurrent ? '#c1121f' : isCompleted ? '#10b981' : '#9ca3af',
                          }}>
                            {statusLabels[step]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={styles.metaRow}>
                  <span style={styles.category}>{categoryLabels[complaint.category] || complaint.category}</span>
                  <span style={styles.date}>Created on {formattedDate}</span>
                </div>

                {/* Live Fair Sequential Queue Card */}
                {['pending', 'assigned', 'in_progress'].includes(complaint.status) ? (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    margin: '14px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontWeight: '800',
                        fontSize: '15px',
                        textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                      }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.9 }}>Queue</div>
                        #{complaint.queue_position || 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                          {complaint.queue_position === 1
                            ? '⚡ Next in Line for Technician Attendance'
                            : `⏳ ${complaint.queue_position - 1} ticket${complaint.queue_position - 1 > 1 ? 's' : ''} ahead of you in queue`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                          FIFO Sequential Queue • Handled in fair order of submission without line-skipping
                        </div>
                      </div>
                    </div>
                    {complaint.total_in_queue && (
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#0369a1',
                        background: '#e0f2fe',
                        padding: '6px 12px',
                        borderRadius: '6px'
                      }}>
                        Total in Dept Queue: {complaint.total_in_queue}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    margin: '12px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#15803d',
                    fontWeight: '600'
                  }}>
                    <span>✅</span> Handled and resolved through fair sequential queue.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
                  {complaint.is_escalated && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: '1px solid #f87171'
                    }}>
                      🚨 Escalated to Central Administration
                    </span>
                  )}
                </div>

                {complaint.raised_by_name && (
                  <p style={styles.metaLine}>
                    Raised by: <strong>{complaint.raised_by_name}</strong> ({complaint.raised_by_role})
                    {complaint.raised_by_department ? ` • Department: ${complaint.raised_by_department.toUpperCase()}` : ''}
                  </p>
                )}

                {/* Pre-Ticket College Hierarchy Interaction Card */}
                {complaint.prior_contact_role && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    margin: '14px 0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🏛️</span>
                      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#1e293b' }}>
                        Pre-Ticket College Hierarchy Interaction
                      </h4>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Authority Contacted:</span>{' '}
                        <strong style={{ color: '#0f172a' }}>
                          {HIERARCHY_LABELS[complaint.prior_contact_role] || complaint.prior_contact_role}
                        </strong>
                      </div>
                      {complaint.prior_contact_name && (
                        <div>
                          <span style={{ color: '#64748b' }}>Staff Name / Office:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>{complaint.prior_contact_name}</strong>
                        </div>
                      )}
                    </div>
                    {complaint.prior_contact_response && (
                      <div style={{ marginTop: '10px', fontSize: '13px', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>
                          Reported Staff Response / Escalation Reason:
                        </span>
                        <span style={{ color: '#334155', fontStyle: 'italic', marginTop: '3px', display: 'block' }}>
                          "{complaint.prior_contact_response}"
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Student Digital Handover Security OTP Card */}
                {isRaiser && ['pending', 'assigned', 'in_progress'].includes(complaint.status) && complaint.closure_otp && (
                  <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: '14px',
                    padding: '22px',
                    margin: '18px 0',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.35)',
                    border: '1.5px solid #334155',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '12px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🔐</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.2px' }}>
                            Digital Handover Security OTP
                          </h3>
                          <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
                            Two-Way Handshake Resolution Verification
                          </p>
                        </div>
                      </div>
                      <span style={{
                        background: '#e0e7ff',
                        color: '#3730a3',
                        fontWeight: '800',
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                      }}>
                        Confidential to You
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
                          Your 4-Digit Resolution Completion Code:
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {complaint.closure_otp.split('').map((digit, idx) => (
                            <div key={idx} style={{
                              width: '44px',
                              height: '52px',
                              background: '#0284c7',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '26px',
                              fontWeight: '900',
                              color: '#ffffff',
                              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                              border: '1.5px solid #38bdf8'
                            }}>
                              {digit}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{
                        flex: '1 1 260px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        borderLeft: '4px solid #f59e0b',
                        fontSize: '12.5px',
                        lineHeight: '1.5',
                        color: '#e2e8f0'
                      }}>
                        <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '2px' }}>
                          ⚠️ Student Instructions:
                        </strong>
                        Share this 4-digit code with the technician or supervisor <strong>ONLY AFTER</strong> they have physically arrived and completely solved your problem. They cannot close this ticket without your OTP.
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Master Oversight of Closure OTP */}
                {user?.role === 'admin' && !isRaiser && ['pending', 'assigned', 'in_progress'].includes(complaint.status) && complaint.closure_otp && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    margin: '14px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '13px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🛡️</span>
                      <span style={{ color: '#334155', fontWeight: '600' }}>
                        Admin Telemetry Oversight: Student's Handover OTP is <strong style={{ color: '#0f172a', letterSpacing: '2px', fontSize: '15px' }}>{complaint.closure_otp}</strong>
                      </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '11.5px' }}>Visible only to central system administrators</span>
                  </div>
                )}

                {/* OTP Verification Verified Badge (Resolved/Closed) */}
                {complaint.is_otp_verified && (
                  <div style={{
                    background: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    margin: '14px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#065f46',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)'
                  }}>
                    <span style={{ fontSize: '24px' }}>🤝</span>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14px' }}>Handover Completed &amp; Physically Verified</div>
                      <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
                        Validated through on-site Student Digital Handover OTP exchange with assigned technician.
                      </div>
                    </div>
                  </div>
                )}

                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>Description</h4>
                  <p style={styles.description}>{complaint.description}</p>
                </div>

                {/* Photo / Attachment Display */}
                {complaint.attachment_url && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Attached Document / Photo</h4>
                    {complaint.attachment_url.startsWith('data:image') ? (
                      <a href={complaint.attachment_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={complaint.attachment_url}
                          alt="Ticket Attachment"
                          style={styles.attachmentImg}
                        />
                      </a>
                    ) : (
                      <a
                        href={complaint.attachment_url}
                        download={`attachment_ticket_${complaint.id}`}
                        style={styles.attachmentLink}
                      >
                        📎 Download Attachment File
                      </a>
                    )}
                  </div>
                )}

                {complaint.assigned_worker_name && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Assigned Department Handler / Worker</h4>
                    <p style={styles.description}>👤 {complaint.assigned_worker_name}</p>
                  </div>
                )}

                {complaint.admin_remarks && (
                  <div style={styles.section}>
                    <h4 style={styles.sectionTitle}>Official Remarks / Resolution Notes</h4>
                    <p style={styles.remarks}>{complaint.admin_remarks}</p>
                  </div>
                )}

                {/* Audit Trail History */}
                {complaint.audit_logs && complaint.audit_logs.length > 0 && (
                  <div style={{ ...styles.section, marginTop: '1.25rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <h4 style={{ ...styles.sectionTitle, color: '#374151' }}>📜 Ticket Audit Trail &amp; Lifecycle History</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {complaint.audit_logs.map((log) => (
                        <div key={log.id} style={{
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '2px' }}>
                            <strong style={{ color: '#111827' }}>{log.action.replace('_', ' ')}</strong>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          <div style={{ color: '#4b5563' }}>
                            {log.new_value}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                            Changed by: {log.changed_by_name || 'System / User'} {log.changed_by_role ? `(${log.changed_by_role})` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Administrative Status & Handover Verification Panel */}
              {(user?.role === 'admin' || user?.role === 'hod') && (
                <div style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🛠️</span>
                    <h3 style={{ ...styles.sectionHeading, margin: 0 }}>
                      Administrative Status &amp; Handover Verification
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>
                    Update grievance status, perform on-site Digital Handover OTP validation, or submit official resolution remarks.
                  </p>

                  <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase' }}>
                          Target Status
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '13.5px',
                            outline: 'none',
                            background: '#ffffff'
                          }}
                        >
                          <option value="pending">Open (Pending Triage)</option>
                          <option value="assigned">Assigned to Handler</option>
                          <option value="in_progress">In Progress (Work Underway)</option>
                          <option value="resolved">Resolved (Physical Fix Complete)</option>
                          <option value="closed">Closed (Final Signoff)</option>
                          <option value="rejected">Rejected (Out of Scope / Invalid)</option>
                        </select>
                      </div>

                      {(newStatus === 'resolved' || newStatus === 'closed') && (
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#b91c1c', marginBottom: '6px', textTransform: 'uppercase' }}>
                            🔑 Student 4-Digit Handover OTP *
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 4821"
                            value={resolutionOtp}
                            disabled={adminOverride}
                            onChange={(e) => setResolutionOtp(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1.5px solid #b91c1c',
                              borderRadius: '8px',
                              fontSize: '14px',
                              letterSpacing: '2px',
                              fontWeight: '700',
                              background: adminOverride ? '#f1f5f9' : '#ffffff',
                              boxSizing: 'border-box'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                            Must match student's secret 4-digit code shown on their ticket screen.
                          </span>
                        </div>
                      )}
                    </div>

                    {(newStatus === 'resolved' || newStatus === 'closed') && user?.role === 'admin' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <input
                          type="checkbox"
                          id="adminOverride"
                          checked={adminOverride}
                          onChange={(e) => setAdminOverride(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="adminOverride" style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer' }}>
                          <strong>Admin Emergency Override:</strong> Close without Student OTP (e.g. student unreachable).
                        </label>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Official Remarks / Resolution Summary
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Enter official resolution notes or feedback for the student..."
                        value={resolutionRemarks}
                        onChange={(e) => setResolutionRemarks(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={statusUpdating}
                      style={{
                        alignSelf: 'flex-start',
                        background: '#c1121f',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(193, 18, 31, 0.2)'
                      }}
                    >
                      {statusUpdating ? 'Updating Status...' : 'Apply Status Update'}
                    </button>
                  </form>
                </div>
              )}

              {/* Feedback & Rating Section (When Resolved or Closed) */}
              {(complaint.status === 'resolved' || complaint.status === 'closed') && (
                <div style={styles.card}>
                  <h3 style={styles.sectionHeading}>⭐ Service Feedback &amp; Rating</h3>
                  {ratingSubmitted || complaint.rating ? (
                    <div style={styles.ratingBox}>
                      <div style={{ fontSize: '24px', color: '#f59e0b', marginBottom: '6px' }}>
                        {'★'.repeat(complaint.rating || rating)}
                        {'☆'.repeat(5 - (complaint.rating || rating))}
                      </div>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                        Rating: {complaint.rating || rating} out of 5 stars
                      </p>
                      {complaint.feedback_comment && (
                        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          "{complaint.feedback_comment}"
                        </p>
                      )}
                    </div>
                  ) : isRaiser ? (
                    <form onSubmit={handleRatingSubmit} style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 10px' }}>
                        How satisfied are you with the resolution of this ticket?
                      </p>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '26px', cursor: 'pointer', marginBottom: '14px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setRating(star)}
                            style={{ color: star <= rating ? '#f59e0b' : '#d1d5db', transition: 'color 0.15s' }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <textarea
                        placeholder="Write your feedback comment (optional)..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={3}
                        style={styles.commentInput}
                      />
                      <button
                        type="submit"
                        disabled={ratingLoading}
                        style={styles.submitRatingBtn}
                      >
                        {ratingLoading ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </form>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}>No student feedback provided yet.</p>
                  )}
                </div>
              )}

              {/* Conversation / Comments Thread */}
              <div style={styles.card}>
                <h3 style={styles.sectionHeading}>💬 Conversation Thread ({comments.length})</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>
                  Direct replies between student and department handlers regarding this ticket.
                </p>

                <div style={styles.commentsList}>
                  {comments.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>
                      No messages yet. Send a message below to start the thread.
                    </p>
                  ) : (
                    comments.map((cm) => {
                      const isMe = user && user.id === cm.user_id;
                      const timeStr = new Date(cm.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      });
                      return (
                        <div
                          key={cm.id}
                          style={{
                            ...styles.commentBubble,
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            background: isMe ? '#fef2f2' : '#f3f4f6',
                            borderLeft: isMe ? '3px solid #c1121f' : '3px solid #6b7280',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', fontSize: '12px', color: isMe ? '#c1121f' : '#1f2937' }}>
                              {cm.user_name} <span style={{ fontWeight: 'normal', color: '#6b7280' }}>({cm.user_role})</span>
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{timeStr}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: '1.4' }}>
                            {cm.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendComment} style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Type a reply to the department handler / student..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={styles.replyInput}
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !newComment.trim()}
                    style={styles.replyBtn}
                  >
                    {commentLoading ? 'Sending...' : 'Reply'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f9fafb', minHeight: 'calc(100vh - 60px)', padding: '2rem 1rem' },
  container: { maxWidth: '720px', margin: '0 auto' },
  backBtn: {
    background: 'none', border: 'none', color: '#6b7280', fontSize: '13px',
    cursor: 'pointer', marginBottom: '14px', padding: 0,
  },
  error: { color: '#dc2626', fontSize: '14px' },
  card: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '18px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' },
  title: { fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '4px 0 0' },
  trackerContainer: {
    marginTop: '16px', padding: '14px', background: '#f9fafb', borderRadius: '10px',
    border: '1px solid #f3f4f6',
  },
  trackerLabel: { fontSize: '12px', fontWeight: '700', color: '#6b7280', marginBottom: '10px', textTransform: 'uppercase' },
  trackerSteps: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  trackerStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '1 1 50px' },
  stepCircle: {
    width: '26px', height: '26px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
  },
  stepName: { fontSize: '11px', textAlign: 'center' },
  metaRow: { display: 'flex', gap: '14px', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap' },
  category: { background: '#f3f4f6', padding: '3px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' },
  date: { fontSize: '12px', color: '#9ca3af' },
  metaLine: { fontSize: '13px', color: '#4b5563', marginTop: '8px' },
  section: { marginTop: '18px' },
  sectionTitle: { fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 6px' },
  sectionHeading: { fontSize: '17px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px' },
  description: { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 },
  attachmentImg: { maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '6px', cursor: 'pointer' },
  attachmentLink: { display: 'inline-block', color: '#c1121f', fontWeight: '600', fontSize: '13px', marginTop: '6px', textDecoration: 'none' },
  remarks: { fontSize: '14px', color: '#374151', background: '#f9fafb', padding: '12px 14px', borderRadius: '8px', margin: 0, borderLeft: '3px solid #10b981' },
  ratingBox: { background: '#fef3c7', padding: '14px 18px', borderRadius: '10px', border: '1px solid #fde68a' },
  commentInput: {
    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px',
  },
  submitRatingBtn: {
    background: '#c1121f', color: '#fff', border: 'none', padding: '8px 18px',
    borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  commentsList: {
    display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px',
    overflowY: 'auto', paddingRight: '4px',
  },
  commentBubble: {
    maxWidth: '85%', padding: '10px 14px', borderRadius: '8px',
  },
  replyInput: {
    flex: 1, padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
  },
  replyBtn: {
    background: '#1f2937', color: '#fff', border: 'none', padding: '0 18px',
    borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
};

export default ComplaintDetail;