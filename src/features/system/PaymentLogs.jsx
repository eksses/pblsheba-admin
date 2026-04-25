import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Clock, Checks, WarningCircle } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

const PaymentLogs = () => {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/payments/sms');
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(t('error_fetch_logs') || 'Failed to fetch payment logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1>{t('payment_logs_title') || 'Payment SMS Logs'}</h1>
          <p className="text-muted">{t('unprocessed_sms_desc') || 'Recent unprocessed transaction messages from automated systems'}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchLogs} disabled={loading}>
          {loading ? <Spinner size={14} /> : <Clock size={18} />} {t('refresh') || 'Refresh'}
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('sender') || 'Sender'}</th>
                  <th>{t('transaction_id') || 'TrxID'}</th>
                  <th>{t('amount') || 'Amount'}</th>
                  <th>{t('date') || 'Date'}</th>
                  <th>{t('status') || 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {loading && list.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>
                      <Spinner size={24} />
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 60 }}>
                      <div className="empty-state">
                        <Receipt size={48} weight="duotone" />
                        <p>{t('no_unprocessed_sms') || 'No unprocessed payment SMS found'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  list.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="badge badge-info">{item.sender}</span>
                        </div>
                      </td>
                      <td><span className="mono" style={{ fontWeight: 700 }}>{item.parsed?.trxId || 'N/A'}</span></td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--green)' }}>
                          {item.parsed?.amount || '0'} BDT
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-warning">
                          <WarningCircle size={14} /> {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentLogs;
