import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import theme from '../theme';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    reg_or_emp_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [infoMsg, setInfoMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid campus email address first.');
      return;
    }
    setError('');
    setInfoMsg('');
    setOtpSending(true);
    try {
      const res = await api.post('/auth/send-otp', { email: formData.email.trim() });
      setOtpSent(true);
      setCountdown(60);
      setInfoMsg(res.data.message || 'Verification OTP successfully dispatched to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch OTP. Please check your email address.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!otpSent) {
      setError('Please click "Get OTP" and verify your email before registering.');
      return;
    }
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP received on your email.');
      return;
    }

    setLoading(true);
    try {
      await register({ ...formData, email: formData.email.trim(), otp });
      alert('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.friendlyMessage || 'Registration failed');
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
            <span style={styles.headerIcon}>🎓</span>
            <h2 style={styles.heading}>Create CampusCare Account</h2>
            <p style={styles.subheading}>
              Register with your institutional details to access student &amp; faculty services
            </p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          {infoMsg && <div style={styles.infoBox}>✅ {infoMsg}</div>}

          {/* Full Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👤</span>
              Full Legal Name
            </label>
            <input
              name="name"
              placeholder="e.g. K. Sai Krishna or Dr. A. Sharma"
              value={formData.name}
              onChange={handleChange}
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

          {/* Campus Email with OTP Trigger Button */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>✉️</span>
              Campus Email Address
            </label>
            <div style={styles.inputWithBtnRow}>
              <input
                name="email"
                type="email"
                placeholder="e.g. 21691a0501@mits.ac.in or faculty@mits.ac.in"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ ...styles.input, flex: 1, margin: 0 }}
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
                onClick={handleSendOtp}
                disabled={otpSending || countdown > 0}
                style={{
                  ...styles.getOtpBtn,
                  background: countdown > 0 ? '#94a3b8' : '#c1121f',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {otpSending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Get OTP'}
              </button>
            </div>
          </div>

          {/* 6-Digit Email Verification OTP */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔑</span>
              6-Digit Email Verification Code
            </label>
            <input
              name="otp"
              placeholder="Enter 6-digit OTP code received on your email (e.g. 482103)"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              style={{
                ...styles.input,
                letterSpacing: otp ? '4px' : 'normal',
                fontWeight: otp ? '700' : 'normal',
                borderColor: otpSent ? '#c1121f' : '#d1d5db',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#c1121f';
                e.target.style.boxShadow = '0 0 0 4px rgba(193, 18, 31, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = otpSent ? '#c1121f' : '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password with Show/Hide toggle */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔒</span>
              Create Account Password
            </label>
            <div style={styles.passwordWrapper}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters (e.g. Mits#Secure2026)"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ ...styles.input, paddingRight: '48px', margin: 0 }}
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

          {/* Two-Column Grid: Campus Role & Department */}
          <div style={styles.gridRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🏷️</span>
                Campus Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="student">Student (B.Tech / MCA / MBA)</option>
                <option value="faculty">Faculty Member</option>
                <option value="staff">Administrative Staff</option>
                <option value="worker">Campus Facility Worker</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🏛️</span>
                Department / Branch
              </label>
              <input
                name="department"
                placeholder="e.g. CSE, ECE, EEE, MECH, MCA"
                value={formData.department}
                onChange={handleChange}
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
          </div>

          {/* Roll No / Employee ID */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🆔</span>
              Roll Number / Employee ID
            </label>
            <input
              name="reg_or_emp_id"
              placeholder="e.g. 21691A0501 (Student) or EMP-1042 (Staff)"
              value={formData.reg_or_emp_id}
              onChange={handleChange}
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

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={styles.spinner}></span> Creating Account...
              </span>
            ) : (
              'Complete Registration →'
            )}
          </button>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" style={styles.link}>
                Sign In to Account
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
    padding: '2.4rem 2.8rem',
    borderRadius: '16px',
    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    width: '540px',
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
    marginBottom: '1.1rem',
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
  select: {
    display: 'block',
    width: '100%',
    minHeight: '48px',
    padding: '13px 16px',
    border: '1.5px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#ffffff',
    color: '#0f172a',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  inputWithBtnRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  getOtpBtn: {
    minHeight: '48px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0 18px',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s ease',
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
  gridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '12px',
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
    letterSpacing: '0.2px',
    transition: 'background 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 14px rgba(193, 18, 31, 0.3)',
    fontFamily: 'inherit',
  },
  buttonDisabled: {
    background: '#e08a90',
    cursor: 'not-allowed',
    boxShadow: 'none',
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
  footerText: {
    margin: 0,
    fontSize: '13.5px',
    color: '#64748b',
  },
  link: {
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
  infoBox: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
};

export default Register;