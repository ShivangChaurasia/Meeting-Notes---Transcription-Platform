"use client";

import { useEffect, useState } from 'react';
import { getMeetings } from '../../lib/api';
import { Meeting } from '../../lib/types';
import Link from 'next/link';

export default function ActionItemsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeetings().then(data => {
      setMeetings(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="page-container">Loading action items...</div>;

  const allActionItems = meetings.flatMap(m => 
    (m.action_items || []).map(ai => ({ ...ai, meetingTitle: m.title }))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Action Items</h1>
          <p style={{color: 'var(--text-secondary)'}}>All tasks across your meetings</p>
        </div>
      </div>
      
      <div className="card">
        {allActionItems.length === 0 ? (
          <p>No action items found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allActionItems.map(item => (
              <li key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={item.is_completed === 1} readOnly />
                <div style={{ flex: 1 }}>
                  <div style={{ textDecoration: item.is_completed === 1 ? 'line-through' : 'none', color: item.is_completed === 1 ? 'var(--text-secondary)' : 'inherit' }}>
                    {item.task}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Assignee: {item.assignee} • Meeting: <Link href={`/meetings/${item.meeting_id}`} style={{color: 'var(--accent-color)'}}>{item.meetingTitle}</Link>
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
