import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileArrowDown, ClipboardText } from '@phosphor-icons/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import SurveyCard from './components/SurveyCard';
import SurveyDetails from './components/SurveyDetails';

const SurveyDashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [generating, setGenerating] = useState(false);

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
      toast.error(t('error_fetch_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const exportPDF = () => {
    setGenerating(true);
    toast.info(t('starting_pdf_export'));
    
    try {
      const doc = new jsPDF('portrait');
      
      // Header
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

      // Table Data
      const tableData = list.map((s, index) => [
        index + 1,
        `${s.name}\nPh: ${s.phone}`,
        `Ward: ${s.wardNo}\n${s.houseType.replace('_', ' ')}\n${s.farmableLand || '0'} decimals`,
        `Members: ${s.familyMembers}\nBoys: ${s.childrenBoy} Girls: ${s.childrenGirl}\nAnimals: ${s.farmAnimals || '0'}`,
        s.monthlyIncome ? `${s.monthlyIncome} TK` : '-',
      ]);

      // Apply AutoTable
      autoTable(doc, {
        head: [['SL', 'Identity', 'Living Condition', 'Family Info', 'Monthly Income']],
        body: tableData,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 4, valign: 'middle' }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`PBL Sheba Official Document - Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      const fileName = `PBL_Sheba_Surveys_${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      toast.success(t('pdf_export_success'));
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error(t('pdf_export_error'));
    } finally {
      setGenerating(false);
    }
  };

  const exportExcel = () => {
    toast.info(t('starting_excel_export'));
    try {
      const ws = XLSX.utils.json_to_sheet(list.map(s => ({
        'SL': '',
        'Name': s.name,
        'Phone': s.phone,
        'Father/Husband': s.fathersName,
        'Ward': s.wardNo,
        'House Type': s.houseType,
        'Animals': s.farmAnimals,
        'Farmable Land': s.farmableLand,
        'Submitted By': s.submittedBy?.name || 'Self',
        'Date': new Date(s.createdAt).toLocaleDateString()
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Surveys");
      const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
      XLSX.writeFile(wb, `PBL_Sheba_Surveys_${dateStr}.xlsx`);
      toast.success(t('excel_export_success'));
    } catch (err) {
      console.error('Excel Export Error:', err);
      toast.error(t('excel_export_error'));
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('survey_dashboard')} {user.role === 'employee' ? `(My Records)` : ''}</h1>
          <p className="text-muted">{list.length} {t('surveys')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={exportPDF} disabled={generating}>
            <FileArrowDown size={18} /> PDF
          </button>
          <button className="btn btn-outline btn-sm" onClick={exportExcel}>
            <FileArrowDown size={18} /> XLSX
          </button>
        </div>
      </div>

      {user.role === 'owner' && (
        <div style={{ marginBottom: 24 }}>
          <span className="section-eyebrow-sm">{t('survey_stats')}</span>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, marginTop: 8 }}>
            <div 
              className={`stat-pill ${filter === '' ? 'accent' : ''}`}
              onClick={() => setFilter('')}
              style={{ flexShrink: 0, cursor: 'pointer', padding: '10px 16px' }}
            >
              <p className="stat-label">{t('all_employees')}</p>
              <p className="stat-value">{list.length}</p>
            </div>
            {stats.map(s => (
              <div 
                key={s.id} 
                className={`stat-pill ${filter === s.id ? 'accent' : ''}`} 
                onClick={() => setFilter(s.id)}
                style={{ flexShrink: 0, cursor: 'pointer', padding: '10px 16px' }}
              >
                <p className="stat-label">{s.name}</p>
                <p className="stat-value">{s.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />
      ) : (
        <div className="card-list">
          {list.map(s => (
            <SurveyCard 
              key={s.id || s._id} 
              survey={s} 
              onClick={setSelectedSurvey} 
            />
          ))}
        </div>
      )}

      {/* Survey Details Modal */}
      <Modal
        open={!!selectedSurvey}
        onClose={() => setSelectedSurvey(null)}
        title={t('survey_details') || 'Survey Details'}
        panelIcon={<ClipboardText size={24} color="white" weight="duotone" />}
        panelTitle={t('socio_economic_data') || 'Socio-Economic Data'}
        panelDesc={t('survey_details_desc') || 'Full submitted information for this record.'}
        footer={
          <button className="btn btn-outline btn-full" onClick={() => setSelectedSurvey(null)}>
            {t('close')}
          </button>
        }
      >
        <SurveyDetails survey={selectedSurvey} />
      </Modal>
    </div>
  );
};

export default SurveyDashboardPage;
