import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

const categories = [
  { value: 'hostel', label: 'Hostel' },
  { value: 'academic', label: 'Academic' },
  { value: 'transport', label: 'Transport' },
  { value: 'it_technical', label: 'IT / Technical' },
  { value: 'library', label: 'Library' },
  { value: 'fee', label: 'Fee / Accounts / Scholarship' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'canteen', label: 'Canteen / Mess' },
  { value: 'civil', label: 'Civil Engineering' },
  { value: 'ece', label: 'ECE' },
  { value: 'eee', label: 'EEE' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'mba', label: 'MBA' },
  { value: 'mca', label: 'MCA' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'other', label: 'Other' },
];

export const HIERARCHY_ROLES = [
  { value: 'mentor', label: '👨‍🏫 Faculty Mentor / Class Advisor (1st Level of Contact)' },
  { value: 'aao', label: '🏢 AAO - Academic & Administrative Officer (2nd Level of Contact)' },
  { value: 'hod', label: '🏛️ Head of Department - HOD (3rd Level of Contact)' },
  { value: 'warden', label: '🛏️ Hostel Warden / Resident Incharge' },
  { value: 'lab_incharge', label: '💻 Lab Incharge / System Administrator' },
  { value: 'not_contacted', label: '⚠️ Not Contacted Anyone Yet (Direct Online Ticket)' },
];

