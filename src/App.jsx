import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  ChartBarHorizontal, Users, IdentificationCard, ShieldCheck,
  Trash, Gear, Trophy, Plus, X, CheckCircle, XCircle, SignOut,
  Leaf, HandHeart, Money, WarningCircle, DotsThree, Pencil,
  House, ClipboardText, FileArrowDown
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import axiosClient from './api/axiosClient';
import { useAuthStore } from './store/useAuthStore';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Spinner, DownloadSimple } from '@phosphor-icons/react';
import ImageCapture from './components/ImageCapture';
import './i18n';

/* ─────────────────────────────────────────
   Language Toggle (persists choice)
───────────────────────────────────────── */
const LangToggle = () => {
  const { i18n } = useTranslation();
  const toggle = (l) => {
    i18n.changeLanguage(l);
    localStorage.setItem('pbl_lang', l);
    document.body.setAttribute('lang', l);
  };
  useEffect(() => { document.body.setAttribute('lang', i18n.language); }, [i18n.language]);
  return (
    <div className="lang-toggle">
      {['en','bn'].map(l => (
        <button key={l} className={`lang-btn ${i18n.language === l ? 'active' : ''}`} onClick={() => toggle(l)}>
          {l === 'en' ? 'EN' : 'বাং'}
        </button>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */
// Owner sees all 6. Employee sees only Dashboard + Members.
// We split: 2 primary items + everything else in "More" drawer.
const OWNER_PRIMARY = [
  { to: '/',          icon: ChartBarHorizontal, key: 'dashboard'  },
  { to: '/approvals', icon: ShieldCheck,         key: 'approvals'  },
];
const OWNER_MORE = [
  { to: '/members',    icon: Users,              key: 'members'     },
  { to: '/employees',  icon: IdentificationCard, key: 'employees'   },
  { to: '/survey-results', icon: ClipboardText,   key: 'survey_dashboard' },
  { to: '/leaderboard',icon: Trophy,             key: 'leaderboard' },
  { to: '/settings',   icon: Gear,               key: 'settings'    },
  { to: '/requests',   icon: HandHeart,          key: 'edit_requests'},
  { to: '/profile',    icon: IdentificationCard, key: 'my_profile'  },
];
const EMPLOYEE_PRIMARY = [
  { to: '/survey', icon: ClipboardText,      key: 'collect_data' },
  { to: '/survey-results', icon: ClipboardText, key: 'survey_dashboard' },
];
const EMPLOYEE_MORE = [
  { to: '/members',icon: Users,              key: 'members'   },
  { to: '/profile', icon: IdentificationCard, key: 'my_profile' },
];

const ALL_SIDEBAR_NAV = [...OWNER_PRIMARY, ...OWNER_MORE];

/* ─────────────────────────────────────────
   SIDEBAR (Desktop ≥768px)
───────────────────────────────────────── */
const Sidebar = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const navItems = user?.role === 'owner' ? ALL_SIDEBAR_NAV : [...EMPLOYEE_PRIMARY, ...EMPLOYEE_MORE];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:20 }}>
        <img src="/logo.png" alt="PBL Sheba" style={{ width:36, height:36, borderRadius:8 }} />
        <div style={{ display:'flex', flexDirection:'column' }}>
          <h2 style={{ fontSize:'1.1rem', margin:0, fontWeight:900, letterSpacing:'-0.02em' }}>{t('brand_name')}</h2>
          <p style={{ fontSize:'0.75rem', margin:0, color:'var(--text-muted)', fontWeight:500 }}>{t('brand_tagline')}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, key }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={20} weight="duotone" />
            {t(key)}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <LangToggle />
        <div style={{ height: 12 }} />
        <button className="btn btn-outline btn-full btn-sm" onClick={logout}>
          <SignOut size={16} /> {t('sign_out')}
        </button>
      </div>
    </aside>
  );
};

/* ─────────────────────────────────────────
   TOP BAR (Mobile <768px)
───────────────────────────────────────── */
const TopBar = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  return (
    <header className="top-bar">
      <div className="top-bar-brand" style={{ display:'flex', alignItems:'center', gap:8 }}>
        <img src="/logo.png" alt="Logo" style={{ width:26, height:26, borderRadius:6 }} />
        <span style={{ fontWeight:800, fontSize:'0.95rem' }}>{t('brand_name')}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <LangToggle />
        <button className="btn btn-ghost btn-sm btn-icon" onClick={logout} title={t('sign_out')}>
          <SignOut size={18} />
        </button>
      </div>
    </header>
  );
};

/* ─────────────────────────────────────────
   BOTTOM NAV — exactly 3 grid cells
   [Dashboard] [Approvals/Members] [More •••]
   'More' opens a tray above the bar.
───────────────────────────────────────── */
const BottomNav = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const drawerRef = useRef(null);
  const isOwner = user?.role === 'owner';

  const primaryItems = isOwner ? OWNER_PRIMARY : EMPLOYEE_PRIMARY;
  const moreItems    = isOwner ? OWNER_MORE    : EMPLOYEE_MORE;

  // Close drawer on outside tap
  useEffect(() => {
    if (!moreOpen) return;
    const h = (e) => { if (drawerRef.current && !drawerRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [moreOpen]);

  return (
    <>
      {/* More Drawer — rises above the nav bar */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMoreOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.25)' }}
          />
          {/* The tray */}
          <div
            ref={drawerRef}
            style={{
              position: 'fixed',
              bottom: `calc(61px + env(safe-area-inset-bottom))`,
              left: 0, right: 0,
              background: 'white',
              borderRadius: '20px 20px 0 0',
              borderTop: '1px solid var(--border)',
              padding: '8px 12px 12px',
              zIndex: 99,
              boxShadow: '0 -6px 32px rgba(0,0,0,0.12)',
              animation: 'sheetUp 0.22s cubic-bezier(0.32,0.72,0,1) both',
            }}
          >
            <div style={{ width: 32, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 12px' }} />
            {moreItems.map(({ to, icon: Icon, key }) => (
              <NavLink
                key={to} to={to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ borderRadius: 'var(--radius-md)', marginBottom: 2 }}
              >
                <Icon size={20} weight="duotone" />
                {t(key)}
              </NavLink>
            ))}
          </div>
        </>
      )}

      {/* The bar itself — always exactly 3 grid columns */}
      <nav className="bottom-nav">
        {primaryItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} weight="duotone" />
            <span>{t(key)}</span>
          </NavLink>
        ))}
        {/* More button always occupies the 3rd cell */}
        <button
          className={`bnav-item ${moreOpen ? 'active' : ''}`}
          onClick={() => setMoreOpen(v => !v)}
        >
          <DotsThree size={22} weight="bold" />
          <span>{t('more')}</span>
        </button>
      </nav>
    </>
  );
};

