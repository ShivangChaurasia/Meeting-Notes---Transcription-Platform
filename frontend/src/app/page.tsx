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

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Basic mock parsing of transcript text
      const segments = newTranscript.split('\n').filter(l => l.trim()).map((line, i) => {
        // e.g. "00:00 - Sarah: Hello" -> fallback to just putting it all as text if format not found
        return {
          start_time: i * 10,
          end_time: (i + 1) * 10,
          speaker: "Speaker",
          text: line.trim()
        };
      });

      const newMeeting = await createMeeting({
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
      // optionally router.push(`/meetings/${newMeeting.id}`);
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

  return (
    <div className="page-container" style={{position: 'relative'}}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          background: toast.type === 'success' ? 'var(--success)' : 'var(--danger)',
          color: 'white', padding: '12px 20px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {toast.message}
        </div>
      )}

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', 
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{width: '500px', maxWidth: '90%'}}>
            <h2 className="section-title">New Meeting</h2>
            <form onSubmit={handleCreateMeeting} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '4px'}}>Title</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" style={{width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '4px'}}>Participants</label>
                <input required value={newParticipants} onChange={e => setNewParticipants(e.target.value)} type="text" style={{width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '4px'}}>Transcript Text (newline separated)</label>
                <textarea required value={newTranscript} onChange={e => setNewTranscript(e.target.value)} rows={5} style={{width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p style={{color: 'var(--text-secondary)'}}>Your recent recordings and notes</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <input 
            type="text" 
            placeholder="Search meetings..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)'}}
          />
          <button className="btn" onClick={() => setIsModalOpen(true)}>Create Meeting</button>
        </div>
      </div>

      {loading ? (
        <div>Loading meetings...</div>
      ) : (
        <div className="meetings-grid">
          {filtered.map(meeting => (
            <Link href={`/meetings/${meeting.id}`} key={meeting.id}>
              <div className="card meeting-card">
                <div className="meeting-title">{meeting.title}</div>
                <div className="meeting-meta">
                  <span className="badge">
                    {new Date(meeting.date).toLocaleDateString()}
                  </span>
                  <span>{Math.floor(meeting.duration / 60)} mins</span>
                </div>
                <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                  <strong>Participants:</strong> {meeting.participants}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && !loading && (
            <div>No meetings found.</div>
          )}
        </div>
      )}
    </div>
  );
}
