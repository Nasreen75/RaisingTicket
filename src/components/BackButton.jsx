import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BackButton = ({ fallbackPath = '/dashboard', customLabel }) => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const handleBack = () => {
    // If there is history, navigate(-1), otherwise go to fallbackPath
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const label = customLabel || (lang === 'te' ? '← వెనుకకు వెళ్ళండి' : '← Back');

  return (
    <button
      onClick={handleBack}
      style={styles.backBtn}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f1f5f9';
        e.currentTarget.style.borderColor = '#94a3b8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ffffff';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      title="Go back to previous page"
    >
      <span style={{ fontSize: '15px' }}>{label}</span>
    </button>
  );
};

const styles = {
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#ffffff',
    color: '#1e293b',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.15s ease',
  },
};

export default BackButton;

