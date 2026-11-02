import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      // quiet fail if notifications not loaded
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async () => {
    try {
      await api.patch('/notifications/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    ...styles.link,
    ...(isActive(path) ? styles.linkActive : {}),
  });

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <Link to="/dashboard" style={styles.logoLink}>
          <div style={styles.brandBadge}>
            <span style={{ fontSize: '24px' }}>🏛️</span>
            <div>
              <span style={styles.logo}>MITS HELPDESK</span>
              <div style={styles.logoSub}>CAMPUSCARE GRIEVANCE PORTAL</div>
            </div>
          </div>
        </Link>
      </div>

      <div style={styles.right}>
        {user.role === 'admin' && (
          <>
            <Link to="/admin/complaints" style={linkStyle('/admin/complaints')}>
              🛡️ {lang === 'te' ? 'కేంద్ర కన్సోల్' : 'Manage Complaints'}
            </Link>
            <Link to="/reports" style={linkStyle('/reports')}>
              📊 {t('reports')}
            </Link>
          </>
        )}

        {user.role === 'hod' && (
          <>
            <Link to="/admin/complaints" style={linkStyle('/admin/complaints')}>
              🏢 {lang === 'te' ? 'హెచ్.ఓ.డి డెస్క్' : 'HOD Portal'}
            </Link>
            {user.department && (
              <Link to="/department-complaints" style={linkStyle('/department-complaints')}>
                🏛️ {lang === 'te' ? 'విభాగ బోర్డు' : 'Dept Complaints'}
              </Link>
            )}
            <Link to="/reports" style={linkStyle('/reports')}>
              📊 {t('reports')}
            </Link>
          </>
        )}

        {!['admin', 'hod'].includes(user.role) && (
          <>
            <Link to="/raise-complaint" style={linkStyle('/raise-complaint')}>
              📝 {lang === 'te' ? '+ ఫిర్యాదు చేయండి' : '+ Raise Ticket'}
            </Link>
            <Link to="/my-complaints" style={linkStyle('/my-complaints')}>
              📋 {lang === 'te' ? 'నా టికెట్లు' : 'My Tickets'}
            </Link>
            {user.department && (
              <Link to="/department-complaints" style={linkStyle('/department-complaints')}>
                🏛️ {user.department.toUpperCase()} {t('deptBoard')}
              </Link>
            )}
          </>
        )}

        {/* FAQ */}
        <Link to="/faq" style={linkStyle('/faq')}>
          📖 {t('faq')}
        </Link>

        {/* Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          style={styles.langBtn}
          title="Switch Language / భాషను మార్చుకోండి"
        >
          🌐 <span style={{ fontWeight: '800' }}>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>

        {/* In-App Notifications Bell Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (!showNotifDropdown && unreadCount > 0) {
                handleMarkAsRead();
              }
            }}
            style={styles.notifBtn}
            title="In-app alerts"
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.notifBadge}>{unreadCount}</span>
            )}
          </button>

          {showNotifDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <strong style={{ fontSize: '14px', color: '#1f2937' }}>Alerts &amp; Updates</strong>
                {unreadCount > 0 && (
                  <span
                    onClick={handleMarkAsRead}
                    style={{ fontSize: '12px', color: '#c1121f', cursor: 'pointer', fontWeight: '700' }}
                  >
                    Mark read
                  </span>
                )}
              </div>
              <div style={styles.dropdownBody}>
                {notifications.length === 0 ? (
                  <p style={{ padding: '20px', margin: 0, fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
                    No recent notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        if (n.link) navigate(n.link);
                      }}
                      style={{
                        ...styles.notifItem,
                        background: n.is_read ? '#fff' : '#fef2f2',
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#1f2937', marginBottom: '2px' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.4' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.divider} />

        {/* User Card */}
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user.name}</span>
          <span style={styles.userRole}>
            {user.role?.toUpperCase()} {user.department ? `(${user.department.toUpperCase()})` : ''}
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
          onMouseEnter={(e) => (e.target.style.background = '#9e0e19')}
          onMouseLeave={(e) => (e.target.style.background = '#c1121f')}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: '#111827',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    flexWrap: 'wrap',
    gap: '12px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '2px solid rgba(193,18,31,0.6)',
  },
  left: { display: 'flex', alignItems: 'center' },
  logoLink: { textDecoration: 'none' },
  brandBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '1px',
    display: 'block',
    lineHeight: '1.1',
  },
  logoSub: {
    fontSize: '9px',
    color: '#f87171',
    fontWeight: '800',
    letterSpacing: '0.8px',
    marginTop: '2px',
  },
  right: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  link: {
    color: '#f3f4f6',
    textDecoration: 'none',
    fontSize: '14.5px',
    fontWeight: '600',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  linkActive: {
    background: '#c1121f',
    color: '#ffffff',
    borderColor: '#ef4444',
    boxShadow: '0 2px 8px rgba(193,18,31,0.4)',
  },
  langBtn: {
    background: '#1f2937',
    color: '#fbbf24',
    border: '1.5px solid #d97706',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },
  divider: {
    width: '1px',
    height: '28px',
    background: 'rgba(255,255,255,0.2)',
  },
  notifBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    position: 'relative',
    padding: '7px 11px',
    color: '#fff',
  },
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '900',
    borderRadius: '999px',
    padding: '2px 6px',
    border: '2px solid #111827',
  },
  dropdown: {
    position: 'absolute',
    top: '44px',
    right: 0,
    width: '320px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
    border: '1px solid #e5e7eb',
    zIndex: 200,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  dropdownBody: { maxHeight: '340px', overflowY: 'auto' },
  notifItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  userName: { fontSize: '13.5px', fontWeight: '800', color: '#fff' },
  userRole: { fontSize: '10.5px', color: '#9ca3af', fontWeight: '700', letterSpacing: '0.4px' },
  logoutBtn: {
    background: '#c1121f',
    color: '#ffffff',
    border: 'none',
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(193,18,31,0.3)',
    transition: 'background 0.2s',
  },
};

export default Navbar;