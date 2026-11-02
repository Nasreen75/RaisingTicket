import BackButton from '../components/BackButton';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
    <div style={{ maxWidth: '420px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
      <BackButton fallbackPath="/dashboard" />
      <h2 style={{ color: '#c1121f', marginTop: '1rem' }}>🚫 Access Denied</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '1.5rem' }}>You don't have permission to view this page or department section.</p>
      <Link to="/dashboard" style={{ display: 'inline-block', padding: '8px 16px', background: '#c1121f', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default Unauthorized;