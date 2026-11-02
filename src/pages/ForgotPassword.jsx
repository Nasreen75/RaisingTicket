import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import theme from '../theme';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email: email.trim().toLowerCase() });
      if (typeof res.data === 'string' && res.data.includes('<!doctype')) {
        throw new Error('Please restart your backend server with "npm run dev" to load the latest routes.');
      }
      setSuccess(res.data?.message || 'Verification OTP sent to your email.');
      setCountdown(60);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || err.friendlyMessage || 'Failed to send OTP. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password/reset', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      setSuccess(res.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.friendlyMessage || 'Failed to reset password. Please verify the OTP.');
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

        <div style={styles.formCard}>
          <div style={styles.iconCircle}>🔐</div>
          <h2 style={styles.heading}>Reset Your Password</h2>
          <p style={styles.subheading}>
            {step === 1
              ? 'Enter your registered college or personal email address to receive a verification OTP.'
              : `Enter the 6-digit OTP sent to ${email} along with your new password.`}
          </p>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          {success && <div style={styles.successBox}>✅ {success}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} style={{ width: '100%' }}>
              <input
                type="email"
                placeholder="Enter Registered Email Address"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = '#c1121f')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />

              <button
                type="submit"
                disabled={loading}
                style={loading ? { ...styles.button, opacity: 0.7, cursor: 'not-allowed' } : styles.button}
              >
                {loading ? 'Sending Verification Code...' : 'Get OTP Code →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter 6-Digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  style={{
                    ...styles.input,
                    marginBottom: 0,
                    letterSpacing: otp ? '4px' : 'normal',
                    fontWeight: otp ? '700' : 'normal',
                    fontSize: '15px',
                    textAlign: 'center',
                    flex: 1,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c1121f')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading || countdown > 0}
                  style={{
                    background: countdown > 0 ? '#9ca3af' : '#374151',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
                </button>
              </div>

              <input
                type="password"
                placeholder="New Password (min. 6 characters)"
                value={newPassword}
                autoComplete="new-password"
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = '#c1121f')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = '#c1121f')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              />

              <button
                type="submit"
                disabled={loading}
                style={loading ? { ...styles.button, opacity: 0.7, cursor: 'not-allowed' } : styles.button}
              >
                {loading ? 'Updating Password...' : 'Reset Password & Login →'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={styles.changeEmailBtn}
              >
                ← Change Email Address
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '12px', width: '100%', textAlign: 'center' }}>
            <Link to="/login" style={styles.backLink}>
              ← Back to Login
            </Link>
          </div>
        </div>
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
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/MITS-Home.jpeg)',
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
    padding: '2rem 1rem',
    boxSizing: 'border-box',
  },
  bannerWrapper: {
    background: 'transparent',
    padding: '0',
    marginBottom: '1.75rem',
    maxWidth: '820px',
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
    filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.4))',
  },
  formCard: {
    background: '#ffffff',
    padding: '2.4rem 2.6rem',
    borderRadius: '16px',
    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
    width: '100%',
    maxWidth: '460px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    marginBottom: '12px',
    border: '1.5px solid #fee2e2',
  },
  heading: {
    margin: '0 0 6px 0',
    color: '#0f172a',
    fontSize: '22px',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: '-0.3px',
  },
  subheading: {
    margin: '0 0 18px 0',
    color: '#64748b',
    fontSize: '13.5px',
    textAlign: 'center',
    lineHeight: '1.45',
  },
  input: {
    display: 'block',
    width: '100%',
    minHeight: '48px',
    padding: '13px 16px',
    margin: '10px 0',
    border: '1.5px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '14.5px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  button: {
    width: '100%',
    minHeight: '48px',
    padding: '13px',
    background: '#c1121f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15.5px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    transition: 'background 0.2s',
    boxShadow: '0 4px 14px rgba(193, 18, 31, 0.3)',
  },
  changeEmailBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    display: 'block',
    width: '100%',
    textAlign: 'center',
  },
  backLink: {
    color: '#c1121f',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '13px',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '14px',
    width: '100%',
    boxSizing: 'border-box',
    fontWeight: '500',
  },
  successBox: {
    background: '#dcfce7',
    color: '#15803d',
    border: '1px solid #86efac',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '14px',
    width: '100%',
    boxSizing: 'border-box',
    fontWeight: '600',
  },
};

export default ForgotPassword;

