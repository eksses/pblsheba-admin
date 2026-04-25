import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Pencil } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import MemberEditForm from './components/MemberEditForm';

const EditRequestsPage = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [confirmDismiss, setConfirmDismiss] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/edit-requests');
      setList(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t('error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onEditFieldChange = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const handleEditOpen = (user) => {
    setEditForm({ ...user, password: '' });
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...editForm };
      if (!data.password) delete data.password;
      await axiosClient.patch(`/admin/users/${data._id}`, data);
      toast.success(t('success_update'));
      setEditOpen(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || t('error_update'));
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = async (id) => {
    setActionId(id);
    try {
      await axiosClient.patch(`/admin/edit-requests/${id}/dismiss`);
      toast.success(t('success_dismiss'));
      fetchRequests();
    } catch {
      toast.error(t('error_dismiss'));
    } finally {
      setActionId(null);
      setConfirmDismiss(null);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('edit_requests') || 'Edit Requests'}</h1>
          <p className="text-muted">{list.length} pending</p>
        </div>
      </div>

      {loading && list.length === 0 ? (
        <div className="shimmer" style={{ height: 200, borderRadius: 20 }} />
      ) : list.length === 0 ? (
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
                  <div className="data-card-avatar">{u.name?.[0]?.toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name}
                    </div>
                    <div 
                      className="data-card-sub" 
                      style={{ 
                        whiteSpace: 'normal', 
                        color: 'var(--text-main)', 
                        background: 'var(--grey-50)', 
                        padding: '10px 12px', 
                        borderRadius: '8px', 
                        marginTop: '8px', 
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: 4, color: 'var(--primary)' }}>
                        Requested Changes:
                      </strong> 
                      {u.editRequest?.requestedChanges?.explanation || 'None provided'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="data-card-actions" style={{ marginTop: '16px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }} 
                  onClick={() => handleEditOpen(u)}
                >
                  <Pencil size={18} weight="bold" /> Edit User
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => setConfirmDismiss(u._id)}
                >
                  <CheckCircle size={18} weight="bold" /> Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Resolve Edit Request"
        panelIcon={<Pencil size={24} color="white" weight="duotone" />}
        panelTitle="Apply Corrections"
        panelDesc="Update user data based on their requested changes."
        footer={
          <>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditOpen(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitEdit} disabled={saving}>
              {saving ? t('saving') : t('save_changes')}
            </button>
          </>
        }
      >
        <MemberEditForm form={editForm} onFieldChange={onEditFieldChange} />
      </Modal>

      {/* Dismiss Confirmation */}
      <ConfirmModal
        open={!!confirmDismiss}
        title={t('dismiss_request_title') || 'Dismiss Request'}
        message={t('dismiss_request_msg') || 'Are you sure you want to dismiss this edit request?'}
        onConfirm={() => handleDismiss(confirmDismiss)}
        onCancel={() => setConfirmDismiss(null)}
      />
    </div>
  );
};

export default EditRequestsPage;
