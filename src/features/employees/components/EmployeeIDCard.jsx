import React, { forwardRef } from 'react';

const EmployeeIDCard = forwardRef(({ employee }, ref) => {
  if (!employee) return null;

  const staffId = employee._id?.slice(-8).toUpperCase() || employee.id?.slice(-8).toUpperCase() || 'N/A';

  return (
    <div className="idc-hide">
      <div ref={ref} className="id-card-employee">
        <div className="idce-header">
          <div className="idce-title">PBL Sheba Somaj</div>
          <div className="idce-subtitle">Staff ID Card</div>
        </div>
        <div className="idce-body">
          <div className="idce-avatar">
            {employee.imageUrl ? (
              <img 
                src={employee.imageUrl} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
                alt={employee.name}
              />
            ) : (
              employee.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="idce-name">{employee.name}</div>
          <div className="idce-status">Official Staff Member</div>
          
          <div className="idce-details">
            <div className="idce-row">
              <div className="idce-label">Staff ID</div>
              <div className="idce-value">{staffId}</div>
            </div>
            <div className="idce-row">
              <div className="idce-label">National ID</div>
              <div className="idce-value">{employee.nid || '—'}</div>
            </div>
            {employee.fatherName && (
              <div className="idce-row">
                <div className="idce-label">Father</div>
                <div className="idce-value">{employee.fatherName}</div>
              </div>
            )}
            <div className="idce-row">
              <div className="idce-label">Phone</div>
              <div className="idce-value">{employee.phone || '—'}</div>
            </div>
          </div>
        </div>
        <div className="idce-footer">
          This is a digitally verified identity card.
        </div>
      </div>
    </div>
  );
});

EmployeeIDCard.displayName = 'EmployeeIDCard';

export default EmployeeIDCard;
