import React from 'react';
import { useTranslation } from 'react-i18next';
import DetailRow from '../../../components/ui/DetailRow';

const ApplicationDetails = ({ application, note, onNoteChange }) => {
  const { t } = useTranslation();
  if (!application) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Basic header info */}
      <div 
        style={{ 
          display: 'flex', 
          gap: 20, 
          alignItems: 'center', 
          padding: 15, 
          background: 'var(--grey-50)', 
          borderRadius: 12 
        }}
      >
        <img 
          src={application.photoUrl} 
          alt="Candidate" 
          style={{ 
            width: 100, 
            height: 100, 
            borderRadius: 10, 
            objectFit: 'cover', 
            border: '2px solid white', 
            boxShadow: 'var(--shadow-sm)' 
          }} 
        />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{application.nameEn}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 700 }}>
              {application.postAppliedFor}
            </p>
            <div className={`badge badge-${application.status || 'pending'}`}>
              {application.status || 'pending'}
            </div>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Applied on {new Date(application.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="m-grid m-grid-2">
        <div>
          <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 12, color: 'var(--primary)' }}>
            Personal Bio
          </h4>
          <DetailRow label="Name (Bengali)" value={application.nameBn} />
          <DetailRow label="Father's Name" value={application.fatherName} />
          <DetailRow label="Mother's Name" value={application.motherName} />
          <DetailRow label="NID" value={application.nid} />
          <DetailRow label="Age / DOB" value={`${application.age || '—'} years (${application.dob})`} />
          <DetailRow label="Marital Status" value={application.maritalStatus} />
          <DetailRow label="Spouse Name" value={application.spouseName} />
        </div>
        <div>
          <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 12, color: 'var(--primary)' }}>
            Contact & Financial
          </h4>
          <DetailRow label="Mobile" value={application.mobile} />
          <DetailRow label="Email" value={application.email} />
          <DetailRow label="Mobile Banking" value={`${application.mobileBankingType}: ${application.mobileBankingNumber}`} />
          <DetailRow label="Present Address" value={application.presentAddress} />
          <DetailRow label="Permanent Address" value={application.permanentAddress} />
        </div>
      </div>

      <div>
        <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 12, color: 'var(--primary)' }}>
          Education
        </h4>
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--grey-50)', textAlign: 'left' }}>
              <th style={{ padding: 6, border: '1px solid var(--border)' }}>Exam</th>
              <th style={{ padding: 6, border: '1px solid var(--border)' }}>Subject</th>
              <th style={{ padding: 6, border: '1px solid var(--border)' }}>Result</th>
              <th style={{ padding: 6, border: '1px solid var(--border)' }}>Year</th>
            </tr>
          </thead>
          <tbody>
            {(application.education || []).map((e, idx) => (
              <tr key={idx}>
                <td style={{ padding: 6, border: '1px solid var(--border)' }}>{e.examName}</td>
                <td style={{ padding: 6, border: '1px solid var(--border)' }}>{e.subject}</td>
                <td style={{ padding: 6, border: '1px solid var(--border)' }}>{e.result}</td>
                <td style={{ padding: 6, border: '1px solid var(--border)' }}>{e.passingYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 12, color: 'var(--primary)' }}>
          Nominee Details
        </h4>
        <div className="m-grid m-grid-2">
          <DetailRow label="Name" value={application.nomineeName} />
          <DetailRow label="Mobile" value={application.nomineeMobile} />
          <DetailRow label="Relationship" value={application.nomineeRelationship} />
          <DetailRow label="Address" value={application.nomineeAddress} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ marginBottom: 10 }}>Signature</h4>
          <img 
            src={application.signatureUrl} 
            alt="Signature" 
            style={{ 
              width: '100%', 
              maxHeight: 100, 
              objectFit: 'contain', 
              background: 'white', 
              border: '1px solid var(--border)', 
              borderRadius: 8 
            }} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ marginBottom: 10 }}>Status Note</h4>
          <textarea 
            className="form-input" 
            placeholder="Add a note (e.g. why rejected/approved)..." 
            value={note} 
            onChange={e => onNoteChange(e.target.value)} 
            disabled={application.status !== 'pending'} 
            rows={3} 
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
