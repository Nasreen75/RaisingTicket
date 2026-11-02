import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import theme from '../theme';

const faqData = [
  {
    category: 'Hostel & Living',
    items: [
      {
        q: 'How do I request a hostel room maintenance repair (plumbing, lights, fan)?',
        a: 'You can raise a ticket directly under the "Hostel" or "Maintenance" category on this CampusCare portal. The hostel warden and electricians/plumbers are notified immediately.',
      },
      {
        q: 'What is the procedure for weekend or out-of-station leave permission?',
        a: 'Submit an online out-pass request through your student portal at least 24 hours in advance with parent acknowledgment. The warden reviews and approves before departure.',
      },
      {
        q: 'Where do I complain about hostel mess food quality or hygiene?',
        a: 'Raise a ticket under the "Canteen / Mess" category. The Canteen Manager and Student Food Committee inspect the mess within 24 hours of reporting.',
      },
    ],
  },
  {
    category: 'IT & Wi-Fi Network',
    items: [
      {
        q: 'How do I connect to the campus high-speed Wi-Fi network?',
        a: 'Select "MITS-Student" Wi-Fi and log in using your college Roll Number and campus password on the captive portal page. If login fails, raise an IT/Technical ticket.',
      },
      {
        q: 'What should I do if my college email or portal password is locked?',
        a: 'Visit the IT Technical Helpdesk in the Administrative Block (Ground Floor) or raise a ticket under "IT / Technical" with your Roll Number and Alternate Email for instant reset.',
      },
      {
        q: 'Can students access licensed software (MATLAB, AutoCAD, Visual Studio) on personal laptops?',
        a: 'Yes, campus licenses are available via the MITS Software Portal. Connect to campus network and download via the student software repository.',
      },
    ],
  },
  {
    category: 'Fee & Scholarships',
    items: [
      {
        q: 'How do I get an official receipt for college tuition or hostel fees paid online?',
        a: 'Log in to the student fee portal. Receipts are generated within 2 hours of payment confirmation. If payment was deducted but receipt not issued, raise a ticket under "Fee / Accounts".',
      },
      {
        q: 'Where do I submit government scholarship (JVD / NSP) verification documents?',
        a: 'Visit the Scholarship Section in the Administrative block Counter 3 with original aadhaar and allotment letters, or raise a Fee/Scholarship inquiry ticket.',
      },
    ],
  },
  {
    category: 'Library & Digital Resources',
    items: [
      {
        q: 'How many books can a student borrow and for how long?',
        a: 'Undergraduates can borrow up to 4 books for 14 days; Postgraduates (MCA/MBA/M.Tech) can borrow up to 6 books for 21 days. Books can be renewed online once.',
      },
      {
        q: 'How do I access IEEE, Springer, and digital journals from home?',
        a: 'Use the remote access proxy provided by the Central Library using your college email credentials.',
      },
    ],
  },
  {
    category: 'Transport & Bus Services',
    items: [
      {
        q: 'How do I renew my college bus pass or change my pickup stop?',
        a: 'Visit the Transport Office Counter with your semester fee challan, or submit a request under the "Transport" category on CampusCare.',
      },
      {
        q: 'What should I do if I forget a belonging (bag, ID card) on the college bus?',
        a: 'Immediately contact the Transport Incharge or raise an Urgent ticket under "Transport" specifying the Bus Number and route.',
      },
    ],
  },
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const filteredCategories = faqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.container}>
          <BackButton fallbackPath="/dashboard" />
          {/* Header Banner */}
          <div style={styles.headerCard}>
            <h1 style={styles.title}>📖 Campus Knowledge Base &amp; FAQ</h1>
            <p style={styles.subtitle}>
              Find instant solutions to frequently asked campus questions before submitting a ticket.
            </p>

            <div style={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search solutions (e.g. Wi-Fi, hostel leave, fee receipt, bus stop)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={styles.clearBtn}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Ticket Action */}
          <div style={styles.actionBanner}>
            <div>
              <strong style={{ fontSize: '15px', color: '#1f2937' }}>Didn't find what you were looking for?</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                Our staff and department heads are ready to help resolve your issue.
              </p>
            </div>
            <button onClick={() => navigate('/raise-complaint')} style={styles.raiseBtn}>
              + Raise a Ticket
            </button>
          </div>

          {/* FAQ Accordion List */}
          {filteredCategories.length === 0 ? (
            <div style={styles.empty}>
              No answers matched your search query. Try different keywords or{' '}
              <span
                onClick={() => navigate('/raise-complaint')}
                style={{ color: '#c1121f', cursor: 'pointer', fontWeight: 'bold' }}
              >
                raise a new ticket
              </span>
              .
            </div>
          ) : (
            filteredCategories.map((cat, cIdx) => (
              <div key={cIdx} style={styles.categorySection}>
                <h3 style={styles.categoryHeading}>{cat.category}</h3>
                <div style={styles.itemList}>
                  {cat.items.map((item, iIdx) => {
                    const uniqueId = `${cIdx}-${iIdx}`;
                    const isOpen = openIndex === uniqueId;
                    return (
                      <div key={iIdx} style={styles.itemCard}>
                        <div style={styles.questionRow} onClick={() => toggleItem(uniqueId)}>
                          <span style={styles.questionText}>❓ {item.q}</span>
                          <span style={{ fontSize: '18px', color: '#6b7280' }}>
                            {isOpen ? '▲' : '▼'}
                          </span>
                        </div>
                        {isOpen && (
                          <div style={styles.answerRow}>
                            <p style={styles.answerText}>{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: theme.colors.background,
    minHeight: 'calc(100vh - 60px)',
    padding: '2rem 1rem',
    fontFamily: theme.font.family,
  },
  container: { maxWidth: '800px', margin: '0 auto' },
  headerCard: {
    background: '#fff',
    borderRadius: theme.radius.lg,
    padding: '28px 24px',
    boxShadow: theme.shadow.sm,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: { fontSize: '26px', fontWeight: '800', color: theme.colors.text, margin: '0 0 6px' },
  subtitle: { fontSize: '14px', color: theme.colors.textMuted, margin: '0 0 20px' },
  searchWrapper: {
    position: 'relative',
    maxWidth: '540px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '12px 18px',
    fontSize: '14px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  clearBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '13px',
  },
  actionBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    padding: '16px 20px',
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  raiseBtn: {
    background: theme.colors.primary,
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: theme.radius.sm,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  categorySection: { marginBottom: '24px' },
  categoryHeading: {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0 0 10px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '6px',
  },
  itemList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  itemCard: {
    background: '#fff',
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
    overflow: 'hidden',
  },
  questionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    cursor: 'pointer',
    background: '#fff',
    transition: 'background 0.15s',
  },
  questionText: { fontSize: '15px', fontWeight: '600', color: '#1f2937' },
  answerRow: {
    padding: '0 18px 16px',
    background: '#f9fafb',
    borderTop: '1px solid #f3f4f6',
  },
  answerText: { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '12px 0 0' },
  empty: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: theme.radius.md,
    textAlign: 'center',
    color: theme.colors.textMuted,
    border: `1px dashed ${theme.colors.border}`,
  },
};

export default FAQ;

