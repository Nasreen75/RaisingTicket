import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

const MyComplaints = () => {
  const { lang, t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/my');
        setComplaints(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <BackButton fallbackPath="/dashboard" />
          {/* Enhanced Header Banner Box */}
          <div style={styles.headerBox}>
            <div>
              <h2 style={styles.heading}>📋 {lang === 'te' ? 'నా ఫిర్యాదుల ట్రాకింగ్' : 'My Complaints & Service Requests'}</h2>
              <p style={styles.subheading}>
                {lang === 'te' ? 'మీ ఫిర్యాదుల స్థితి, అధికారి వ్యాఖ్యలు మరియు పురోగతిని ఇక్కడ ట్రాక్ చేయండి.' : 'Track live milestone progress, technician notes, replies, and submit ratings.'}
              </p>
              {!loading && (
                <div style={styles.countBadge}>
                  {complaints.length} {complaints.length === 1 ? 'Complaint Registered' : 'Complaints Registered'}
                </div>
              )}
            </div>
            <button
              style={styles.newBtn}
              onClick={() => navigate('/raise-complaint')}
              onMouseEnter={(e) => (e.target.style.background = '#9e0e19')}
              onMouseLeave={(e) => (e.target.style.background = '#c1121f')}
            >
              + {lang === 'te' ? 'కొత్త ఫిర్యాదు చేయండి' : 'Raise New Complaint'}
            </button>
          </div>

          {loading && (
            <div style={styles.empty}>
              <div style={styles.spinner} />
              <span style={{ marginTop: '14px', display: 'block', fontSize: '15px' }}>Loading your complaints...</span>
            </div>
          )}
          {error && <div style={styles.errorBox}>{error}</div>}

          {!loading && complaints.length === 0 && !error && (
            <div style={styles.empty}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>📂</span>
              <p style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1e293b' }}>
                {lang === 'te' ? 'మీరు ఇంకా ఎలాంటి ఫిర్యాదులు చేయలేదు.' : "You haven't raised any complaints yet."}
              </p>
              <p style={{ margin: '6px 0 16px', fontSize: '13.5px', color: '#64748b' }}>
                Any campus infrastructure, academic, or hostel problem can be filed in under 30 seconds.
              </p>
              <button
                style={{ ...styles.newBtn, margin: '0 auto' }}
                onClick={() => navigate('/raise-complaint')}
                onMouseEnter={(e) => (e.target.style.background = '#9e0e19')}
                onMouseLeave={(e) => (e.target.style.background = '#c1121f')}
              >
                + {lang === 'te' ? 'మొదటి ఫిర్యాదు చేయండి' : 'Raise Your First Complaint'}
              </button>
            </div>
          )}

          <div style={styles.cardList}>
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
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
  container: { maxWidth: '820px', margin: '0 auto' },
  headerBox: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    marginBottom: '1.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1.5px solid #e2e8f0',
  },
  heading: { fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' },
  subheading: { fontSize: '14.5px', color: '#475569', margin: 0, fontWeight: '500' },
  countBadge: {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#334155',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '800',
    marginTop: '10px',
    border: '1px solid #cbd5e1',
  },
  newBtn: {
    background: '#c1121f',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14.5px',
    fontWeight: '800',
    boxShadow: '0 4px 12px rgba(193,18,31,0.3)',
    transition: 'background 0.2s ease',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    marginBottom: '14px',
  },
  cardList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  empty: {
    background: '#ffffff',
    padding: '3.5rem 2rem',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#64748b',
    border: '2px dashed #cbd5e1',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
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

export default MyComplaints;