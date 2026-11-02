import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.friendlyMessage || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.bannerWrapper}>
          <img
            src="/mits-logo-white-border.png?v=4"
            alt="Madanapalle Institute of Technology & Science"
            style={styles.bannerImage}
          />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.header}>
            <span style={styles.headerIcon}>🏛️</span>
            <h2 style={styles.heading}>CampusCare Portal Login</h2>
            <p style={styles.subheading}>
              Access the MITS College Helpdesk &amp; Grievance Redressal System
            </p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* Email Input Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>✉️</span>
              Campus Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. 21691a0501@mits.ac.in or faculty@mits.ac.in"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#c1121f';
                e.target.style.boxShadow = '0 0 0 4px rgba(193, 18, 31, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password Input Field with Show/Hide toggle */}
          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span>
                Account Password
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your registered account password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...styles.input, paddingRight: '48px' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c1121f';
                  e.target.style.boxShadow = '0 0 0 4px rgba(193, 18, 31, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={styles.spinner}></span> Authenticating...
              </span>
            ) : (
              'Sign In to Helpdesk →'
            )}
          </button>

          <div style={styles.footer}>
            <p style={styles.registerText}>
              New to CampusCare?{' '}
              <Link to="/register" style={styles.registerLink}>
                Create an Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.55)), url(/MITS-Home.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflowY: 'auto',
    fontFamily: theme.font.family,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    width: '100%',
    padding: '2.5rem 1rem',
    boxSizing: 'border-box',
  },
  bannerWrapper: {
    background: 'transparent',
    padding: '0',
    marginBottom: '1.5rem',
    maxWidth: '840px',
    width: '96%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  bannerImage: {
    width: '100%',
    height: 'auto',
    maxHeight: '180px',
    objectFit: 'contain',
    display: 'block',
    filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.5))',
  },
  form: {
    background: 'rgba(255, 255, 255, 0.98)',
    padding: '2.2rem 2.4rem',
    borderRadius: '16px',
    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    width: '460px',
    maxWidth: '94%',
    backdropFilter: 'blur(12px)',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.6rem',
  },
  headerIcon: {
    fontSize: '28px',
    display: 'inline-block',
    marginBottom: '4px',
  },
  heading: {
    margin: '0 0 6px',
    color: '#0f172a',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
  },
  subheading: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.45',
  },
  fieldGroup: {
    marginBottom: '1.2rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '6px',
    letterSpacing: '0.1px',
  },
  labelIcon: {
    fontSize: '14px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  forgotLink: {
    color: '#c1121f',
    fontSize: '12.5px',
    fontWeight: '700',
    textDecoration: 'none',
  },
  input: {
    display: 'block',
    width: '100%',
    minHeight: '48px',
    padding: '13px 16px',
    border: '1.5px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '14.5px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    color: '#0f172a',
    background: '#ffffff',
    fontFamily: 'inherit',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '6px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    minHeight: '48px',
    padding: '13px',
    background: '#c1121f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15.5px',
    fontWeight: '700',
    marginTop: '6px',
    transition: 'background 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 14px rgba(193, 18, 31, 0.3)',
    letterSpacing: '0.2px',
    fontFamily: 'inherit',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    marginTop: '1.2rem',
    textAlign: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  registerText: {
    margin: 0,
    fontSize: '13.5px',
    color: '#64748b',
  },
  registerLink: {
    color: '#c1121f',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '3px',
  },
  errorBox: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
};

export default Login;