const RaiseComplaint = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Multi-step hierarchy verification state
  const [step, setStep] = useState(1);
  const [hierarchyData, setHierarchyData] = useState({
    prior_contact_role: 'mentor',
    prior_contact_name: '',
    prior_contact_response: '',
  });
  const [hierarchyError, setHierarchyError] = useState('');

  // Read QR-Code pre-tagged parameters from URL if present
  const qrLocation = searchParams.get('loc') || searchParams.get('location') || '';
  const qrCategory = searchParams.get('cat') || searchParams.get('category') || '';
  const qrTitle = searchParams.get('title') || '';

  const initialCategory = qrCategory || location.state?.prefillCategory || 'hostel';
  const initialTitle = qrTitle || location.state?.prefillTitle || '';
  const initialLocation = qrLocation || location.state?.prefillLocation || '';

  const [formData, setFormData] = useState({
    title: initialTitle,
    description: '',
    category: initialCategory,
    priority: 'medium',
    location: initialLocation,
    attachment_url: '',
    is_anonymous: false,
    sentiment_score: 'neutral',
  });

  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);

  const navigate = useNavigate();

  const handleHierarchyChange = (e) => {
    const { name, value } = e.target;
    setHierarchyData((prev) => ({ ...prev, [name]: value }));
    setHierarchyError('');
  };

  const handleProceedToTicketForm = (e) => {
    e.preventDefault();
    setHierarchyError('');

    if (hierarchyData.prior_contact_role !== 'not_contacted') {
      if (!hierarchyData.prior_contact_name.trim()) {
        setHierarchyError('Please enter the Name or Staff ID of the Mentor / AAO / Staff member you contacted.');
        return;
      }
      if (!hierarchyData.prior_contact_response.trim()) {
        setHierarchyError('Please describe their response or what happened when you approached them.');
        return;
      }
    } else {
      if (!hierarchyData.prior_contact_response.trim()) {
        setHierarchyError('Please provide a brief reason for raising a direct portal ticket (e.g. campus facility breakdown, emergency, or outside college hours).');
        return;
      }
    }

    setStep(2);
  };

  // Trigger NLP Auto-Categorization, Priority, & Sentiment Prediction when user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      if ((formData.title.trim().length > 3 || formData.description.trim().length > 10)) {
        try {
          setAnalyzingAi(true);
          const res = await api.post('/ai/classify', {
            title: formData.title,
            description: formData.description
          });
          if (res.data && res.data.category) {
            setAiSuggestion(res.data);
            if (res.data.isSensitiveTopic) {
              setFormData((prev) => ({ ...prev, is_anonymous: true }));
            }
            setFormData((prev) => ({ ...prev, sentiment_score: res.data.sentiment || 'neutral' }));
          }
        } catch (err) {
          console.error('NLP classify failed:', err);
        } finally {
          setAnalyzingAi(false);
        }
      }
    }, 550);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description]);

  const applyAiPrediction = () => {
    if (!aiSuggestion) return;
    setFormData((prev) => ({
      ...prev,
      category: aiSuggestion.category,
      priority: aiSuggestion.priority,
      sentiment_score: aiSuggestion.sentiment || 'neutral',
      is_anonymous: aiSuggestion.isSensitiveTopic ? true : prev.is_anonymous,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, attachment_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFileName('');
    setFormData((prev) => ({ ...prev, attachment_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        prior_contact_role: hierarchyData.prior_contact_role,
        prior_contact_name: hierarchyData.prior_contact_name,
        prior_contact_response: hierarchyData.prior_contact_response,
      };
      const res = await api.post('/complaints', payload);
      const ticketId = res.data?.complaint?.id ? `#${res.data.complaint.id}` : '';
      const tokenNo = res.data?.complaint?.token_number || '';
      setSuccess(`Ticket ${ticketId} ${tokenNo ? `(${tokenNo})` : ''} registered successfully! Auto-routed to department queue.${formData.location ? ` Tagged: ${formData.location}.` : ''}`);
      setTimeout(() => navigate('/my-complaints'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = '#c1121f';
    e.target.style.boxShadow = '0 0 0 3px rgba(193,18,31,0.12)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <BackButton fallbackPath="/dashboard" />
          {/* Stepper Header */}
          <div style={styles.stepperContainer}>
            <div
              style={step === 1 ? styles.stepperStepActive : styles.stepperStepCompleted}
              onClick={() => step === 2 && setStep(1)}
              role="button"
              tabIndex={0}
            >
              <span style={styles.stepNumberBadge}>{step > 1 ? '✓' : '1'}</span>
              <span>Prior Hierarchy Check</span>
            </div>
            <div style={styles.stepperDivider} />
            <div style={step === 2 ? styles.stepperStepActive : styles.stepperStepInactive}>
              <span style={styles.stepNumberBadge}>2</span>
              <span>Complaint Details</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem', gap: '8px' }}>
            <div>
              <h2 style={styles.heading}>
                {step === 1 ? '🏛️ College Redressal Hierarchy Check' : `📝 ${t('raiseComplaint')}`}
              </h2>
              <p style={styles.subheading}>
                {step === 1
                  ? 'Verify prior communication with Mentor, AAO, or HOD before lodging formal administrative ticket.'
                  : 'Report your campus grievance — routed to department technicians in sequential queue.'}
              </p>
            </div>
            <div style={styles.slaBadge}>
              🎫 Fair Sequential Queue (FIFO)
            </div>
          </div>

          {step === 1 ? (
            /* STEP 1: HIERARCHY PRE-VERIFICATION FORM */
            <div style={styles.form}>
              <div style={styles.policyNoticeBox}>
                <span style={{ fontSize: '28px' }}>🏛️</span>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1e3a8a', fontWeight: '800' }}>
                    Institutional Grievance Redressal Hierarchy Protocol
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#1e40af', lineHeight: '1.45' }}>
                    As per college administration policy, students should first approach their direct departmental authorities (Faculty Mentor, AAO, or HOD) for quick resolution. If they did not respond, or advised you to raise an official ticket, complete the check below to proceed.
                  </p>
                </div>
              </div>

              {hierarchyError && <div style={styles.errorBox}>{hierarchyError}</div>}

              <form onSubmit={handleProceedToTicketForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={styles.label}>
                    1. Who did you contact first in the college hierarchy? <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="prior_contact_role"
                    value={hierarchyData.prior_contact_role}
                    onChange={handleHierarchyChange}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                    style={styles.input}
                  >
                    {HIERARCHY_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {hierarchyData.prior_contact_role !== 'not_contacted' ? (
                  <>
                    <div>
                      <label style={styles.label}>
                        2. Name or Staff ID of the Mentor / AAO / Person Contacted <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        name="prior_contact_name"
                        placeholder="e.g. Dr. K. Ramesh (Mentor) / AAO Academic Office / Prof. S. Sharma"
                        value={hierarchyData.prior_contact_name}
                        onChange={handleHierarchyChange}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                        required
                        style={styles.input}
                      />
                    </div>

                    <div>
                      <label style={styles.label}>
                        3. What was their response? (Reason for raising formal portal ticket) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        name="prior_contact_response"
                        placeholder="e.g. Informed 3 days ago, no action taken / Staff verified and asked to log formal ticket on portal / No response received"
                        value={hierarchyData.prior_contact_response}
                        onChange={handleHierarchyChange}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                        required
                        rows={3}
                        style={{ ...styles.input, resize: 'vertical' }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '12.5px',
                      color: '#92400e'
                    }}>
                      <span style={{ fontSize: '18px' }}>💡</span>
                      <div>
                        <strong>Advisory:</strong> For quick routine classroom or academic issues, speaking directly with your Faculty Mentor or AAO is often resolved within minutes. If this is a campus infrastructure breakdown (water, electricity, lab system, hostel), you may proceed directly.
                      </div>
                    </div>

                    <div>
                      <label style={styles.label}>
                        Reason for direct portal ticket submission <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        name="prior_contact_response"
                        placeholder="e.g. Urgent broken water pipe in hostel / Emergency projector repair before semester lab exam / Outside college hours"
                        value={hierarchyData.prior_contact_response}
                        onChange={handleHierarchyChange}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                        required
                        rows={3}
                        style={{ ...styles.input, resize: 'vertical' }}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  style={styles.proceedBtn}
                  onMouseEnter={(e) => (e.target.style.background = '#172554')}
                  onMouseLeave={(e) => (e.target.style.background = '#1e3a8a')}
                >
                  Proceed to Raise Ticket ➔
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: FORMAL COMPLAINT FORM */
            <>
              {/* Prior Contact Summary Card */}
              <div style={styles.hierarchySummaryBanner}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ✓ Step 1 Verified: Prior College Hierarchy Redressal
                    </span>
                    <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700', marginTop: '2px' }}>
                      {HIERARCHY_ROLES.find(r => r.value === hierarchyData.prior_contact_role)?.label.split('(')[0].trim()}
                      {hierarchyData.prior_contact_name && ` • Staff: ${hierarchyData.prior_contact_name}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                      "{hierarchyData.prior_contact_response}"
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={styles.changeHierarchyBtn}
                  >
                    ✏️ Change Hierarchy Info
                  </button>
                </div>
              </div>

              {/* QR Code Location Tagged Banner */}
              {formData.location && (
                <div style={styles.qrBanner}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>📍</span>
                    <div>
                      <strong style={{ color: '#065f46', fontSize: '14px' }}>
                        {t('qrDetectedBanner')} <span style={{ textDecoration: 'underline' }}>{formData.location}</span>
                      </strong>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#047857' }}>
                        {t('qrLockedDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            {/* AI Smart Suggestion & Sentiment Banner */}
            {aiSuggestion && (
              <div style={styles.aiBanner}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>✨</span>
                  <div>
                    <strong style={{ color: '#1e3a8a', fontSize: '13px' }}>AI Prediction &amp; Sentiment Analysis:</strong>
                    <div style={{ fontSize: '12px', color: '#1e40af', marginTop: '2px' }}>
                      Suggested Category: <strong>{aiSuggestion.category.toUpperCase()}</strong> | Predicted Urgency: <strong style={{ textTransform: 'uppercase' }}>{aiSuggestion.priority}</strong> (SLA: {aiSuggestion.slaHours}h)
                    </div>
                    {aiSuggestion.sentiment === 'frustrated' && (
                      <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700', marginTop: '3px' }}>
                        {t('sentimentFrustrated')}
                      </div>
                    )}
                    {aiSuggestion.isSensitiveTopic && (
                      <div style={{ fontSize: '11px', color: '#9333ea', fontWeight: '700', marginTop: '2px' }}>
                        🛡️ Sensitive topic detected: Anonymous complaint mode strongly advised.
                      </div>
                    )}
                  </div>
                </div>
                {(formData.category !== aiSuggestion.category || formData.priority !== aiSuggestion.priority) && (
                  <button
                    type="button"
                    onClick={applyAiPrediction}
                    style={styles.applyAiBtn}
                  >
                    Apply AI Auto-Fill
                  </button>
                )}
              </div>
            )}

            {/* Anonymous Complaint Checkbox Option */}
            <div style={styles.anonymousBox}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                    {t('anonymousLabel')}
                  </span>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280' }}>
                    {t('anonymousDesc')}
                  </p>
                </div>
              </label>
            </div>

            <label style={styles.label}>{t('title')}</label>
            <input
              name="title"
              placeholder="Brief title (e.g. Wi-Fi down in MCA Lab 2 or Projector not working)"
              value={formData.title}
              onChange={handleChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
              required
              style={styles.input}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={styles.label}>{t('category')}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  style={styles.input}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>{t('location')}</label>
                <input
                  name="location"
                  placeholder="e.g. CSE Block - Lab 3 / Room 102"
                  value={formData.location}
                  onChange={handleChange}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                  style={{ ...styles.input, background: formData.location ? '#f0fdf4' : '#fff' }}
                />
              </div>
            </div>

            {/* Fair Queue Policy Notice */}
            <div style={{
              margin: '12px 0 16px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>🎫</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1' }}>
                  Fair Sequential Queue (First-In, First-Out)
                </div>
                <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px', lineHeight: '1.4' }}>
                  Tickets receive a sequential Token ID and are attended strictly in order of submission by department technicians.
                </div>
              </div>
            </div>

            <label style={styles.label}>{t('description')}</label>
            <textarea
              name="description"
              placeholder="Describe your issue in detail (equipment involved, specific problem)..."
              value={formData.description}
              onChange={handleChange}
              onFocus={focusStyle}
              onBlur={blurStyle}
              required
              rows={4}
              style={{ ...styles.input, resize: 'vertical' }}
            />

            {/* Photo / Attachment Upload */}
            <label style={styles.label}>Attachment / Photo Proof (Optional)</label>
            <div style={styles.uploadBox}>
              <input
                type="file"
                id="file-upload"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={styles.uploadBtn}>
                📷 Choose Photo / Document
              </label>
              {fileName && (
                <div style={styles.fileInfo}>
                  <span style={styles.fileName}>📎 {fileName}</span>
                  <button type="button" onClick={handleRemoveFile} style={styles.removeBtn}>✕ Remove</button>
                </div>
              )}
            </div>

            {formData.attachment_url && formData.attachment_url.startsWith('data:image') && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px' }}>Photo Preview:</p>
                <img
                  src={formData.attachment_url}
                  alt="Attachment Preview"
                  style={styles.previewImage}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={loading ? styles.submitBtnDisabled : styles.submitBtn}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#9e0e19')}
              onMouseLeave={(e) => !loading && (e.target.style.background = '#c1121f')}
            >
              {loading ? 'Submitting & Routing...' : `🚀 ${t('submit')}`}
            </button>
          </form>
        </>
      )}
    </div>
  </div>
</div>
);
};

const styles = {
  page: { background: '#f8fafc', minHeight: 'calc(100vh - 60px)', padding: '2.5rem 1rem' },
  container: { maxWidth: '780px', margin: '0 auto' },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1.25rem',
    background: '#ffffff',
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  stepperStepActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '800',
    border: '1.5px solid #bfdbfe',
  },
  stepperStepCompleted: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f0fdf4',
    color: '#166534',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    border: '1px solid #bbf7d0',
  },
  stepperStepInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#94a3b8',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  stepNumberBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '900',
    background: 'currentColor',
    color: '#ffffff',
  },
  stepperDivider: {
    flex: 1,
    height: '2px',
    background: '#e2e8f0',
  },
  policyNoticeBox: {
    background: '#eff6ff',
    border: '1.5px solid #bfdbfe',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '0.5rem',
  },
  proceedBtn: {
    background: '#1e3a8a',
    color: '#ffffff',
    border: 'none',
    padding: '13px 22px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '0.75rem',
    boxShadow: '0 4px 12px rgba(30,58,138,0.25)',
    transition: 'background 0.2s ease',
  },
  hierarchySummaryBanner: {
    background: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '12px',
    padding: '12px 18px',
    marginBottom: '1rem',
  },
  changeHierarchyBtn: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#1e293b',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  heading: { fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' },
  subheading: { fontSize: '15px', color: '#475569', margin: 0, fontWeight: '500' },
  slaBadge: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1.5px solid #a7f3d0',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '800'
  },
  qrBanner: {
    background: '#ecfdf5',
    border: '2px solid #34d399',
    borderRadius: '14px',
    padding: '14px 18px',
    marginBottom: '1.25rem',
    boxShadow: '0 4px 12px rgba(16,185,129,0.12)',
  },
  aiBanner: {
    background: '#eff6ff',
    border: '1.5px solid #93c5fd',
    borderRadius: '14px',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '10px'
  },
  applyAiBtn: {
    background: '#1d4ed8',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(29,78,216,0.3)',
  },
  anonymousBox: {
    background: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '8px',
  },
  form: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '2.25rem 2rem',
    boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
    border: '1.5px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  label: { fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '3px', display: 'block', letterSpacing: '0.2px' },
  input: {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14.5px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#fff',
  },
  uploadBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    padding: '14px 18px',
    background: '#f8fafc',
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
  },
  uploadBtn: {
    background: '#1f2937',
    color: '#ffffff',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-block',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fileName: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '2px 6px',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '180px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    objectFit: 'contain',
    display: 'block',
  },
  submitBtn: {
    background: '#c1121f',
    color: '#ffffff',
    border: 'none',
    padding: '13px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    marginTop: '0.5rem',
    boxShadow: '0 4px 12px rgba(193,18,31,0.25)',
  },
  submitBtnDisabled: {
    background: '#e5e7eb',
    color: '#9ca3af',
    border: 'none',
    padding: '13px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '0.5rem',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #fecaca',
  },
  successBox: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    border: '1px solid #bbf7d0',
  },
};

export default RaiseComplaint;
