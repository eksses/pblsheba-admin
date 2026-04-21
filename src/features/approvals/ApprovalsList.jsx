import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Trash } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/ui/Spinner';

const ApprovalsList = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/pending');
      setList(data);
    } catch (err) {
      toast.error(t('error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, type) => {
    setActionId(id);
    try {
      if (type === 'delete') {
        await axiosClient.delete(`/admin/users/${id}`);
        toast.success(t('success_delete'));
      } else {
        const status = type === 'approve' ? 'approved' : 'rejected';
        const paymentVerified = type === 'approve';
        await axiosClient.patch(`/admin/approve/${id}`, { status, paymentVerified });
        toast.success(t(type === 'approve' ? 'success_approve' : 'success_reject'));
      }
      fetchPending();
    } catch (err) {
      toast.error(t(`error_${type}`));
    } finally {
      setActionId(null);
      setConfirmData(null);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('action_required')}</h1>
          <p className="text-muted">
            {list.length} {list.length === 1 ? t('applications_count', { count: 1 }) : t('applications_count_plural', { count: list.length })}
          </p>
        </div>
      </div>

      {loading ? (
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
                <span className="badge badge-pending">{t('pending')}</span>
              </div>

              <div className="data-card-detail">
                <div className="data-card-detail-row">
                  <span className="data-card-detail-key">{t('nid')}</span>
                  <span className="data-card-detail-value font-mono">{u.nid || '—'}</span>
                </div>
                <div className="data-card-detail-row">
                  <span className="data-card-detail-key">{t('method')}</span>
                  <span className="data-card-detail-value">{u.payment?.method || '—'}</span>
                </div>
                <div className="data-card-detail-row">
                  <span className="data-card-detail-key">{t('trx_id')}</span>
                  <span className="data-card-detail-value font-mono">{u.payment?.transactionId || '—'}</span>
                </div>
              </div>

              <div className="data-card-actions">
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }} 
                  onClick={() => setConfirmData({ type: 'approve', id: u._id, name: u.name })}
                  disabled={actionId !== null}
                >
                  {actionId === u._id ? <Spinner size={18} /> : <CheckCircle size={18} weight="bold" />} 
                  {t('approve')}
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setConfirmData({ type: 'reject', id: u._id, name: u.name })} 
                  title={t('reject')}
                  disabled={actionId !== null}
                >
                  {actionId === u._id ? <Spinner size={18} /> : <XCircle size={18} weight="bold" />}
                </button>
                <button 
                  className="btn btn-ghost btn-icon" 
                  style={{ color: actionId !== null ? 'var(--text-muted)' : 'var(--danger)' }} 
                  onClick={() => setConfirmData({ type: 'delete', id: u._id, name: u.name })} 
                  title={t('delete')}
                  disabled={actionId !== null}
                >
                  {actionId === u._id ? <Spinner size={18} /> : <Trash size={18} weight="bold" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirmData}
        title={
          confirmData?.type === 'approve' ? t('approve_title') : 
          confirmData?.type === 'reject' ? t('reject_title') : t('delete_title')
        }
        message={
          confirmData?.type === 'approve' ? t('approve_msg', { name: confirmData.name }) : 
          confirmData?.type === 'reject' ? t('reject_msg', { name: confirmData.name }) : 
          t('delete_msg', { name: confirmData?.name })
        }
        onConfirm={() => handleAction(confirmData.id, confirmData.type)}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
};

export default ApprovalsList;
