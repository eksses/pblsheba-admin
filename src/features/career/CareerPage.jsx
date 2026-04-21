import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, XCircle, CheckCircle } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/ui/Spinner';
import ApplicationCard from './components/ApplicationCard';
import ApplicationDetails from './components/ApplicationDetails';

const CareerPage = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [note, setNote] = useState('');
  const [confirmData, setConfirmData] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/career/applications');
      setList(data);
    } catch {
      toast.error(t('error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionId(`${status}-${id}`);
    try {
      await axiosClient.patch(`/admin/career/applications/${id}`, { 
        status, 
        statusNote: note 
      });
      toast.success(t('success_status_update'));
      setSelected(null);
      setNote('');
      fetchApplications();
    } catch { 
      toast.error(t('error_status_update'));
    } finally {
      setActionId(null);
      setConfirmData(null);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('career_applications_title') || 'Job Applications'}</h1>
          <p className="text-muted">
            {list.length} {t('submissions_received') || 'submissions received'}
          </p>
        </div>
      </div>

      {loading && list.length === 0 ? (
        <div className="shimmer" style={{ height: 400, borderRadius: 20 }} />
      ) : list.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} weight="duotone" />
          <p>{t('no_applications') || 'No applications received yet.'}</p>
        </div>
      ) : (
        <div className="card-list">
          {list.map(a => (
            <ApplicationCard 
              key={a.id || a._id} 
              application={a} 
              onClick={setSelected} 
            />
          ))}
        </div>
      )}

      {/* Details View Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={t('application_details') || 'Application Details'}
        panelIcon={<Briefcase size={24} color="white" weight="duotone" />}
        panelTitle={t('review_application') || 'Review Application'}
        panelDesc={t('review_app_desc') || 'Carefully review all details before approving or rejecting candidate.'}
        footer={
          selected && selected.status === 'pending' ? (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }} 
                onClick={() => setConfirmData({ id: selected.id || selected._id, status: 'rejected' })} 
                disabled={actionId !== null}
              >
                {actionId === `rejected-${selected.id || selected._id}` ? (
                  <Spinner size={18} />
                ) : (
                  <XCircle size={18} />
                )} 
                {t('reject')}
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2 }} 
                onClick={() => setConfirmData({ id: selected.id || selected._id, status: 'approved' })} 
                disabled={actionId !== null}
              >
                {actionId === `approved-${selected.id || selected._id}` ? (
                  <Spinner size={18} />
                ) : (
                  <CheckCircle size={18} />
                )} 
                {t('approve')}
              </button>
            </div>
          ) : (
            <button className="btn btn-outline btn-full" onClick={() => setSelected(null)}>
              {t('close')}
            </button>
          )
        }
      >
        <ApplicationDetails 
          application={selected} 
          note={note} 
          onNoteChange={setNote} 
        />
      </Modal>

      {/* Confirm Status Change */}
      <ConfirmModal
        open={!!confirmData}
        title={confirmData?.status === 'approved' ? t('approve_title') : t('reject_title')}
        message={
          confirmData?.status === 'approved' 
            ? t('approve_app_confirm') || 'Are you sure you want to approve this application?' 
            : t('reject_app_confirm') || 'Are you sure you want to reject this application?'
        }
        onConfirm={() => handleUpdateStatus(confirmData.id, confirmData.status)}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
};

export default CareerPage;
