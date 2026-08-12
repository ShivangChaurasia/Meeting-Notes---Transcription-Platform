"use client";

import { useEffect, useState } from 'react';
import { getMeetings, updateActionItem } from '../../lib/api';
import { Meeting } from '../../lib/types';
import Link from 'next/link';

export default function ActionItemsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchMeetings = () => {
    getMeetings().then(data => {
      setMeetings(data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };

  const handleActionToggle = async (meetingId: number, aiId: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await updateActionItem(aiId, newStatus === 1);
      
      // Update local state
      setMeetings(prevMeetings => prevMeetings.map(m => {
        if (m.id === meetingId) {
          return {
            ...m,
            action_items: m.action_items.map(ai => 
              ai.id === aiId ? { ...ai, is_completed: newStatus } : ai
            )
          };
        }
        return m;
      }));
      
      showToast('Action item updated', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update action item', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>
        <div style={{width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
        Loading tasks...
      </div>
    );
  }

  const allActionItems = meetings.flatMap(m => 
    (m.action_items || []).map(ai => ({ ...ai, meetingTitle: m.title, meetingId: m.id }))
  );

  return (
    <div className="page-container">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
      
      <div className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <h1 className="page-title">Action Items</h1>
          <p style={{color: 'var(--text-secondary)', marginTop: '4px'}}>All tasks across your meetings</p>
        </div>
      </div>
      
      <div className="card" style={{padding: '0'}}>
        {allActionItems.length === 0 ? (
          <div style={{padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{margin: '0 auto 16px', opacity: 0.5}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            <p>No action items found.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allActionItems.map((item, index) => (
              <li key={item.id} className={`action-item ${item.is_completed ? 'completed' : ''}`} style={{ 
                padding: '20px 24px', 
                borderBottom: index === allActionItems.length - 1 ? 'none' : '1px solid var(--border-color)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                background: item.is_completed ? 'var(--bg-color)' : 'transparent',
                transition: 'background 0.2s ease'
              }}>
                <input 
                  type="checkbox" 
                  className="action-checkbox"
                  checked={item.is_completed === 1} 
                  onChange={() => handleActionToggle(item.meetingId, item.id, item.is_completed)}
                  style={{transform: 'scale(1.2)'}}
                />
                <div style={{ flex: 1 }}>
                  <div className="action-task" style={{fontSize: '1.05rem', fontWeight: 500}}>
                    {item.task}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="action-assignee" style={{fontSize: '0.75rem', padding: '2px 8px'}}>@{item.assignee}</span>
                    <span>&bull;</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                      <Link href={`/meetings/${item.meetingId}`} style={{color: 'var(--text-secondary)', transition: 'color 0.2s'}} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        {item.meetingTitle}
                      </Link>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
