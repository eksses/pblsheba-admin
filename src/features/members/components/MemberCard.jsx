import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash } from '@phosphor-icons/react';
import Spinner from '../../../components/ui/Spinner';

const MemberCard = ({ member, onEdit, onDelete, actionId, t: tProp }) => {
  const { t: tHook } = useTranslation();
  const t = tProp || tHook;
  const id = member._id || member.id;

  return (
    <div className="data-card">
      <div className="data-card-row">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
          {member.imageUrl ? (
            <img 
              src={member.imageUrl} 
              alt={member.name} 
              style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover' }} 
            />
          ) : (
            <div className="data-card-avatar">{member.name?.[0]?.toUpperCase()}</div>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="data-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {member.name}
            </div>
            <div className="data-card-sub">
              {member.phone} · {t('nid')}: <span className="font-mono">{member.nid || '–'}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-outline btn-icon btn-sm" 
            onClick={() => onEdit(member)} 
            title="Edit"
          >
            <Pencil size={16} weight="bold" />
          </button>
          <button 
            className="btn btn-danger btn-icon btn-sm" 
            onClick={() => onDelete(member)} 
            title="Delete"
          >
            {actionId === id ? (
              <Spinner size={16} />
            ) : (
              <Trash size={16} weight="bold" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
