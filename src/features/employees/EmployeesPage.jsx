import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, IdentificationCard } from '@phosphor-icons/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/ui/Spinner';

import EmployeeCard from './components/EmployeeCard';
import EmployeeForm from './components/EmployeeForm';
import EmployeeIDCard from './components/EmployeeIDCard';

const EmployeesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  
  // Modals & Forms
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const emptyForm = { 
    name: '', phone: '', password: '', nid: '', email: '', 
    fatherName: '', address: '', image: null, currentImageUrl: null 
  };
  const [form, setForm] = useState(emptyForm);

  // PDF Generation
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfTarget, setPdfTarget] = useState(null);
  const idCardRef = useRef(null);

  const fetchEmployees = async () => {
    if (user.role !== 'owner') return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/employees');
      setList(data);
    } catch {
      toast.error(t('error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user.role]);

  // Handle PDF auto-generation when target is set
  useEffect(() => {
    if (pdfTarget && idCardRef.current && !generatingPdf) {
      handleDownloadPdf(pdfTarget);
    }
  }, [pdfTarget]);

  const onFieldChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
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

  const handleToggleStatus = async (emp) => {
    const id = emp._id || emp.id;
    const newStatus = emp.status === 'disabled' ? 'active' : 'disabled';
    setActionId(id);
    try {
      await axiosClient.patch(`/admin/users/${id}`, { status: newStatus });
      toast.success(t('success_status_update'));
      fetchEmployees();
    } catch { 
      toast.error(t('error_status_update'));
    } finally {
      setActionId(null);
      setConfirmData(null);
    }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await axiosClient.delete(`/admin/users/${id}`);
      toast.success(t('success_delete'));
      fetchEmployees();
    } catch { 
      toast.error(t('error_delete'));
    } finally {
      setActionId(null);
      setConfirmData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && k !== 'currentImageUrl') fd.append(k, v);
      });

      if (editId) {
        if (!form.password) fd.delete('password');
        await axiosClient.patch(`/admin/users/${editId}`, fd, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        toast.success(t('success_update'));
      } else {
        await axiosClient.post('/admin/employees', fd, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        toast.success(t('success_create_staff'));
      }
      setOpen(false);
      fetchEmployees();
    } catch(err) { 
      toast.error(err.response?.data?.message || t('error_save')); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDownloadPdf = async (emp) => {
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      });
      const imgData = canvas.toDataURL('image/png');
      const pdfHeight = canvas.height * (400 / canvas.width);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [400, pdfHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 400, pdfHeight);
      pdf.save(`${emp.name.replace(/ /g, '_')}_Staff_ID_Card.pdf`);
      toast.success(t('id_card_downloaded'));
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error(t('error_id_card_pdf'));
    } finally {
      setGeneratingPdf(false);
      setPdfTarget(null);
    }
  };

  if (user.role !== 'owner') {
    return (
      <div className="fade-up">
        <div className="page-header"><h1>{t('employees_title')}</h1></div>
        <div className="alert-danger" style={{ fontWeight: 700 }}>
          {t('owner_only')}
        </div>
      </div>
    );
  }

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

      {loading && list.length === 0 ? (
        <div className="shimmer" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
      ) : list.length === 0 ? (
        <div className="empty-state">
          <IdentificationCard size={48} weight="duotone" />
          <p>{t('no_staff')}</p>
        </div>
      ) : (
        <div className="card-list">
          {list.map(e => (
            <EmployeeCard 
              key={e._id || e.id}
              employee={e}
              actionId={actionId}
              generatingPdf={generatingPdf && pdfTarget?._id === e._id}
              onToggleStatus={(emp) => setConfirmData({ type: 'toggle', emp })}
              onEdit={openEdit}
              onDownloadPdf={setPdfTarget}
              onDelete={(emp) => setConfirmData({ type: 'delete', id: emp._id || emp.id, name: emp.name })}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? t('edit_staff') : t('add_staff')}
        panelIcon={<IdentificationCard size={24} color="white" weight="duotone" />}
        panelTitle={editId ? t('edit_details') : t('add_staff')}
        panelDesc={editId ? t('staff_edit_desc') : t('staff_form_desc')}
        footer={
          <>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOpen(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={saving}>
              {saving ? t('saving') : (editId ? t('save_changes') : t('create_staff'))}
            </button>
          </>
        }
      >
        <EmployeeForm form={form} onFieldChange={onFieldChange} isEdit={!!editId} />
      </Modal>

      {/* Action confirmation modals */}
      <ConfirmModal
        open={!!confirmData}
        title={confirmData?.type === 'toggle' ? (confirmData.emp?.status === 'disabled' ? t('enable_title') : t('disable_title')) : t('delete_title')}
        message={confirmData?.type === 'toggle' ? (confirmData.emp?.status === 'disabled' ? t('enable_msg', { name: confirmData.emp?.name }) : t('disable_msg', { name: confirmData.emp?.name })) : t('delete_msg', { name: confirmData?.name })}
        onConfirm={() => {
          if (confirmData.type === 'toggle') handleToggleStatus(confirmData.emp);
          else if (confirmData.type === 'delete') handleDelete(confirmData.id);
        }}
        onCancel={() => setConfirmData(null)}
      />

      {/* Hidden ID Card Template for PDF Capture */}
      <EmployeeIDCard ref={idCardRef} employee={pdfTarget} />
    </div>
  );
};

export default EmployeesPage;
