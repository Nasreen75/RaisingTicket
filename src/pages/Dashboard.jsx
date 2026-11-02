import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import CampusHeatmap from '../components/CampusHeatmap';

const Dashboard = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';
  const isHod = user?.role === 'hod';
  const isFaculty = user?.role === 'faculty';
  const isStaff = user?.role === 'staff';
  const isStudent = user?.role === 'student' || (!isAdmin && !isHod && !isFaculty && !isStaff);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = (isAdmin || isHod) ? '/complaints' : '/complaints/my';
        const res = await api.get(endpoint);
        setComplaints((isAdmin || isHod) ? (res.data.complaints || []) : res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, isHod]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    assigned: complaints.filter((c) => c.status === 'assigned').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
  };

  const recentComplaints = complaints.slice(0, 4);

  // Dynamic role presentation text and description
  const roleDisplayEn = {
    admin: { title: 'Campus Administrator', badge: 'Admin Portal', desc: 'Central governance, grievance routing & escalation oversight' },
    hod: { title: `HOD / Dept Handler (${user?.department ? user.department.toUpperCase() : 'Dept'})`, badge: 'Department Head', desc: `Supervising ${user?.department ? user.department.toUpperCase() : 'departmental'} and assigned domain tickets` },
    faculty: { title: 'Faculty Member', badge: 'Faculty', desc: 'Departmental grievance tracking, academic & infrastructure requests' },
    staff: { title: 'Staff Member', badge: 'Staff', desc: 'Campus facilities, operational support & ticket resolution requests' },
    student: { title: 'Student', badge: 'Student Helpdesk', desc: 'Raise, track and review resolution of campus service requests' }
  }[user?.role] || { title: 'Campus Member', badge: user?.role || 'User', desc: 'MITS Campus Helpdesk' };

  const roleDisplayTe = {
    admin: { title: 'క్యాంపస్ అడ్మినిస్ట్రేటర్', badge: 'అడ్మిన్ పోర్టల్', desc: 'కేంద్ర పాలన, ఫిర్యాదుల రూటింగ్ మరియు పర్యవేక్షణ' },
    hod: { title: `హెచ్.ఓ.డి / విభాగ అధిపతి (${user?.department ? user.department.toUpperCase() : 'విభాగం'})`, badge: 'విభాగ అధిపతి', desc: `${user?.department ? user.department.toUpperCase() : 'విభాగపు'} మరియు కేటాయించిన సమస్యల పర్యవేక్షణ` },
    faculty: { title: 'ఫ్యాకల్టీ సభ్యులు', badge: 'ఫ్యాకల్టీ', desc: 'విభాగపు సమస్యల ట్రాకింగ్, విద్యా మరియు మౌలిక వసతుల అభ్యర్థనలు' },
    staff: { title: 'సిబ్బంది సభ్యులు', badge: 'సిబ్బంది', desc: 'క్యాంపస్ సౌకర్యాలు మరియు కార్యాచరణ సహాయం' },
    student: { title: 'విద్యార్థి', badge: 'విద్యార్థి హెల్ప్‌డెస్క్', desc: 'ఫిర్యాదులను నమోదు చేయండి, ట్రాక్ చేయండి మరియు రేటింగ్ ఇవ్వండి' }
  }[user?.role] || { title: 'క్యాంపస్ సభ్యులు', badge: user?.role || 'సభ్యులు', desc: 'మిట్స్ క్యాంపస్ హెల్ప్‌డెస్క్' };

  const roleDisplay = lang === 'te' ? roleDisplayTe : roleDisplayEn;

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Welcome Banner Card */}
          <div style={styles.welcomeCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h1 style={styles.welcome}>{t('welcomeBack')}, {user?.name} 👋</h1>
                <p style={styles.roleDesc}>{roleDisplay.desc}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={styles.roleBadge}>{roleDisplay.badge}</span>
                {user?.department && (
                  <span style={styles.deptBadge}>🏛️ {user.department.toUpperCase()} DEPT</span>
                )}
              </div>
            </div>
          </div>

          {/* Role-Specific Metric Overview Cards */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>{stats.total}</span>
              <span style={styles.statLabel}>{isAdmin || isHod ? t('totalManaged') : t('totalRaised')}</span>
            </div>
            <div style={{ ...styles.statCard, background: '#fef3c7', borderColor: '#fde68a' }}>
              <span style={{ ...styles.statNumber, color: '#92400e' }}>{stats.pending}</span>
              <span style={styles.statLabel}>{t('pending')}</span>
            </div>
            <div style={{ ...styles.statCard, background: '#ede9fe', borderColor: '#ddd6fe' }}>
              <span style={{ ...styles.statNumber, color: '#5b21b6' }}>{stats.assigned}</span>
              <span style={styles.statLabel}>{t('assigned')}</span>
            </div>
            <div style={{ ...styles.statCard, background: '#dbeafe', borderColor: '#bfdbfe' }}>
              <span style={{ ...styles.statNumber, color: '#1e40af' }}>{stats.in_progress}</span>
              <span style={styles.statLabel}>{t('inProgress')}</span>
            </div>
            <div style={{ ...styles.statCard, background: '#d1fae5', borderColor: '#a7f3d0' }}>
              <span style={{ ...styles.statNumber, color: '#065f46' }}>{stats.resolved}</span>
              <span style={styles.statLabel}>{t('resolved')}</span>
            </div>
          </div>

          {/* Role-Customized Quick Actions Panel with High-Contrast Box Buttons */}
          <div style={styles.quickActionsBox}>
            <div style={styles.quickActionsHeader}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <span>{t('quickActions')}</span>
            </div>
            
            <div style={styles.actionsGrid}>
              {/* ADMIN ACTIONS */}
              {isAdmin && (
                <>
                  <div style={styles.actionCard} onClick={() => navigate('/admin/complaints')}>
                    <div style={styles.actionIcon}>🛡️</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('adminManageCampus')}</div>
                      <div style={styles.actionCardDesc}>Review, filter, reassign, and resolve campus tickets</div>
                    </div>
                  </div>
                  <div style={styles.actionCard} onClick={() => navigate('/reports')}>
                    <div style={styles.actionIcon}>📊</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('campusAuditReports')}</div>
                      <div style={styles.actionCardDesc}>Resolution breakdown, category charts &amp; PDF export</div>
                    </div>
                  </div>
                  <div style={styles.actionCard} onClick={() => navigate('/faq')}>
                    <div style={styles.actionIcon}>📚</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('helpdeskKnowledgeBase')}</div>
                      <div style={styles.actionCardDesc}>Campus FAQ, rules, hostel &amp; scholarship guide</div>
                    </div>
                  </div>
                </>
              )}

              {/* HOD / DEPARTMENT HANDLER ACTIONS */}
              {isHod && (
                <>
                  <div style={styles.actionCard} onClick={() => navigate('/admin/complaints')}>
                    <div style={styles.actionIcon}>🏢</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('deptResolutionDesk')}</div>
                      <div style={styles.actionCardDesc}>Departmental complaints, work orders &amp; staff assigning</div>
                    </div>
                  </div>
                  {user?.department && (
                    <div style={styles.actionCard} onClick={() => navigate('/department-complaints')}>
                      <div style={styles.actionIcon}>🏛️</div>
                      <div>
                        <div style={styles.actionCardTitle}>{t('deptComplaintsTitle')}</div>
                        <div style={styles.actionCardDesc}>View all grievance tickets in {user.department.toUpperCase()}</div>
                      </div>
                    </div>
                  )}
                  <div style={styles.actionCard} onClick={() => navigate('/reports')}>
                    <div style={styles.actionIcon}>📊</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('deptAnalytics')}</div>
                      <div style={styles.actionCardDesc}>SLA turnaround statistics &amp; rating audits</div>
                    </div>
                  </div>
                  <div style={styles.actionCard} onClick={() => navigate('/faq')}>
                    <div style={styles.actionIcon}>📚</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('campusFaq')}</div>
                      <div style={styles.actionCardDesc}>Review campus policies and student FAQ articles</div>
                    </div>
                  </div>
                </>
              )}

              {/* STUDENT / FACULTY / STAFF ACTIONS */}
              {!isAdmin && !isHod && (
                <>
                  <div
                    style={{ ...styles.actionCard, borderColor: '#c1121f', background: '#fff5f5' }}
                    onClick={() => navigate('/raise-complaint')}
                  >
                    <div style={{ ...styles.actionIcon, background: '#fecaca', color: '#b91c1c' }}>📝</div>
                    <div>
                      <div style={{ ...styles.actionCardTitle, color: '#c1121f', fontSize: '16.5px' }}>
                        {t('raiseNewServiceRequest')}
                      </div>
                      <div style={styles.actionCardDesc}>
                        Submit academic, hostel, lab, bus, or fee grievance with photo
                      </div>
                    </div>
                  </div>

                  <div style={styles.actionCard} onClick={() => navigate('/my-complaints')}>
                    <div style={styles.actionIcon}>📋</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('trackMyTickets')}</div>
                      <div style={styles.actionCardDesc}>Live status progress, chat replies, and 5-star rating</div>
                    </div>
                  </div>

                  {user?.department && (
                    <div style={styles.actionCard} onClick={() => navigate('/department-complaints')}>
                      <div style={styles.actionIcon}>🏛️</div>
                      <div>
                        <div style={styles.actionCardTitle}>
                          {user.department.toUpperCase()} {t('deptBoard')}
                        </div>
                        <div style={styles.actionCardDesc}>Inspect departmental tickets and community issues</div>
                      </div>
                    </div>
                  )}

                  <div style={styles.actionCard} onClick={() => navigate('/faq')}>
                    <div style={styles.actionIcon}>💡</div>
                    <div>
                      <div style={styles.actionCardTitle}>{t('knowledgeBaseFaq')}</div>
                      <div style={styles.actionCardDesc}>Instant answers for Wi-Fi, hostel hot water, and bus timings</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Interactive Live Campus Heatmap Radar */}
          <CampusHeatmap />

          {/* Recent Complaints Feed */}
          <div style={styles.recentSection}>
            <div style={styles.recentHeader}>
              <div>
                <h3 style={styles.recentTitle}>
                  {isAdmin ? t('recentCampusComplaints') : isHod ? t('recentDeptComplaints') : t('myRecentTickets')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                  {isAdmin || isHod ? t('clickToInspect') : t('clickToTrack')}
                </p>
              </div>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate(isAdmin || isHod ? '/admin/complaints' : '/my-complaints')}
              >
                {t('viewAll')} ({stats.total}) →
              </button>
            </div>

            {loading && (
              <div style={styles.empty}>
                <div style={styles.spinner} />
                <span style={{ marginTop: '12px', display: 'block', fontSize: '15px' }}>{t('loadingTickets')}</span>
              </div>
            )}
            {!loading && recentComplaints.length === 0 && (
              <div style={styles.empty}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: '#374151' }}>{t('noComplaintsFound')}</p>
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#9ca3af' }}>
                  {!isAdmin && !isHod ? t('clickToReport') : t('allCaughtUp')}
                </p>
              </div>
            )}
            <div style={styles.cardList}>
              {recentComplaints.map((c) => (
                <ComplaintCard key={c.id} complaint={c} showRaisedBy={isAdmin || isHod} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: { background: '#f8fafc', minHeight: 'calc(100vh - 60px)', padding: '2.5rem 1rem' },
  container: { maxWidth: '960px', margin: '0 auto' },
  welcomeCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    marginBottom: '1.75rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1.5px solid #e2e8f0',
  },
  welcome: { fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' },
  roleDesc: { fontSize: '14.5px', color: '#475569', margin: 0, fontWeight: '500' },
  roleBadge: {
    display: 'inline-block',
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '800',
    border: '1.5px solid #f87171',
    letterSpacing: '0.3px',
  },
  deptBadge: {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#334155',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1.5px solid #cbd5e1',
  },
  statsRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.75rem' },
  statCard: {
    flex: '1 1 140px',
    background: '#ffffff',
    borderRadius: '14px',
    padding: '18px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: '1.5px solid #e2e8f0',
  },
  statNumber: { fontSize: '30px', fontWeight: '900', color: '#0f172a' },
  statLabel: { fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' },
  quickActionsBox: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1.5px solid #e2e8f0',
  },
  quickActionsHeader: {
    fontSize: '15px',
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: '16px',
    letterSpacing: '0.8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px',
  },
  actionCard: {
    background: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  actionIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  actionCardTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.3',
  },
  actionCardDesc: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '3px',
    lineHeight: '1.35',
  },
  recentSection: {},
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  recentTitle: { fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' },
  viewAllBtn: {
    background: '#ffffff',
    border: '1.5px solid #c1121f',
    color: '#c1121f',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    padding: '7px 14px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  cardList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  empty: {
    background: '#ffffff',
    padding: '3rem 1.5rem',
    borderRadius: '14px',
    textAlign: 'center',
    color: '#64748b',
    border: '2px dashed #cbd5e1',
  },
  spinner: {
    width: '28px',
    height: '28px',
    margin: '0 auto',
    border: '3px solid #f1f5f9',
    borderTop: '3px solid #c1121f',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default Dashboard;