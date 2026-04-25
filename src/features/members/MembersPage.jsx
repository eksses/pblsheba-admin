import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Users, Plus, Pencil, FileArrowDown } from '@phosphor-icons/react';
import * as XLSX from 'xlsx';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import MemberCard from './components/MemberCard';
import MemberForm from './components/MemberForm';
import MemberEditForm from './components/MemberEditForm';
import Skeleton from '../../components/ui/Skeleton';

const MembersPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const location = useLocation();
  const staffId = new URLSearchParams(location.search).get('staffId');

  // State
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals & Action State
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Forms
  const emptyForm = { 
    name: '', fatherName: '', nid: '', phone: '', 
    paymentNumber: '', paymentMethod: 'bKash', 
    trxId: '', password: '', image: null 
  };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/members');
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(t('error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const onFormChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const onEditFormChange = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const filteredList = (Array.isArray(list) ? list : []).filter(m => {
    if (staffId && m.referredById !== staffId) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchTerm) {
      const str = `${m.name} ${m.nid} ${m.phone} ${m.fatherName}`.toLowerCase();
      return str.includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleEditOpen = (m) => {
    setEditForm({ ...m, password: '' });
    setEditOpen(true);
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await axiosClient.post('/admin/members', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      toast.success(t('success_register'));
      setAddOpen(false);
      setForm(emptyForm);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_register'));
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...editForm };
      if (!data.password) delete data.password;
      await axiosClient.patch(`/admin/users/${data._id || data.id}`, data);
      toast.success(t('success_update'));
      setEditOpen(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_update'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (filteredList.length === 0) {
      toast.error(t('no_data_to_export'));
      return;
    }

    const exportData = filteredList.map(m => ({
      [t('name')]: m.name,
      [t('phone')]: m.phone,
      [t('nid')]: m.nid,
      [t('father_name')]: m.fatherName,
      [t('status')]: t(m.status),
      [t('payment_method')]: m.paymentMethod,
      [t('transaction_id')]: m.trxId,
      [t('registered_at')]: new Date(m.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, `Members_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(t('export_success'));
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await axiosClient.delete(`/admin/users/${id}`);
      toast.success(t('success_delete'));
      fetchMembers();
    } catch (err) {
      toast.error(t('error_delete'));
    } finally {
      setActionId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h1>
            {t('members_title')} 
            {staffId && <span className="badge badge-primary" style={{ marginLeft: 8 }}>Filtered by Staff</span>}
          </h1>
          <p className="text-muted">{filteredList.length} {t('members')}</p>
          
          <div style={{ marginTop: 12, position: 'relative', maxWidth: 400 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder={t('search_placeholder')} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ width: '100%' }}
            />
          </div>

          <div className="filter-chips">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <div 
                key={s} 
                className={`chip ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {t(s) || s.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <FileArrowDown size={18} weight="bold" /> {t('export')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
            <Plus size={18} weight="bold" /> {t('add_member')}
          </button>
        </div>
      </div>

      {loading && list.length === 0 ? (
        <div className="card-list">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} height="80px" borderRadius="16px" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <Users size={48} weight="duotone" />
          <p>{t('no_members')}</p>
        </div>
      ) : (
        <div className="card-list">
          {filteredList.map(m => (
            <MemberCard 
              key={m._id || m.id}
              member={m}
              onEdit={handleEditOpen}
              onDelete={setConfirmDelete}
              actionId={actionId}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('add_member')}
        panelIcon={<Users size={24} color="white" weight="duotone" />}
        panelTitle={t('add_member')}
        panelDesc={t('member_form_desc')}
        footer={
          <>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setAddOpen(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitAdd} disabled={saving}>
              {saving ? t('saving') : t('register_member')}
            </button>
          </>
        }
      >
        <MemberForm form={form} onFieldChange={onFormChange} />
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t('edit_member')}
        panelIcon={<Pencil size={24} color="white" weight="duotone" />}
        panelTitle={t('edit_details')}
        panelDesc={t('member_edit_desc')}
        footer={
          <>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditOpen(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitEdit} disabled={saving}>
              {saving ? t('saving') : t('save_changes')}
            </button>
          </>
        }
      >
        <MemberEditForm form={editForm} onFieldChange={onEditFormChange} />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!confirmDelete}
        title={t('delete_title')}
        message={t('delete_msg', { name: confirmDelete?.name })}
        onConfirm={() => handleDelete(confirmDelete._id || confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default MembersPage;