/* ─────────────────────────────────────────
   MODAL — renders via Portal directly into document.body
   so it ALWAYS covers the full viewport, regardless of
   any overflow:hidden parent (like .admin-main).
───────────────────────────────────────── */
const Modal = ({ open, onClose, title, panelIcon, panelTitle, panelDesc, children, footer }) => {
  if (!open) return null;

  const content = (
    <div className="m-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="m-dialog">

        {/* Left info panel — CSS hides this below 900px */}
        <div className="m-panel">
          {panelIcon  && <div className="m-panel-icon">{panelIcon}</div>}
          {panelTitle && <h3>{panelTitle}</h3>}
          {panelDesc  && <p>{panelDesc}</p>}
        </div>

        {/* Right column — always a real flex column */}
        <div className="m-right">
          <div className="m-handle" />

          <div className="m-header">
            <h2>{title}</h2>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
              <X size={20} weight="bold" />
            </button>
          </div>

          <div className="m-body">{children}</div>

          {footer && <div className="m-footer">{footer}</div>}
        </div>

      </div>
    </div>
  );

  // Portal to body — escapes overflow:hidden on any parent
  return createPortal(content, document.body);
};

/* ─────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────── */
const Dashboard = () => {
  const { t } = useTranslation();
  const { dashboardCache, setDashboardCache } = useAuthStore();
  const [m, setM] = useState(dashboardCache || { totalMembers: 0, totalEmployees: 0, pendingApprovals: 0, totalCollected: 0 });
  
  useEffect(() => { 
    axiosClient.get('/admin/dashboard').then(r => {
      setM(r.data);
      setDashboardCache(r.data);
    }).catch(() => {}); 
  }, []);

  const cards = [
    { key: 'total_members',    value: m.totalMembers,     icon: Users,              cls: 'green'  },
    { key: 'total_employees',  value: m.totalEmployees,   icon: IdentificationCard, cls: 'blue'   },
    { key: 'pending_approvals',value: m.pendingApprovals, icon: WarningCircle,      cls: 'amber'  },
    { key: 'est_funds',        value: m.totalCollected,   icon: Money,              cls: 'purple' },
  ];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('dashboard')}</h1>
          <p className="text-muted">{t('platform_overview')}</p>
        </div>
      </div>

      <div className="metrics-grid">
        {cards.map(({ key, value, icon: Icon, cls }) => (
          <div className="metric-card" key={key}>
            <div className={`metric-card-icon ${cls}`}><Icon size={20} weight="duotone" /></div>
            <div className="metric-label">{t(key)}</div>
            <div className="metric-value">{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-xl)', padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <HandHeart size={32} color="var(--green-700)" weight="duotone" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontWeight: 700, color: 'var(--green-800)', marginBottom: 4 }}>{t('helping_title')}</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--green-700)', lineHeight: 1.6 }}>{t('helping_message')}</p>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   APPROVALS
───────────────────────────────────────── */
const Approvals = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [actionId, setActionId] = useState(null);

  const fetch = () => axiosClient.get('/admin/pending').then(r => setList(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const approve = async (id) => {
    if (!confirm(t('confirm_approve'))) return;
    setActionId(`approve-${id}`);
    await axiosClient.patch(`/admin/approve/${id}`, { status: 'approved', paymentVerified: true }).catch(() => alert('Error'));
    await fetch();
    setActionId(null);
  };
  const reject = async (id) => {
    if (!confirm(t('confirm_reject'))) return;
    setActionId(`reject-${id}`);
    await axiosClient.patch(`/admin/approve/${id}`, { status: 'rejected', paymentVerified: false }).catch(() => alert('Error'));
    await fetch();
    setActionId(null);
  };
  const remove = async (id) => {
    if (!confirm(t('confirm_delete'))) return;
    setActionId(`delete-${id}`);
    await axiosClient.delete(`/admin/users/${id}`).catch(() => alert('Error'));
    await fetch();
    setActionId(null);
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('action_required')}</h1>
          <p className="text-muted">{list.length} {list.length === 1 ? t('applications_count', { count: 1 }) : t('applications_count_plural', { count: list.length })}</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} weight="duotone" />
          <p>{t('all_caught_up')}</p>
        </div>
      ) : (
        <div className="card-list">
          {list.map(u => (
            <div className="data-card" key={u._id}>
              <div className="data-card-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  {u.imageUrl ? (
                    <img src={u.imageUrl} alt={u.name} style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    <div className="data-card-avatar">{u.name?.[0]?.toUpperCase() || '?'}</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div className="data-card-sub">{u.phone}</div>
                  </div>
                </div>
                <span className="badge badge-pending" style={{ flexShrink: 0 }}>{t('pending')}</span>
              </div>

              <div className="data-card-detail">
                <div className="data-card-detail-row">
                  <span className="data-card-detail-key">{t('nid')}</span>
                  <span className="data-card-detail-value font-mono">{u.nid || '–'}</span>
                </div>
                <div className="data-card-detail-row">
                  <span className="data-card-detail-key">{t('method')}</span>
                  <span className="data-card-detail-value">{u.payment?.method || '–'}</span>
                </div>
                <div className="data-card-detail-row">
                  <span className="data-card-detail-key">{t('trx_id')}</span>
                  <span className="data-card-detail-value font-mono">{u.payment?.transactionId || '–'}</span>
                </div>
              </div>

              <div className="data-card-actions">
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => approve(u._id)} disabled={actionId !== null}>
                  {actionId === `approve-${u._id}` ? <Spinner size={18} style={{animation: 'spin 1s linear infinite'}} /> : <CheckCircle size={18} weight="bold" />} {t('approve')}
                </button>
                <button className="btn btn-danger" onClick={() => reject(u._id)} title={t('reject')} disabled={actionId !== null}>
                  {actionId === `reject-${u._id}` ? <Spinner size={18} style={{animation: 'spin 1s linear infinite'}} /> : <XCircle size={18} weight="bold" />}
                </button>
                <button className="btn btn-ghost btn-icon" style={{ color: actionId !== null ? 'var(--text-muted)' : 'var(--danger)' }} onClick={() => remove(u._id)} title={t('delete')} disabled={actionId !== null}>
                  {actionId === `delete-${u._id}` ? <Spinner size={18} style={{animation: 'spin 1s linear infinite'}} /> : <Trash size={18} weight="bold" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   MEMBERS
───────────────────────────────────────── */
const Members = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', fatherName: '', nid: '', phone: '', paymentNumber: '', paymentMethod: 'bKash', trxId: '', password: '', image: null });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  
  const location = useLocation();
  const staffId = new URLSearchParams(location.search).get('staffId');

  const fetch = () => axiosClient.get('/admin/members').then(r => setList(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setEdit = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const filteredList = list.filter(m => {
    if (staffId && m.referredById !== staffId) return false;
    if (searchTerm) {
      const str = `${m.name} ${m.nid} ${m.phone} ${m.fatherName} ${m.email}`.toLowerCase();
      if (!str.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const openEdit = (m) => {
    setEditForm({ ...m, password: '' });
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...editForm };
      if (!data.password) delete data.password;
      await axiosClient.patch(`/admin/users/${data._id || data.id}`, data);
      setEditOpen(false);
      await fetch();
    } catch(err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await axiosClient.post('/admin/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOpen(false);
      setForm({ name: '', fatherName: '', nid: '', phone: '', paymentNumber: '', paymentMethod: 'bKash', trxId: '', password: '', image: null });
      await fetch();
    } catch(err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm(t('delete') + '?')) return;
    setActionId(`delete-${id}`);
    await axiosClient.delete(`/admin/users/${id}`).catch(() => alert('Error'));
    await fetch();
    setActionId(null);
  };

  return (
    <div className="fade-up">
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h1>{t('members_title')} {staffId && <span className="badge badge-primary">Filtered by Staff</span>}</h1>
          <p className="text-muted">{filteredList.length} {t('members')}</p>
          <div style={{ marginTop: 12, position: 'relative', maxWidth: 400 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Name, NID, Phone, or Father's Name..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)} style={{ marginTop: 8 }}>
          <Plus size={18} weight="bold" /> {t('add_member')}
        </button>
      </div>

      {filteredList.length === 0 ? (
        <div className="empty-state"><Users size={48} weight="duotone" /><p>{t('no_members')}</p></div>
      ) : (
        <div className="card-list">
          {filteredList.map(m => (
            <div className="data-card" key={m._id || m.id}>
              <div className="data-card-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt={m.name} style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    <div className="data-card-avatar">{m.name?.[0]?.toUpperCase()}</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                    <div className="data-card-sub">{m.phone} · {t('nid')}: <span className="font-mono">{m.nid || '–'}</span></div>
                    <div className="data-card-sub" style={{ marginTop: '4px' }}>
                      {m.fatherName ? `Father: ${m.fatherName} · ` : ''}
                      Email: {m.email || '–'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(m)} title="Edit" disabled={actionId !== null}>
                    <Pencil size={16} weight="bold" />
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => remove(m._id || m.id)} title="Delete" disabled={actionId !== null}>
                    {actionId === `delete-${m._id || m.id}` ? <Spinner size={16} style={{animation: 'spin 1s linear infinite'}} /> : <Trash size={16} weight="bold" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open} onClose={() => setOpen(false)}
        title={t('add_member')}
        panelIcon={<Users size={24} color="white" weight="duotone" />}
        panelTitle={t('add_member')}
        panelDesc={t('member_form_desc')}
        footer={
          <>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOpen(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" style={{ flex: 2 }} form="member-form" type="submit" disabled={saving}>
              {saving ? t('saving') : t('register_member')}
            </button>
          </>
        }>
        <form id="member-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          <div className="form-group">
            <label className="form-label">{t('full_name')} *</label>
            <input className="form-input" placeholder={t('as_per_nid')} value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('father_name')} *</label>
            <input className="form-input" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} required />
          </div>
          <div className="m-grid m-grid-2">
            <div className="form-group">
              <label className="form-label">{t('phone')} *</label>
              <input className="form-input" type="tel" placeholder="017-XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('nid')} *</label>
              <input className="form-input" value={form.nid} onChange={e => set('nid', e.target.value)} required />
            </div>
          </div>
          <div className="m-grid m-grid-2">
            <div className="form-group">
              <label className="form-label">{t('payment_method')} *</label>
              <select className="form-input" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('trx_id_label')} *</label>
              <input className="form-input" placeholder="TrxID" value={form.trxId} onChange={e => set('trxId', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')} *</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile_photo')} *</label>
            <ImageCapture onImageChange={(file) => set('image', file)} currentImage={null} />
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      {editForm && (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit Member"
          panelIcon={<Pencil size={24} color="white" weight="duotone" />}
          panelTitle="Edit Details"
          panelDesc="Update personal information, phone number, or reset password."
          footer={
            <>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditOpen(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t('full_name')} *</label>
              <input type="text" className="form-input" value={editForm.name} onChange={e => setEdit('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Father's / Husband's Name</label>
              <input type="text" className="form-input" value={editForm.fatherName || ''} onChange={e => setEdit('fatherName', e.target.value)} />
            </div>
            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('phone')} *</label>
                <input type="tel" className="form-input" value={editForm.phone} onChange={e => setEdit('phone', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('nid')}</label>
                <input type="text" className="form-input" value={editForm.nid || ''} onChange={e => setEdit('nid', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={editForm.email || ''} onChange={e => setEdit('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="form-input" value={editForm.address || ''} onChange={e => setEdit('address', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password (leave blank to keep current)</label>
              <input type="password" className="form-input" placeholder="********" value={editForm.password || ''} onChange={e => setEdit('password', e.target.value)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};



/* ─────────────────────────────────────────
   EDIT REQUESTS
───────────────────────────────────────── */
const EditRequests = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = () => axiosClient.get('/admin/edit-requests').then(r => setList(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const setEdit = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const openEdit = (user) => {
    setEditForm({ ...user, password: '' });
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...editForm };
      if (!data.password) delete data.password;
      await axiosClient.patch(`/admin/users/${data._id}`, data);
      setEditOpen(false);
      fetch();
    } catch(err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const dismiss = async (id) => {
    if (!confirm(t('confirm_dismiss') || 'Are you sure you want to clear this request?')) return;
    await axiosClient.patch(`/admin/edit-requests/${id}/dismiss`).catch(() => alert('Error'));
    fetch();
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('edit_requests') || 'Edit Requests'}</h1>
          <p className="text-muted">{list.length} pending</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><CheckCircle size={48} weight="duotone" /><p>{t('all_caught_up')}</p></div>
      ) : (
        <div className="card-list">
          {list.map(u => (
            <div className="data-card" key={u._id}>
              <div className="data-card-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div className="data-card-avatar">{u.name?.[0]?.toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div className="data-card-sub" style={{ whiteSpace: 'normal', color: 'var(--text-primary)', background: 'var(--surface)', padding: '8px', borderRadius: '8px', marginTop: '4px', border: '1px solid var(--border)' }}>
                      <strong>Requested Fixes:</strong> {u.editRequest?.requestedChanges?.explanation || 'None provided'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="data-card-actions" style={{ marginTop: '12px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => openEdit(u)}>
                  <Pencil size={18} weight="bold" /> Edit User
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => dismiss(u._id)}>
                  <CheckCircle size={18} weight="bold" /> Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Member Modal */}
      {editForm && (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit Member"
          panelIcon={<Pencil size={24} color="white" weight="duotone" />}
          panelTitle="Edit Details"
          panelDesc="Update personal information, phone number, or reset password."
          footer={
            <>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditOpen(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t('full_name')} *</label>
              <input type="text" className="form-input" value={editForm.name} onChange={e => setEdit('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Father's / Husband's Name</label>
              <input type="text" className="form-input" value={editForm.fatherName || ''} onChange={e => setEdit('fatherName', e.target.value)} />
            </div>
            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('phone')} *</label>
                <input type="tel" className="form-input" value={editForm.phone} onChange={e => setEdit('phone', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('nid')}</label>
                <input type="text" className="form-input" value={editForm.nid || ''} onChange={e => setEdit('nid', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={editForm.email || ''} onChange={e => setEdit('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="form-input" value={editForm.address || ''} onChange={e => setEdit('address', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password (leave blank to keep current)</label>
              <input type="password" className="form-input" placeholder="********" value={editForm.password || ''} onChange={e => setEdit('password', e.target.value)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   SURVEY FORM (House-to-House)
───────────────────────────────────────── */
const SurveyForm = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '', fathersName: '', wardNo: '', farmAnimals: '', farmableLand: '',
    houseType: 'tin_shed', familyMembers: '', gender: 'male', childrenBoy: '',
    childrenGirl: '', monthlyIncome: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/surveys', form);
      setSuccess(true);
      setForm({
        name: '', fathersName: '', wardNo: '', farmAnimals: '', farmableLand: '',
        houseType: 'tin_shed', familyMembers: '', gender: 'male', childrenBoy: '',
        childrenGirl: '', monthlyIncome: '', phone: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('house_house')}</h1>
          <p className="text-muted">{t('collect_data')}</p>
        </div>
      </div>

      <div className="card-list" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="data-card" style={{ padding: 20 }}>
          {success && (
            <div className="alert-success" style={{ marginBottom: 20 }}>
              <CheckCircle size={18} weight="fill" /> {t('success_survey')}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t('name_label')} *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('fathers_husband_label')}</label>
              <input className="form-input" value={form.fathersName} onChange={e => set('fathersName', e.target.value)} />
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('ward_label')} *</label>
                <input className="form-input" value={form.wardNo} onChange={e => set('wardNo', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('phone_label')} *</label>
                <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('house_type_label')}</label>
                <select className="form-input" value={form.houseType} onChange={e => set('houseType', e.target.value)}>
                  <option value="tin_shed">{t('tin_shed')}</option>
                  <option value="brick_built">{t('brick_built')}</option>
                  <option value="mud_house">{t('mud_house')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('gender_label')}</label>
                <select className="form-input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('family_members_label')}</label>
                <input className="form-input" type="number" value={form.familyMembers} onChange={e => set('familyMembers', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('income_label')}</label>
                <input className="form-input" type="number" value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} />
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('children_boy_label')}</label>
                <input className="form-input" type="number" value={form.childrenBoy} onChange={e => set('childrenBoy', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('children_girl_label')}</label>
                <input className="form-input" type="number" value={form.childrenGirl} onChange={e => set('childrenGirl', e.target.value)} />
              </div>
            </div>

            <div className="m-grid m-grid-2">
              <div className="form-group">
                <label className="form-label">{t('farm_animals_label')}</label>
                <input className="form-input" value={form.farmAnimals} onChange={e => set('farmAnimals', e.target.value)} placeholder="e.g. 2 Cows, 5 Hens" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('farmable_land_label')}</label>
                <input className="form-input" value={form.farmableLand} onChange={e => set('farmableLand', e.target.value)} placeholder="e.g. 10 Decimals" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ height: 48, marginTop: 10 }} disabled={loading}>
              {loading ? t('saving') : <><ClipboardText size={18} style={{ marginRight: 8 }} /> {t('submit_survey')}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   SURVEY DASHBOARD (Owner & Employee Results)
───────────────────────────────────────── */
const SurveyDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [list, setList] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/surveys?employeeId=${filter}`);
      setList(data);
      if (user.role === 'owner') {
        const { data: sData } = await axiosClient.get('/surveys/stats');
        setStats(sData);
      }
    } catch {
      alert('Error fetching survey data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const exportPDF = () => {
    const doc = new jsPDF('portrait');
    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.text('PBL SHEBA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Socio-Economic Survey Report', 105, 28, { align: 'center' });

    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-GB');
    doc.text(`Date of Export: ${dateStr}`, 14, 40);
    
    if (user.role === 'employee') {
       doc.text(`Collected By: ${user.name} (${user.phone})`, 14, 46);
    } else if (filter) {
       const emp = stats.find(s => s.id === filter);
       if (emp) doc.text(`Collected By: ${emp.name}`, 14, 46);
    }

    doc.text(`Total Records: ${list.length}`, 196, 40, { align: 'right' });

    const tableData = list.map((s, index) => [
      index + 1,
      `${s.name}\nPh: ${s.phone}`,
      `Ward: ${s.wardNo}\n${s.houseType.replace('_', ' ')}\n${s.farmableLand || '0'} decimals`,
      `Members: ${s.familyMembers}\nBoys: ${s.childrenBoy} Girls: ${s.childrenGirl}\nAnimals: ${s.farmAnimals || '0'}`,
      s.monthlyIncome ? `${s.monthlyIncome} TK` : '-',
    ]);

    if (typeof doc.autoTable !== 'function') {
      if (typeof autoTable === 'function' && autoTable.applyPlugin) {
        autoTable.applyPlugin(jsPDF);
      } else if (autoTable && autoTable.applyPlugin) {
        autoTable.applyPlugin(jsPDF);
      }
    }

    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['SL', 'Identity', 'Living Condition', 'Family Info', 'Monthly Income']],
        body: tableData,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 4, valign: 'middle' }
      });
    } else {
      const runAutoTable = typeof autoTable === 'function' ? autoTable : (autoTable.default || autoTable.autoTable);
      if (runAutoTable) {
        runAutoTable(doc, {
          head: [['SL', 'Identity', 'Living Condition', 'Family Info', 'Monthly Income']],
          body: tableData,
          startY: 55,
          theme: 'grid',
          headStyles: { fillColor: [46, 204, 113], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 4, valign: 'middle' }
        });
      }
    }

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`PBL Sheba Official Document - Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, {align: 'center'});
    }

    doc.save(`PBL_Sheba_Surveys_${dateStr.replace(/\//g,'-')}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(list.map(s => ({
      'SL': '',
      'Name': s.name,
      'Phone': s.phone,
      'Father/Husband': s.fathersName,
      'Ward No': s.wardNo,
      'House Type': s.houseType,
      'Family Members': s.familyMembers,
      'Monthly Income': s.monthlyIncome,
      'Gender': s.gender,
      'Boys': s.childrenBoy,
      'Girls': s.childrenGirl,
      'Animals': s.farmAnimals,
      'Farmable Land': s.farmableLand,
      'Submitted By': s.submittedBy?.name || 'Self',
      'Date': new Date(s.createdAt).toLocaleDateString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Surveys");
    XLSX.writeFile(wb, `PBL_Sheba_Surveys_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('survey_dashboard')} {user.role === 'employee' ? `(My Records)` : ''}</h1>
          <p className="text-muted">{list.length} {t('surveys')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={exportPDF}>
            <FileArrowDown size={18} /> PDF
          </button>
          <button className="btn btn-outline btn-sm" onClick={exportExcel}>
            <FileArrowDown size={18} /> XLSX
          </button>
        </div>
      </div>

      {/* Stats bar - ONLY For Owners */}
      {user.role === 'owner' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <span className="section-eyebrow-sm">{t('survey_stats')}</span>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, marginTop: 8 }}>
              {stats.map(s => (
                <div key={s.id} className={`stat-pill ${filter === s.id ? 'accent' : ''}`} 
                  onClick={() => setFilter(filter === s.id ? '' : s.id)}
                  style={{ flexShrink: 0, cursor: 'pointer', padding: '10px 16px' }}>
                  <p className="stat-label">{s.name}</p>
                  <p className="stat-value">{s.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <select className="form-input" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">{t('all_employees')}</option>
              {stats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </>
      )}

      {loading ? (
        <div className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />
      ) : (
        <div className="card-list">
          {list.map(s => (
            <div className="data-card" key={s.id} onClick={() => setSelectedSurvey(s)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div className="data-card-row">
                <div style={{ flex: 1 }}>
                  <div className="data-card-name">{s.name}</div>
                  <div className="data-card-sub">{s.phone} · Ward {s.wardNo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge badge-green" style={{ textTransform: 'capitalize' }}>{s.houseType.replace('_', ' ')}</div>
                  <div className="data-card-sub" style={{ marginTop: 4 }}>{t('family_members_label')}: {s.familyMembers}</div>
                </div>
              </div>
              <div className="data-card-detail" style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <div className="data-card-detail-row">
                  <span className="data-card-detail-key">Collected By</span>
                  <span className="data-card-detail-value" style={{ fontWeight: 600, color: 'var(--green)' }}>{s.submittedBy?.name || 'Self'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSurvey && (
        <Modal
          open={!!selectedSurvey} onClose={() => setSelectedSurvey(null)}
          title="Survey Details"
          panelIcon={<ClipboardText size={24} color="white" weight="duotone" />}
          panelTitle="Socio-Economic Data"
          panelDesc="Full submitted information for this record."
          footer={
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setSelectedSurvey(null)}>Close</button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Personal Identity</h4>
              <div className="ppc-info-grid" style={{ marginBottom: 0, gap: 12 }}>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Full Name</div>
                  <div className="ppc-info-value">{selectedSurvey.name}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Father / Husband</div>
                  <div className="ppc-info-value">{selectedSurvey.fathersName || '—'}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Contact Phone</div>
                  <div className="ppc-info-value">{selectedSurvey.phone}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Gender</div>
                  <div className="ppc-info-value" style={{textTransform:'capitalize'}}>{selectedSurvey.gender}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Housing & Family</h4>
              <div className="ppc-info-grid" style={{ marginBottom: 0, gap: 12 }}>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Ward No.</div>
                  <div className="ppc-info-value">{selectedSurvey.wardNo}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">House Type</div>
                  <div className="ppc-info-value" style={{textTransform:'capitalize'}}>{selectedSurvey.houseType.replace('_', ' ')}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Total Members</div>
                  <div className="ppc-info-value">{selectedSurvey.familyMembers || '0'}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Children (Boys / Girls)</div>
                  <div className="ppc-info-value">{selectedSurvey.childrenBoy || '0'} / {selectedSurvey.childrenGirl || '0'}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Socio-Economics</h4>
              <div className="ppc-info-grid" style={{ marginBottom: 0, gap: 12 }}>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Monthly Income</div>
                  <div className="ppc-info-value">{selectedSurvey.monthlyIncome ? `${selectedSurvey.monthlyIncome} TK` : '—'}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Farmable Land</div>
                  <div className="ppc-info-value">{selectedSurvey.farmableLand ? `${selectedSurvey.farmableLand} decimals` : '—'}</div>
                </div>
                <div className="ppc-info-item">
                  <div className="ppc-info-label">Farm Animals</div>
                  <div className="ppc-info-value">{selectedSurvey.farmAnimals || 'None'}</div>
                </div>
                <div className="ppc-info-item" style={{ background: 'var(--green-50)', borderColor: 'var(--green-200)' }}>
                  <div className="ppc-info-label" style={{ color: 'var(--green-800)' }}>Data Collected By</div>
                  <div className="ppc-info-value" style={{ color: 'var(--green-900)' }}>{selectedSurvey.submittedBy?.name || 'Self Registered'}</div>
                </div>
              </div>
            </div>

          </div>
        </Modal>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   EMPLOYEES
───────────────────────────────────────── */
const Employees = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '', nid: '', email: '', fatherName: '', address: '', image: null, currentImageUrl: null });
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfTarget, setPdfTarget] = useState(null);
  const idCardRef = useRef(null);

  useEffect(() => {
    if (pdfTarget && idCardRef.current && !generatingPdf) {
      handleDownloadPdf(pdfTarget);
    }
  }, [pdfTarget]);

  const handleDownloadPdf = async (emp) => {
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [400, canvas.height * (400 / canvas.width)]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 400, canvas.height * (400 / canvas.width));
      pdf.save(`${emp.name.replace(/ /g, '_')}_Staff_ID_Card.pdf`);
    } catch (err) {
      console.error('PDF error', err);
      alert('Failed to generate PDF.');
    } finally {
      setGeneratingPdf(false);
      setPdfTarget(null);
    }
  };
  const { user } = useAuthStore();

  const fetch = () => { if (user.role === 'owner') axiosClient.get('/admin/employees').then(r => setList(r.data)).catch(() => {}); };
  useEffect(() => { fetch(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm({ name: '', phone: '', password: '', nid: '', email: '', fatherName: '', address: '', image: null, currentImageUrl: null });
    setOpen(true);
  };

  const openEdit = (emp) => {
    setEditId(emp._id || emp.id);
    setForm({
      name: emp.name || '',
      phone: emp.phone || '',
      password: '',
      nid: emp.nid || '',
      email: emp.email || '',
      fatherName: emp.fatherName || '',
      address: emp.address || '',
      image: null,
      currentImageUrl: emp.imageUrl || null
    });
    setOpen(true);
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'disabled' ? 'approved' : 'disabled';
    if (!confirm(`Are you sure you want to ${newStatus === 'disabled' ? 'disable' : 'enable'} ${emp.name}?`)) return;
    setActionId(`toggle-${emp._id || emp.id}`);
    try {
      await axiosClient.patch(`/admin/users/${emp._id || emp.id}`, { status: newStatus });
      await fetch();
    } catch { alert('Error changing status'); }
    setActionId(null);
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && k !== 'currentImageUrl') fd.append(k, v);
      });

      if (editId) {
        if (!form.password) fd.delete('password');
        await axiosClient.patch(`/admin/users/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axiosClient.post('/admin/employees', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setOpen(false);
      await fetch();
    } catch(err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm(t('delete') + '?')) return;
    setActionId(`delete-${id}`);
    await axiosClient.delete(`/admin/users/${id}`).catch(() => alert('Error'));
    await fetch();
    setActionId(null);
  };

  if (user.role !== 'owner') return (
    <div className="fade-up">
      <div className="page-header"><h1>{t('employees_title')}</h1></div>
      <div style={{ padding: '20px', background: '#fef2f2', borderRadius: 'var(--radius-lg)', color: 'var(--danger)', fontWeight: 700 }}>{t('owner_only')}</div>
    </div>
  );

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('employees_title')}</h1>
          <p className="text-muted">{list.length} {t('employees')}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>
          <Plus size={18} weight="bold" /> {t('add_staff')}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><IdentificationCard size={48} weight="duotone" /><p>{t('no_staff')}</p></div>
      ) : (
        <div className="card-list">
          {list.map(e => (
            <div className="data-card" key={e._id || e.id}>
              <div className="data-card-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0, opacity: e.status === 'disabled' ? 0.5 : 1 }}>
                  <div className="data-card-avatar">{e.name?.[0]?.toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.name}
                      {e.status === 'disabled' && <span className="badge badge-red" style={{ marginLeft: 8 }}>Disabled</span>}
                    </div>
                    <div className="data-card-sub">{e.phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-icon btn-sm" onClick={() => toggleStatus(e)} title={e.status === 'disabled' ? 'Enable' : 'Disable'} disabled={actionId !== null}>
                    {actionId === `toggle-${e._id || e.id}` ? <Spinner size={16} style={{animation: 'spin 1s linear infinite'}} /> : (e.status === 'disabled' ? <CheckCircle size={16} weight="bold" /> : <XCircle size={16} weight="bold" />)}
                  </button>
                  <button className="btn btn-outline btn-icon btn-sm" onClick={() => setPdfTarget(e)} title="Download Staff PDF" disabled={generatingPdf || actionId !== null}>
                    {generatingPdf && pdfTarget && (pdfTarget._id === e._id || pdfTarget.id === e.id) ? <Spinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <DownloadSimple size={16} weight="bold" />}
                  </button>
                  <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(e)} disabled={actionId !== null}>
                    <Pencil size={16} weight="bold" />
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => remove(e._id || e.id)} disabled={actionId !== null}>
                    {actionId === `delete-${e._id || e.id}` ? <Spinner size={16} style={{animation: 'spin 1s linear infinite'}} /> : <Trash size={16} weight="bold" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open} onClose={() => setOpen(false)}
        title={editId ? 'Edit Staff' : t('add_staff')}
        panelIcon={<IdentificationCard size={24} color="white" weight="duotone" />}
        panelTitle={editId ? 'Edit Staff Details' : t('add_staff')}
        panelDesc={t('staff_form_desc')}
        footer={
          <>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOpen(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" style={{ flex: 2 }} form="emp-form" type="submit" disabled={saving}>
              {saving ? t('saving') : (editId ? 'Save Changes' : t('create_employee'))}
            </button>
          </>
        }>
        <form id="emp-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          <div className="m-grid m-grid-2">
            <div className="form-group">
              <label className="form-label">{t('full_name')} *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('father_name')}</label>
              <input className="form-input" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} />
            </div>
          </div>
          <div className="m-grid m-grid-2">
            <div className="form-group">
              <label className="form-label">{t('phone')} *</label>
              <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('email')}</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="m-grid m-grid-2">
            <div className="form-group">
              <label className="form-label">{t('nid')}</label>
              <input className="form-input" value={form.nid} onChange={e => set('nid', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('address')}</label>
              <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile_photo')}</label>
            <ImageCapture onImageChange={(file) => set('image', file)} currentImage={form.currentImageUrl} />
          </div>
          <div className="form-group">
            <label className="form-label">{editId ? 'New Password (leave blank to keep current)' : t('temp_password') + ' *'}</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required={!editId} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('temp_password_hint')}</span>
          </div>
        </form>
      </Modal>

      {pdfTarget && (
        <div className="idc-hide">
          <div ref={idCardRef} className="id-card-employee">
            <div className="idce-header">
              <div className="idce-title">PBL Sheba Somaj</div>
              <div className="idce-subtitle">Staff ID Card</div>
            </div>
            <div className="idce-body">
              <div className="idce-avatar">
                {pdfTarget.imageUrl ? (
                  <img src={pdfTarget.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                ) : (
                  pdfTarget.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="idce-name">{pdfTarget.name}</div>
              <div className="idce-status">Official Staff Member</div>
              
              <div className="idce-details">
                <div className="idce-row">
                  <div className="idce-label">Staff ID</div>
                  <div className="idce-value">{pdfTarget._id?.slice(-8).toUpperCase() || pdfTarget.id?.slice(-8).toUpperCase() || 'N/A'}</div>
                </div>
                <div className="idce-row">
                  <div className="idce-label">National ID</div>
                  <div className="idce-value">{pdfTarget.nid || '—'}</div>
                </div>
                {pdfTarget.fatherName && (
                <div className="idce-row">
                  <div className="idce-label">Father </div>
                  <div className="idce-value">{pdfTarget.fatherName}</div>
                </div>
                )}
                <div className="idce-row">
                  <div className="idce-label">Phone</div>
                  <div className="idce-value">{pdfTarget.phone || '—'}</div>
                </div>
              </div>
            </div>
            <div className="idce-footer">
              This is a digitally verified identity card.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   LEADERBOARD
───────────────────────────────────────── */
const Leaderboard = () => {
  const { t } = useTranslation();
  const [board, setBoard] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { axiosClient.get('/admin/leaderboard').then(r => setBoard(r.data)).catch(() => {}); }, []);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('rankings_title')}</h1>
          <p className="text-muted">{t('rankings_desc')}</p>
        </div>
      </div>
      {board.length === 0 ? (
        <div className="empty-state"><Trophy size={48} weight="duotone" /><p>{t('no_data')}</p></div>
      ) : (
        <div className="card-list">
          {board.map((emp, i) => (
            <div className="data-card" key={emp._id || emp.id} onClick={() => navigate(`/members?staffId=${emp._id || emp.id}`)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div className="data-card-row" style={{ alignItems: 'center' }}>
                <div style={{ fontSize: i < 3 ? '1.5rem' : '1rem', fontWeight: 800, color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', width: 36, flexShrink: 0, textAlign: 'center' }}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="data-card-name" style={{ textDecoration: 'underline', textDecorationColor: 'var(--border)' }}>{emp.name}</div>
                  <div className="data-card-sub">{emp.phone}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{emp.memberCount}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('members_label')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   SETTINGS
───────────────────────────────────────── */
const Settings = () => {
  const { t } = useTranslation();
  const [s, setS] = useState({ registrationFee: 365, employeeCanViewAll: false, paymentMethods: [] });
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  useEffect(() => { axiosClient.get('/admin/settings').then(r => setS(r.data)).catch(() => {}); }, []);

  const save = async () => { 
    setSaving(true);
    try { 
      await axiosClient.patch('/admin/settings', s); 
    } catch { alert('Error saving'); } 
    finally { setSaving(false); }
  };
  const updatePM = (i, k, v) => { const pms = [...s.paymentMethods]; pms[i][k] = v; setS({ ...s, paymentMethods: pms }); };
  const togglePM = (i) => updatePM(i, 'isActive', !s.paymentMethods[i].isActive);

  if (user.role !== 'owner') return (
    <div className="fade-up">
      <div className="page-header"><h1>{t('settings_title')}</h1></div>
      <div style={{ padding: '20px', background: '#fef2f2', borderRadius: 'var(--radius-lg)', color: 'var(--danger)', fontWeight: 700 }}>{t('owner_only_access')}</div>
    </div>
  );

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>{t('settings_title')}</h1>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <Spinner size={16} style={{animation: 'spin 1s linear infinite'}} /> : t('save_all')}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="data-card">
          <h3 style={{ color: 'var(--text-heading)', marginBottom: 4 }}>{t('general')}</h3>
          <p className="text-muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>{t('platform_policies')}</p>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">{t('reg_fee')}</label>
            <input className="form-input" type="number" value={s.registrationFee} onChange={e => setS({ ...s, registrationFee: +e.target.value })} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 20, height: 20, accentColor: 'var(--primary)' }} checked={s.employeeCanViewAll} onChange={e => setS({ ...s, employeeCanViewAll: e.target.checked })} />
            <span style={{ fontWeight: 600, color: 'var(--text-body)', fontSize: '0.95rem' }}>{t('employee_view_all')}</span>
          </label>
        </div>

        {s.paymentMethods?.map((pm, i) => (
          <div className="data-card" key={i} style={{ borderLeft: `4px solid ${pm.isActive ? (pm.themeColor || 'var(--primary)') : 'var(--border)'}`, opacity: pm.isActive ? 1 : 0.65 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: pm.themeColor || 'var(--primary)' }}>{pm.name}</h3>
              <button className={`btn btn-sm ${pm.isActive ? 'btn-outline' : 'btn-primary'}`} onClick={() => togglePM(i)}>
                {pm.isActive ? t('disable') : t('enable')}
              </button>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">{t('account_number')}</label>
              <input className="form-input" value={pm.number || ''} onChange={e => updatePM(i, 'number', e.target.value)} disabled={!pm.isActive} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('instructions')}</label>
              <textarea className="form-input" rows={2} value={pm.instructions || ''} onChange={e => updatePM(i, 'instructions', e.target.value)} disabled={!pm.isActive} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   STAFF PROFILE (MY ID)
───────────────────────────────────────── */
const StaffProfile = () => {
  const { user, token, login } = useAuthStore();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [updating, setUpdating] = useState(false);
  const idCardRef = useRef(null);

  if (!user) return null;

  const handleImageChange = async (file) => {
    if (!file) return;
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axiosClient.patch('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      login(data.user, token);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile picture");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [400, canvas.height * (400 / canvas.width)]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 400, canvas.height * (400 / canvas.width));
      pdf.save(`${user.name.replace(/ /g, '_')}_Staff_ID_Card.pdf`);
    } catch (err) {
      console.error('PDF error', err);
      alert('Failed to generate PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View your details and download your official staff ID card.</p>
        </div>
      </div>
      
      <div className="premium-profile-card">
        <div className="ppc-header"></div>
        <div className="ppc-body">
          <div className="ppc-avatar">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
            ) : (
              user.name?.[0]?.toUpperCase()
            )}
            {updating && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
                <Spinner size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}
          </div>
          
          <div style={{ maxWidth: '300px', margin: '0 auto 20px' }}>
            <ImageCapture onImageChange={handleImageChange} currentImage={null} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              Take a photo or choose from gallery to update your profile picture.
            </p>
          </div>

          <div className="ppc-name">{user.name}</div>
          <div className="ppc-role">{user.role === 'owner' ? 'System Administrator' : 'Official Staff Member'}</div>

          <div className="ppc-info-grid">
            <div className="ppc-info-item">
              <div className="ppc-info-label">Staff ID</div>
              <div className="ppc-info-value">{user._id?.slice(-8).toUpperCase() || user.id?.slice(-8).toUpperCase() || 'N/A'}</div>
            </div>
            <div className="ppc-info-item">
              <div className="ppc-info-label">Phone Number</div>
              <div className="ppc-info-value">{user.phone}</div>
            </div>
            <div className="ppc-info-item">
              <div className="ppc-info-label">National ID</div>
              <div className="ppc-info-value">{user.nid || '—'}</div>
            </div>
            <div className="ppc-info-item">
              <div className="ppc-info-label">Father's Name</div>
              <div className="ppc-info-value">{user.fatherName || '—'}</div>
            </div>
          </div>
          
          <button className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: '1rem' }} onClick={handleDownloadPdf} disabled={generatingPdf}>
            {generatingPdf ? <Spinner size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <DownloadSimple size={20} />}
            Download Official ID Card
          </button>
        </div>
      </div>

      <div className="idc-hide">
        <div ref={idCardRef} className="id-card-employee">
          <div className="idce-header">
            <div className="idce-title">PBL Sheba Somaj</div>
            <div className="idce-subtitle">Staff ID Card</div>
          </div>
          <div className="idce-body">
            <div className="idce-avatar">
              {user.imageUrl ? (
                <img src={user.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              ) : (
                user.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="idce-name">{user.name}</div>
            <div className="idce-status">{user.role === 'owner' ? 'Owner' : 'Official Staff Member'}</div>
            
            <div className="idce-details">
              <div className="idce-row">
                <div className="idce-label">Staff ID</div>
                <div className="idce-value">{user._id?.slice(-8).toUpperCase() || user.id?.slice(-8).toUpperCase() || 'N/A'}</div>
              </div>
              <div className="idce-row">
                <div className="idce-label">National ID</div>
                <div className="idce-value">{user.nid || '—'}</div>
              </div>
              {user.fatherName && (
              <div className="idce-row">
                <div className="idce-label">Father</div>
                <div className="idce-value">{user.fatherName}</div>
              </div>
              )}
              <div className="idce-row">
                <div className="idce-label">Phone</div>
                <div className="idce-value">{user.phone || '—'}</div>
              </div>
            </div>
          </div>
          <div className="idce-footer">
            This is a digitally verified identity card.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   LOGIN
───────────────────────────────────────── */
const Login = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', { phone, password });
      if (data.role !== 'owner' && data.role !== 'employee') { setErr(t('access_denied')); return; }
      login(data, data.token);
    } catch { setErr(t('login_failed')); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
        <LangToggle />
      </div>
      <div className="login-hero">
        <div className="login-icon-wrap"><Leaf size={28} color="white" weight="fill" /></div>
        <h1>PBL Sheba</h1>
        <p>{t('admin_subtitle')}</p>
      </div>
      <div className="login-body">
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{t('sign_in')}</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>{t('use_credentials')}</p>
        </div>
        {err && <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>{err}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">{t('phone_id')}</label>
            <input className="form-input" type="tel" placeholder="017-XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? t('signing_in') : t('sign_in')}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   FORCE PASSWORD RESET
───────────────────────────────────────── */
const ForceReset = () => {
  const { t } = useTranslation();
  const [pw, setPw] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { await axiosClient.patch('/users/change-password', { newPassword: pw }); alert('Updated!'); useAuthStore.getState().logout(); }
    catch { alert('Error'); }
  };
  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-icon-wrap"><ShieldCheck size={28} color="white" weight="fill" /></div>
        <h1>{t('security_check')}</h1>
        <p>{t('set_password_msg')}</p>
      </div>
      <div className="login-body">
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">{t('new_password')}</label>
            <input className="form-input" type="password" value={pw} onChange={e => setPw(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">{t('set_password')}</button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   APP ROOT
───────────────────────────────────────── */
export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Login />;
  if (user?.firstLogin) return <Router><Routes><Route path="*" element={<ForceReset />} /></Routes></Router>;

  return (
    <Router>
      <div className="admin-root">
        <Sidebar />
        <div className="admin-main">
          <TopBar />
          <main className="page-content">
            <Routes>
              <Route path="/"            element={user?.role === 'owner' ? <Dashboard /> : <Navigate to="/survey" replace />} />
              <Route path="/approvals"   element={<Approvals />} />
              <Route path="/members"     element={<Members />} />
              <Route path="/employees"   element={<Employees />} />
              <Route path="/survey"      element={<SurveyForm />} />
              <Route path="/survey-results" element={<SurveyDashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/settings"    element={<Settings />} />
              <Route path="/requests"    element={<EditRequests />} />
              <Route path="/profile"     element={<StaffProfile />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </div>
    </Router>
  );
}
