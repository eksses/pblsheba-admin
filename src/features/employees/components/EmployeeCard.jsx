import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Pencil, Trash, FilePdf } from '@phosphor-icons/react';
import Spinner from '../../../components/ui/Spinner';

const EmployeeCard = ({ employee, actionId, onToggleStatus, onEdit, onDownloadPdf, onDelete, generatingPdf }) => {
  const { t } = useTranslation();
  const id = employee._id || employee.id;
  const isDisabled = employee.status === 'disabled';

  return (
    <div className="data-card">
      <div className="data-card-row">
        <div 
          style={{ 
            display: 'flex', 
            gap: 12, 
            alignItems: 'center', 
            flex: 1, 
            minWidth: 0, 
            opacity: isDisabled ? 0.5 : 1 
          }}
        >
          <div className="data-card-avatar">
            {employee.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {employee.name}
              {isDisabled && (
                <span className="badge badge-red" style={{ marginLeft: 8 }}>
                  {t('disabled')}
                </span>
              )}
            </div>
            <div className="data-card-sub">{employee.phone}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {/* Status Toggle */}
          <button 
            className="btn btn-outline btn-icon btn-sm" 
            onClick={() => onToggleStatus(employee)} 
            title={isDisabled ? t('enable') : t('disable')}
            disabled={actionId !== null}
          >
            {actionId === id ? (
              <Spinner size={16} />
            ) : (
              isDisabled ? <CheckCircle size={16} weight="bold" /> : <XCircle size={16} weight="bold" />
            )}
          </button>

          {/* ID Card PDF */}
          <button 
            className="btn btn-outline btn-icon btn-sm" 
            onClick={() => onDownloadPdf(employee)} 
            title={t('download_staff_pdf')}
            disabled={generatingPdf || actionId !== null}
          >
            {generatingPdf ? <Spinner size={16} /> : <FilePdf size={16} weight="bold" />}
          </button>

          {/* Edit */}
          <button 
            className="btn btn-outline btn-icon btn-sm" 
            onClick={() => onEdit(employee)} 
            title={t('edit')}
            disabled={actionId !== null}
          >
            <Pencil size={16} weight="bold" />
          </button>

          {/* Delete */}
          <button 
            className="btn btn-danger btn-icon btn-sm" 
            onClick={() => onDelete(employee)} 
            title={t('delete')}
            disabled={actionId !== null}
          >
            {actionId === id ? <Spinner size={16} /> : <Trash size={16} weight="bold" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
