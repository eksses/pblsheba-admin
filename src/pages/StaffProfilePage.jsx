import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadSimple } from '@phosphor-icons/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import ImageCapture from '../components/ImageCapture';
import EmployeeIDCard from '../features/employees/components/EmployeeIDCard';

const StaffProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const { t } = useTranslation();
  const toast = useToast();
  
  const [updating, setUpdating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const idCardRef = useRef();

  const handleImageChange = async (file) => {
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axiosClient.post('/admin/profile/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser({ ...user, imageUrl: data.imageUrl });
      toast.success(t('profile_image_updated'));
    } catch (err) {
      toast.error(t('error_update_image'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    toast.info(t('generating_id_card'));
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
      pdf.save(`${user.name.replace(/ /g, '_')}_Staff_ID_Card.pdf`);
      toast.success(t('id_card_downloaded'));
    } catch (err) {
      console.error('PDF error', err);
      toast.error(t('error_id_card_pdf'));
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('my_profile') || 'My Profile'}</h1>
          <p className="text-muted">
            {t('profile_desc') || 'View your details and download your official staff ID card.'}
          </p>
        </div>
      </div>
      
      <div className="premium-profile-card">
        <div className="ppc-header"></div>
        <div className="ppc-body">
          <div className="ppc-avatar">
            {user.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
              />
            ) : (
              user.name?.[0]?.toUpperCase()
            )}
            {updating && (
              <div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(255,255,255,0.7)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: 'inherit' 
                }}
              >
                <Spinner size={24} />
              </div>
            )}
          </div>
          
          <div style={{ maxWidth: '300px', margin: '0 auto 20px' }}>
            <ImageCapture onImageChange={handleImageChange} currentImage={null} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              {t('profile_photo_instructions') || 'Take a photo or choose from gallery to update your profile picture.'}
            </p>
          </div>

          <div className="ppc-name">{user.name}</div>
          <div className="ppc-role">
            {user.role === 'owner' ? 'System Administrator' : 'Official Staff Member'}
          </div>

          <div className="ppc-info-grid">
            <div className="ppc-info-item">
              <div className="ppc-info-label">Staff ID</div>
              <div className="ppc-info-value">
                {user._id?.slice(-8).toUpperCase() || user.id?.slice(-8).toUpperCase() || 'N/A'}
              </div>
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
          
          <button 
            className="btn btn-primary btn-full" 
            style={{ padding: '14px', fontSize: '1rem' }} 
            onClick={handleDownloadPdf} 
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <Spinner size={20} />
            ) : (
              <DownloadSimple size={20} weight="bold" />
            )}
            <span style={{ marginLeft: 8 }}>
              {t('download_id_card') || 'Download Official ID Card'}
            </span>
          </button>
        </div>
      </div>

      {/* Hidden ID Card template for PDF Capture */}
      <EmployeeIDCard ref={idCardRef} employee={user} />
    </div>
  );
};

export default StaffProfilePage;
