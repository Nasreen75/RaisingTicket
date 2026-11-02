import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

const ZONE_FILTERS = [
  { id: 'all', label: 'All Campus Zones' },
  { id: 'critical', label: '⚠️ Bottlenecks Only' },
  { id: 'academic', label: '🎓 Academic Blocks' },
  { id: 'hostel_facility', label: '🏢 Hostels & Facilities' }
];

const CampusHeatmap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/complaints/campus/heatmap');
      setHeatmapData(res.data);
      setLastUpdated(new Date());

      // Auto-select the zone with highest load or first zone
      if (res.data?.zones?.length > 0) {
        const sorted = [...res.data.zones].sort((a, b) => b.activeComplaints - a.activeComplaints);
        setSelectedZone((prev) => prev ? res.data.zones.find(z => z.id === prev.id) || sorted[0] : sorted[0]);
      }
    } catch (err) {
      console.error('Heatmap fetch error:', err);
      setError('Unable to load live campus radar telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
    // Auto-refresh heatmap every 45 seconds for live real-time simulation
    const interval = setInterval(fetchHeatmap, 45000);
    return () => clearInterval(interval);
  }, []);

  const zones = heatmapData?.zones || [];

  const filteredZones = zones.filter((zone) => {
    if (activeFilter === 'critical') return zone.statusColor === 'red' || zone.statusColor === 'yellow';
    if (activeFilter === 'academic') return ['cse_it', 'ece_eee', 'mech_civil', 'admin_block'].includes(zone.id);
    if (activeFilter === 'hostel_facility') return ['boys_hostel', 'girls_hostel', 'canteen', 'library', 'transport'].includes(zone.id);
    return true;
  });

  const criticalCount = zones.filter((z) => z.statusColor === 'red').length;
  const moderateCount = zones.filter((z) => z.statusColor === 'yellow').length;
  const optimalCount = zones.filter((z) => z.statusColor === 'green').length;

  const getStatusStyles = (color) => {
    switch (color) {
      case 'red':
        return {
          bg: '#fef2f2',
          border: '#f87171',
          accent: '#dc2626',
          text: '#991b1b',
          glow: '0 0 15px rgba(220, 38, 38, 0.25)',
          pillBg: '#fee2e2',
          dot: '#ef4444'
        };
      case 'yellow':
        return {
          bg: '#fffbeb',
          border: '#fcd34d',
          accent: '#d97706',
          text: '#92400e',
          glow: '0 0 15px rgba(217, 119, 6, 0.2)',
          pillBg: '#fef3c7',
          dot: '#f59e0b'
        };
      case 'green':
      default:
        return {
          bg: '#f0fdf4',
          border: '#86efac',
          accent: '#16a34a',
          text: '#166534',
          glow: '0 0 10px rgba(22, 163, 74, 0.15)',
          pillBg: '#dcfce7',
          dot: '#22c55e'
        };
    }
  };

  const handleZoneInvestigate = (zone) => {
    if (user?.role === 'admin' || user?.role === 'hod') {
      navigate(`/admin/complaints?search=${encodeURIComponent(zone.deptKeyword)}`);
    } else {
      navigate('/raise-complaint');
    }
  };

  return (
    <div style={styles.card}>
      {/* Heatmap Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={styles.liveBadge}>
              <span style={styles.pulseDot}></span> LIVE TELEMETRY
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Refreshed: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <h2 style={styles.title}>🗺️ Interactive Live Campus Heatmap</h2>
          <p style={styles.subtitle}>
            Real-time infrastructure load radar across MITS campus zones, academic blocks, and resident facilities.
          </p>
        </div>

        <button
          onClick={fetchHeatmap}
          disabled={loading}
          style={styles.refreshBtn}
          title="Refresh Campus Heatmap"
        >
          🔄 {loading ? 'Scanning...' : 'Scan Radar'}
        </button>
      </div>

      {/* Campus Telemetry Metric Pills */}
      <div style={styles.metricRow}>
        <div style={{ ...styles.metricPill, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active In Campus</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            {heatmapData?.totalActiveCampus || 0} Issues
          </span>
        </div>
        <div style={{ ...styles.metricPill, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>🟢 Optimal Zones</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#166534' }}>
            {optimalCount} of {zones.length}
          </span>
        </div>
        <div style={{ ...styles.metricPill, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700', textTransform: 'uppercase' }}>🟡 Moderate Load</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#92400e' }}>
            {moderateCount}
          </span>
        </div>
        <div style={{ ...styles.metricPill, background: '#fef2f2', border: '1px solid #fecaca' }}>
          <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700', textTransform: 'uppercase' }}>🔴 Bottlenecks</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>
            {criticalCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterBar}>
        {ZONE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            style={{
              ...styles.filterBtn,
              background: activeFilter === f.id ? '#1e293b' : '#f1f5f9',
              color: activeFilter === f.id ? '#ffffff' : '#475569',
              fontWeight: activeFilter === f.id ? '700' : '500',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>
      )}

      {/* 9-Zone Interactive Campus Grid */}
      <div style={styles.grid}>
        {filteredZones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          const styleConfig = getStatusStyles(zone.statusColor);

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              style={{
                ...styles.zoneCard,
                background: isSelected ? '#ffffff' : styleConfig.bg,
                borderColor: isSelected ? '#0284c7' : styleConfig.border,
                boxShadow: isSelected
                  ? '0 0 0 3px rgba(2, 132, 199, 0.25), 0 8px 16px rgba(0,0,0,0.06)'
                  : styleConfig.glow,
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={styles.zoneCardTop}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.zoneIcon}>{zone.icon}</span>
                  <div>
                    <h4 style={styles.zoneName}>{zone.name}</h4>
                    <span style={styles.floorBadge}>🏢 {zone.floorCount} Floors</span>
                  </div>
                </div>

                {/* Status Dot */}
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: styleConfig.dot,
                    display: 'inline-block',
                    boxShadow: `0 0 8px ${styleConfig.dot}`,
                  }}
                />
              </div>

              <div style={styles.zoneCardBottom}>
                <span
                  style={{
                    ...styles.statusPill,
                    background: styleConfig.pillBg,
                    color: styleConfig.text,
                    borderColor: styleConfig.border,
                  }}
                >
                  {zone.statusLabel}
                </span>

                <div style={styles.issueCount}>
                  <strong style={{ fontSize: '15px', color: styleConfig.accent }}>
                    {zone.activeComplaints}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Zone Inspector Drilldown */}
      {selectedZone && (
        <div style={styles.inspectorCard}>
          <div style={styles.inspectorHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{selectedZone.icon}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    {selectedZone.name}
                  </h3>
                  <span
                    style={{
                      ...styles.statusPill,
                      background: getStatusStyles(selectedZone.statusColor).pillBg,
                      color: getStatusStyles(selectedZone.statusColor).text,
                      borderColor: getStatusStyles(selectedZone.statusColor).border,
                    }}
                  >
                    {selectedZone.statusLabel}
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  Coverage Area: Department &amp; Physical Infrastructure Nodes ({selectedZone.floorCount} Floors)
                </p>
              </div>
            </div>

            <button
              onClick={() => handleZoneInvestigate(selectedZone)}
              style={styles.investigateBtn}
            >
              {user?.role === 'admin' || user?.role === 'hod'
                ? '🔍 Filter Zone Tickets'
                : '✍️ Report Issue Here'}
            </button>
          </div>

          <div style={styles.inspectorContent}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              Recent Active Tickets in {selectedZone.name} ({selectedZone.activeComplaints} Total):
            </div>

            {selectedZone.recentIssues && selectedZone.recentIssues.length > 0 ? (
              <div style={styles.recentIssueList}>
                {selectedZone.recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => navigate(`/complaints/${issue.id}`)}
                    style={styles.recentIssueItem}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.issueIdBadge}>#{issue.id}</span>
                      <span style={styles.issueTitle}>{issue.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={styles.issueCategoryBadge}>{issue.category}</span>
                      <span style={styles.viewLink}>Inspect →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.cleanZoneBox}>
                <span>✨</span>
                <span>All infrastructure facilities operating normally with zero active complaints in this zone.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend & College Campus Notice */}
      <div style={styles.footerLegend}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
            <span>0-1 Tickets: Optimal Condition</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <span>2-3 Tickets: Moderate Load</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span>4+ Tickets: Critical Bottleneck</span>
          </div>
        </div>

        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
          Automated Facility Monitoring Grid • Madanapalle Institute of Technology &amp; Science
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
    margin: '24px 0',
    fontFamily: theme.font.family,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fee2e2',
    color: '#b91c1c',
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '12px',
    letterSpacing: '0.5px',
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#dc2626',
    display: 'inline-block',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '4px 0 2px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.4',
  },
  refreshBtn: {
    background: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    color: '#334155',
    fontWeight: '700',
    fontSize: '12.5px',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  metricRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    marginBottom: '18px',
  },
  metricPill: {
    padding: '10px 14px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  filterBtn: {
    border: 'none',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorBox: {
    background: '#fef2f2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '14px',
    border: '1px solid #fecaca',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  zoneCard: {
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '105px',
  },
  zoneCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  zoneIcon: {
    fontSize: '22px',
  },
  zoneName: {
    margin: 0,
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.25',
  },
  floorBadge: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
    marginTop: '2px',
    display: 'inline-block',
  },
  zoneCardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '8px',
    borderTop: '1px dashed rgba(0,0,0,0.06)',
  },
  statusPill: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid',
  },
  issueCount: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '3px',
  },
  inspectorCard: {
    background: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '14px',
    padding: '18px 20px',
    marginTop: '6px',
    marginBottom: '18px',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
  },
  inspectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '14px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '14px',
  },
  investigateBtn: {
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  inspectorContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  recentIssueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  recentIssueItem: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  },
  issueIdBadge: {
    fontSize: '11.5px',
    fontWeight: '800',
    color: '#c1121f',
    background: '#fee2e2',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  issueTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  issueCategoryBadge: {
    fontSize: '11px',
    background: '#f1f5f9',
    color: '#475569',
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'capitalize',
  },
  viewLink: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#2563eb',
  },
  cleanZoneBox: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  footerLegend: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  },
};

export default CampusHeatmap;

