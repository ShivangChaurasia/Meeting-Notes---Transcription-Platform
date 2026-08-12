"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMeetings, createMeeting } from '../lib/api';
import { Meeting } from '../lib/types';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal state
  const [newTitle, setNewTitle] = useState('');
  const [newParticipants, setNewParticipants] = useState('');
  const [newTranscript, setNewTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fetchMeetings = () => {
    getMeetings().then(data => {
      // Sort meetings by date descending
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMeetings(sorted);
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

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const segments = newTranscript.split('\n').filter(l => l.trim()).map((line, i) => {
        return {
          start_time: i * 10,
          end_time: (i + 1) * 10,
          speaker: i % 2 === 0 ? "Host" : "Guest",
          text: line.trim()
        };
      });

      await createMeeting({
        title: newTitle || 'Untitled Meeting',
        duration: segments.length * 10,
        participants: newParticipants || 'Unknown',
        segments: segments as any
      });
      
      setIsModalOpen(false);
      setNewTitle('');
      setNewParticipants('');
      setNewTranscript('');
      fetchMeetings();
      showToast('Meeting created successfully!', 'success');
    } catch (err) {
      showToast('Error creating meeting', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = meetings.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.participants.toLowerCase().includes(search.toLowerCase())
  );

  // Statistics calculation
  const totalMeetings = meetings.length;
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.action_items?.length || 0), 0);
  const recentMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return meetingDate >= sevenDaysAgo;
  }).length;

  return (
    <div className="page-container" style={{position: 'relative'}}>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{width: '500px', maxWidth: '90%', margin: '20px'}}>
            <h2 className="section-title">Record New Meeting</h2>
            <form onSubmit={handleCreateMeeting} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500, color: 'var(--text-secondary)'}}>Meeting Title</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" className="search-input" style={{borderRadius: '8px', padding: '10px 16px'}} placeholder="e.g. Q3 Product Roadmap" />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500, color: 'var(--text-secondary)'}}>Participants (comma separated)</label>
                <input required value={newParticipants} onChange={e => setNewParticipants(e.target.value)} type="text" className="search-input" style={{borderRadius: '8px', padding: '10px 16px'}} placeholder="Alice, Bob, Charlie" />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500, color: 'var(--text-secondary)'}}>Transcript Text (newline separated)</label>
                <textarea required value={newTranscript} onChange={e => setNewTranscript(e.target.value)} rows={6} className="search-input" style={{borderRadius: '8px', padding: '12px 16px', resize: 'vertical', fontFamily: 'inherit'}} placeholder="Paste meeting transcript here..." />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p style={{color: 'var(--text-secondary)', marginTop: '4px'}}>Your recent recordings and notes</p>
        </div>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <div className="search-container">
            <svg className="search-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              className="search-input"
              placeholder="Search meetings..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Record Meeting
          </button>
        </div>
      </div>

      {!loading && (
        <div className="stats-grid">
          <div className="card stat-card">
            <span className="stat-title">Total Meetings</span>
            <span className="stat-value">{totalMeetings}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-title">Total Action Items</span>
            <span className="stat-value">{totalActionItems}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-title">Recent (Last 7 Days)</span>
            <span className="stat-value">{recentMeetings}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>
          <div style={{width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading your workspace...
        </div>
      ) : (
        <div className="meetings-grid">
          {filtered.map(meeting => (
            <Link href={`/meetings/${meeting.id}`} key={meeting.id}>
              <div className="card meeting-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div className="meeting-title">{meeting.title}</div>
                </div>
                
                <div className="participant-avatars">
                  {meeting.participants.split(',').slice(0, 3).map((p, i) => (
                    <div key={i} className="avatar" title={p.trim()}>
                      {p.trim().charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {meeting.participants.split(',').length > 3 && (
                    <div className="avatar" style={{background: 'var(--surface-hover)', color: 'var(--text-secondary)'}}>
                      +{meeting.participants.split(',').length - 3}
                    </div>
                  )}
                </div>

                <div className="meeting-meta" style={{marginTop: 'auto'}}>
                  <span className="badge">
                    {new Date(meeting.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                  </span>
                  <span>{Math.floor(meeting.duration / 60)} mins</span>
                  {meeting.action_items && meeting.action_items.length > 0 && (
                    <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-color)'}}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                      {meeting.action_items.length}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{margin: '0 auto 16px', opacity: 0.5}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p>No meetings found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
