import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  ChartBarHorizontal, Users, IdentificationCard, ShieldCheck,
  Trash, Gear, Trophy, Plus, X, CheckCircle, XCircle, SignOut,
  Leaf, HandHeart, Money, WarningCircle, DotsThree, Pencil
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import axiosClient from './api/axiosClient';
import { useAuthStore } from './store/useAuthStore';
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
  { to: '/leaderboard',icon: Trophy,             key: 'leaderboard' },
  { to: '/settings',   icon: Gear,               key: 'settings'    },
  { to: '/requests',   icon: HandHeart,          key: 'edit_requests'},
];
const EMPLOYEE_PRIMARY = [
  { to: '/',       icon: ChartBarHorizontal, key: 'dashboard' },
  { to: '/members',icon: Users,              key: 'members'   },
];
const EMPLOYEE_MORE = [];

const ALL_SIDEBAR_NAV = [...OWNER_PRIMARY, ...OWNER_MORE];

/* ─────────────────────────────────────────
   SIDEBAR (Desktop ≥768px)
───────────────────────────────────────── */
const Sidebar = () => {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const navItems = user?.role === 'owner' ? ALL_SIDEBAR_NAV : EMPLOYEE_PRIMARY;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <div className="sidebar-icon-wrap"><Leaf size={18} color="white" weight="fill" /></div>
          <h2>{t('brand_name')}</h2>
        </div>
        <p>{t('brand_tagline')}</p>
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
      <div className="top-bar-brand">
        <div className="top-bar-icon"><Leaf size={15} color="white" weight="fill" /></div>
        {t('brand_name')}
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
  const [m, setM] = useState({ totalMembers: 0, totalEmployees: 0, pendingApprovals: 0, totalCollected: 0 });
  useEffect(() => { axiosClient.get('/admin/dashboard').then(r => setM(r.data)).catch(() => {}); }, []);

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
  const fetch = () => axiosClient.get('/admin/pending').then(r => setList(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const approve = async (id) => {
    if (!confirm(t('confirm_approve'))) return;
    await axiosClient.patch(`/admin/approve/${id}`, { status: 'approved', paymentVerified: true }).catch(() => alert('Error'));
    fetch();
  };
  const reject = async (id) => {
    if (!confirm(t('confirm_reject'))) return;
    await axiosClient.patch(`/admin/approve/${id}`, { status: 'rejected', paymentVerified: false }).catch(() => alert('Error'));
    fetch();
  };
  const remove = async (id) => {
    if (!confirm(t('confirm_delete'))) return;
    await axiosClient.delete(`/admin/users/${id}`).catch(() => alert('Error'));
    fetch();
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
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => approve(u._id)}>
                  <CheckCircle size={18} weight="bold" /> {t('approve')}
                </button>
                <button className="btn btn-danger" onClick={() => reject(u._id)} title={t('reject')}>
                  <XCircle size={18} weight="bold" />
                </button>
                <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => remove(u._id)} title={t('delete')}>
                  <Trash size={18} weight="bold" />
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
  const [form, setForm] = useState({ name: '', fatherName: '', nid: '', phone: '', paymentNumber: '', paymentMethod: 'bKash', trxId: '', password: '', image: null });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const fetch = () => axiosClient.get('/admin/members').then(r => setList(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setEdit = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const openEdit = (m) => {
    setEditForm({ ...m, password: '' });
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

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await axiosClient.post('/admin/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOpen(false);
      setForm({ name: '', fatherName: '', nid: '', phone: '', paymentNumber: '', paymentMethod: 'bKash', trxId: '', password: '', image: null });
      fetch();
    } catch(err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm(t('delete') + '?')) return;
    await axiosClient.delete(`/admin/users/${id}`).catch(() => alert('Error'));
    fetch();
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('members_title')}</h1>
          <p className="text-muted">{list.length} {t('members')}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
          <Plus size={18} weight="bold" /> {t('add_member')}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><Users size={48} weight="duotone" /><p>{t('no_members')}</p></div>
      ) : (
        <div className="card-list">
          {list.map(m => (
            <div className="data-card" key={m._id}>
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
                  <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(m)} title="Edit">
                    <Pencil size={16} weight="bold" />
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => remove(m._id)} title="Delete">
                    <Trash size={16} weight="bold" />
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
            <input className="form-input" type="file" accept="image/*" style={{ padding: 12, cursor: 'pointer' }} onChange={e => set('image', e.target.files[0])} required />
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
   EMPLOYEES
───────────────────────────────────────── */
const Employees = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', nid: '', email: '', fatherName: '', address: '' });
  const { user } = useAuthStore();

  const fetch = () => { if (user.role === 'owner') axiosClient.get('/admin/employees').then(r => setList(r.data)).catch(() => {}); };
  useEffect(() => { fetch(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await axiosClient.post('/admin/employees', form);
      setOpen(false);
      setForm({ name: '', phone: '', password: '', nid: '', email: '', fatherName: '', address: '' });
      fetch();
    } catch(err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm(t('delete') + '?')) return;
    await axiosClient.delete(`/admin/users/${id}`).catch(() => alert('Error'));
    fetch();
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
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
          <Plus size={18} weight="bold" /> {t('add_staff')}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><IdentificationCard size={48} weight="duotone" /><p>{t('no_staff')}</p></div>
      ) : (
        <div className="card-list">
          {list.map(e => (
            <div className="data-card" key={e._id}>
              <div className="data-card-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div className="data-card-avatar">{e.name?.[0]?.toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                    <div className="data-card-sub">{e.phone}</div>
                  </div>
                </div>
                <button className="btn btn-danger btn-icon btn-sm" onClick={() => remove(e._id)}>
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open} onClose={() => setOpen(false)}
        title={t('add_staff')}
        panelIcon={<IdentificationCard size={24} color="white" weight="duotone" />}
        panelTitle={t('add_staff')}
        panelDesc={t('staff_form_desc')}
        footer={
          <>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOpen(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" style={{ flex: 2 }} form="emp-form" type="submit" disabled={saving}>
              {saving ? t('saving') : t('create_employee')}
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
            <label className="form-label">{t('temp_password')} *</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('temp_password_hint')}</span>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ─────────────────────────────────────────
   LEADERBOARD
───────────────────────────────────────── */
const Leaderboard = () => {
  const { t } = useTranslation();
  const [board, setBoard] = useState([]);
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
            <div className="data-card" key={emp._id}>
              <div className="data-card-row" style={{ alignItems: 'center' }}>
                <div style={{ fontSize: i < 3 ? '1.5rem' : '1rem', fontWeight: 800, color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', width: 36, flexShrink: 0, textAlign: 'center' }}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="data-card-name">{emp.name}</div>
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
  const { user } = useAuthStore();
  useEffect(() => { axiosClient.get('/admin/settings').then(r => setS(r.data)).catch(() => {}); }, []);

  const save = async () => { try { await axiosClient.patch('/admin/settings', s); alert('Saved!'); } catch { alert('Error saving'); } };
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
        <button className="btn btn-primary btn-sm" onClick={save}>{t('save_all')}</button>
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
              <Route path="/"            element={<Dashboard />} />
              <Route path="/approvals"   element={<Approvals />} />
              <Route path="/members"     element={<Members />} />
              <Route path="/employees"   element={<Employees />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/settings"    element={<Settings />} />
              <Route path="/requests"    element={<EditRequests />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </div>
    </Router>
  );
}
